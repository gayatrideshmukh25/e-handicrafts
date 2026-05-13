const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/Wishlist");

// @desc    Get wishlist
// @route   GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products",
    "name images price ratings category",
  );
  res.json({ success: true, wishlist: wishlist || { products: [] } });
});

// @desc    Toggle wishlist item
// @route   POST /api/wishlist/toggle
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });
    return res.json({
      success: true,
      added: true,
      message: "Added to wishlist",
    });
  }

  const idx = wishlist.products.indexOf(productId);
  let added;
  if (idx > -1) {
    wishlist.products.splice(idx, 1);
    added = false;
  } else {
    wishlist.products.push(productId);
    added = true;
  }

  await wishlist.save();
  res.json({
    success: true,
    added,
    message: added ? "Added to wishlist" : "Removed from wishlist",
  });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId,
    );
    await wishlist.save();
  }
  res.json({ success: true, message: "Removed from wishlist" });
});

module.exports = { getWishlist, toggleWishlist, removeFromWishlist };
