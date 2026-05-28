const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
  // cors({
  //   origin: process.env.CLIENT_URL || "http://localhost:3000",
  //   credentials: true,
  // }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/seller", require("./routes/sellerRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "E-Handicrafts API is running" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
