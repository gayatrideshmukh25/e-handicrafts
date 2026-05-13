const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Product = require("../models/Product");

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

// @desc    Add review
// @route   POST /api/reviews
const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const existing = await Review.findOne({
    product: productId,
    user: req.user._id,
  });
  if (existing) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating: Number(rating),
    comment,
  });

  const populated = await Review.findById(review._id).populate(
    "user",
    "name avatar",
  );
  res.status(201).json({ success: true, review: populated });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
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

// @desc    Delete review (owner/seller/admin)
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
    review.product.seller.toString() === req.user._id.toString();
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

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  replyToReview,
};
