const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Protect routes - verify JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found.");
    }

    if (req.user.isBlocked) {
      res.status(403);
      throw new Error("Your account has been blocked. Contact support.");
    }

    next();
  } catch (error) {
    console.log("JWT verification failed:", error);
    res.status(401);
    throw new Error("Not authorized. Token invalid.");
  }
});

// Role-based access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Role '${req.user.role}' is not authorized to access this route.`,
      );
    }
    next();
  };
};

// Seller approval check
const approvedSeller = asyncHandler(async (req, res, next) => {
  if (req.user.role === "seller" && !req.user.isApproved) {
    res.status(403);
    throw new Error("Your seller account is pending approval.");
  }
  next();
});

module.exports = { protect, authorize, approvedSeller };
