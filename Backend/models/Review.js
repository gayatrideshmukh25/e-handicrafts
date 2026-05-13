const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      minlength: [5, "Comment must be at least 5 characters"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    sellerReply: { type: String, default: "" },
  },
  { timestamps: true },
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product ratings after review save
reviewSchema.post("save", async function () {
  const Product = require("./Product");
  const stats = await this.constructor.aggregate([
    { $match: { product: this.product } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      "ratings.average": Math.round(stats[0].avgRating * 10) / 10,
      "ratings.count": stats[0].count,
    });
  }
});

// Update product ratings after review delete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Product = require("./Product");
    const stats = await doc.constructor.aggregate([
      { $match: { product: doc.product } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
    await Product.findByIdAndUpdate(doc.product, {
      "ratings.average":
        stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
      "ratings.count": stats.length > 0 ? stats[0].count : 0,
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);
