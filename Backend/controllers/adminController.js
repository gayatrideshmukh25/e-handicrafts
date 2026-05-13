const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");

// @desc    Get analytics
// @route   GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, totalProducts, totalOrders, revenueData] =
    await Promise.all([
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
    ]);

  const totalRevenue = revenueData[0]?.total || 0;

  // Orders by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyOrders = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$grandTotal" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Category distribution
  const categoryStats = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyOrders,
      categoryStats,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "buyer" }).sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc    Get all sellers
// @route   GET /api/admin/sellers
const getSellers = asyncHandler(async (req, res) => {
  const sellers = await User.find({ role: "seller" }).sort({ createdAt: -1 });
  res.json({ success: true, sellers });
});

// @desc    Toggle user block
// @route   PUT /api/admin/users/:id/block
const toggleBlock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({
    success: true,
    message: user.isBlocked ? "User blocked" : "User unblocked",
    user,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

// @desc    Approve/reject seller
// @route   PUT /api/admin/sellers/:id/approve
const approveSeller = asyncHandler(async (req, res) => {
  const seller = await User.findById(req.params.id);
  if (!seller || seller.role !== "seller") {
    res.status(404);
    throw new Error("Seller not found");
  }
  seller.isApproved = req.body.approve !== false;
  await seller.save();
  res.json({
    success: true,
    message: seller.isApproved ? "Seller approved" : "Seller rejected",
    seller,
  });
});

// @desc    Get all products (admin)
// @route   GET /api/admin/products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("seller", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, products });
});

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, {
    isActive: false,
  });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, message: "Product removed" });
});

// @desc    Get all reviews (admin)
// @route   GET /api/admin/reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("product", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

// @desc    Delete review (admin)
// @route   DELETE /api/admin/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  res.json({ success: true, message: "Review deleted" });
});

module.exports = {
  getAnalytics,
  getUsers,
  getSellers,
  toggleBlock,
  deleteUser,
  approveSeller,
  getAllProducts,
  deleteProduct,
  getAllReviews,
  deleteReview,
};
