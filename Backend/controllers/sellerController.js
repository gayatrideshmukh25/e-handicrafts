const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");

// @desc    Seller dashboard stats
const getDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [totalProducts, orders, reviews] = await Promise.all([
    Product.countDocuments({ seller: sellerId, isActive: true }),
    Order.find({ "items.seller": sellerId }),
    Review.find().populate({ path: "product", match: { seller: sellerId } }),
  ]);

  const validReviews = reviews.filter((r) => r.product);
  const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => {
    const sellerItems = o.items.filter(
      (i) => i.seller?.toString() === sellerId.toString(),
    );
    return sum + sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
  }, 0);

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalOrders: orders.length,
      totalRevenue,
      totalSales: deliveredOrders.length,
      totalReviews: validReviews.length,
    },
  });
});

// @desc    Get seller reviews with product info + pending reviews count
// @route   GET /api/seller/reviews
const getMyReviews = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  // All seller products
  const products = await Product.find({
    seller: sellerId,
    isActive: true,
  }).select("_id name images category ratings");
  const productIds = products.map((p) => p._id);

  // All reviews for these products
  const reviews = await Review.find({ product: { $in: productIds } })
    .populate("user", "name avatar")
    .populate("product", "name images category ratings")
    .populate("order", "_id createdAt")
    .sort({ createdAt: -1 });

  // Build a map: productId -> reviews
  const reviewsByProduct = {};
  for (const p of products) {
    reviewsByProduct[p._id.toString()] = {
      product: p,
      reviews: [],
      reviewCount: 0,
      avgRating: p.ratings?.average || 0,
    };
  }
  for (const r of reviews) {
    const pid = r.product?._id?.toString();
    if (pid && reviewsByProduct[pid]) {
      reviewsByProduct[pid].reviews.push(r);
      reviewsByProduct[pid].reviewCount++;
    }
  }

  // Products with NO reviews
  const productsWithNoReview = products.filter((p) => {
    const data = reviewsByProduct[p._id.toString()];
    return data && data.reviewCount === 0;
  });

  res.json({
    success: true,
    reviews,
    byProduct: Object.values(reviewsByProduct),
    productsWithNoReview,
    totalReviews: reviews.length,
  });
});

module.exports = { getDashboard, getMyReviews };
