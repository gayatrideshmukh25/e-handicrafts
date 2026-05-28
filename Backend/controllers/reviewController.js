const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .populate("order", "_id")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

// @desc    Check if user can review a product (bought & delivered, not reviewed yet)
// @route   GET /api/reviews/can-review/:orderId/:productId
const canReview = asyncHandler(async (req, res) => {
  const { orderId, productId } = req.params;

  // Order must belong to user and be delivered
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    orderStatus: "delivered",
    "items.product": productId,
  });

  if (!order) {
    return res.json({
      success: true,
      canReview: false,
      reason: "Order not delivered yet or product not in this order",
    });
  }

  // Already reviewed?
  const existing = await Review.findOne({
    product: productId,
    user: req.user._id,
    order: orderId,
  });
  if (existing) {
    return res.json({
      success: true,
      canReview: false,
      reason: "Already reviewed",
      review: existing,
    });
  }

  res.json({ success: true, canReview: true });
});

// @desc    Add review (only for delivered orders)
// @route   POST /api/reviews
const addReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, comment } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error("You can only review products from your delivered orders");
  }
  // console.log(
  //   req.user._id,
  //   "Attempting to add review for product:",
  //   new mongoose.Types.ObjectId(productId),
  //   "order:",
  //   new mongoose.Types.ObjectId(orderId),
  // );
  // Verify the order is delivered and belongs to this user and contains this product
  const order = await Order.findOne({
    _id: new mongoose.Types.ObjectId(orderId),
    user: req.user._id,
    orderStatus: "delivered",
    "items.product": new mongoose.Types.ObjectId(productId),
  });
  console.log("Order found for review:", order);
  if (!order) {
    res.status(403);
    throw new Error("You can only review products from your delivered orders");
  }

  // Check if already reviewed this product for this order
  const existing = await Review.findOne({
    product: productId,
    user: req.user._id,
    order: orderId,
  });
  if (existing) {
    res.status(400);
    throw new Error("You have already reviewed this product for this order");
  }
  console.log(
    "Order verification passed, checking product existence...",
    productId,
  );
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: orderId,
    rating: Number(rating),
    comment,
  });

  const populated = await Review.findById(review._id)
    .populate("user", "name avatar")
    .populate("order", "_id");

  res.status(201).json({ success: true, review: populated });
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  review.rating = req.body.rating || review.rating;
  review.comment = req.body.comment || review.comment;
  await review.save();

  const populated = await Review.findById(review._id).populate(
    "user",
    "name avatar",
  );
  res.json({ success: true, review: populated });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate("product");
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isSeller =
    req.user.role === "seller" &&
    review.product?.seller?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isSeller && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Review deleted" });
});

// @desc    Seller reply to review
// @route   PUT /api/reviews/:id/reply
const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate("product");
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  if (review.product.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  review.sellerReply = req.body.reply;
  await review.save();
  res.json({ success: true, review });
});

// @desc    Get all reviewable items for a buyer (delivered order items not yet reviewed)
// @route   GET /api/reviews/pending
const getPendingReviews = asyncHandler(async (req, res) => {
  const deliveredOrders = await Order.find({
    user: req.user._id,
    orderStatus: "delivered",
  }).populate("items.product", "name images category");

  // Get all reviews by this user
  const myReviews = await Review.find({ user: req.user._id }).select(
    "product order",
  );

  const reviewed = new Set(myReviews.map((r) => `${r.product}_${r.order}`));

  const pending = [];
  for (const order of deliveredOrders) {
    for (const item of order.items) {
      const key = `${item.product?._id}_${order._id}`;
      if (!reviewed.has(key) && item.product) {
        pending.push({
          orderId: order._id,
          orderDate: order.createdAt,
          product: item.product,
          quantity: item.quantity,
        });
      }
    }
  }

  res.json({ success: true, pending });
});

module.exports = {
  getProductReviews,
  canReview,
  addReview,
  updateReview,
  deleteReview,
  replyToReview,
  getPendingReviews,
};
