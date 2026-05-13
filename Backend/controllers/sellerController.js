const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");

// @desc    Get seller dashboard stats
// @route   GET /api/seller/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [totalProducts, orders, reviews] = await Promise.all([
    Product.countDocuments({ seller: sellerId, isActive: true }),
    Order.find({ "items.seller": sellerId }),
    Review.find().populate({ path: "product", match: { seller: sellerId } }),
  ]);

  const validReviews = reviews.filter((r) => r.product);
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus === "delivered")
    .reduce((sum, o) => {
      const sellerItems = o.items.filter(
        (i) => i.seller?.toString() === sellerId.toString(),
      );
      return sum + sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
    }, 0);

  const totalSales = orders.filter((o) => o.orderStatus === "delivered").length;

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalSales,
      totalReviews: validReviews.length,
    },
  });
});

// @desc    Get seller's reviews
// @route   GET /api/seller/reviews
const getMyReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).select("_id");
  const productIds = products.map((p) => p._id);

  const reviews = await Review.find({ product: { $in: productIds } })
    .populate("user", "name avatar")
    .populate("product", "name images")
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

module.exports = { getDashboard, getMyReviews };
