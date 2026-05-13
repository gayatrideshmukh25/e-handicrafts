const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Get user cart
// @route   GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images price quantity isActive",
  );
  res.json({ success: true, cart: cart || { items: [], totalAmount: 0 } });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (quantity > product.quantity) {
    res.status(400);
    throw new Error(`Only ${product.quantity} items available in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity, price: product.price }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.quantity) {
        res.status(400);
        throw new Error(`Only ${product.quantity} items available in stock`);
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }
  }

  cart.calculateTotal();
  await cart.save();

  const populated = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price quantity",
  );
  res.json({ success: true, cart: populated });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:productId
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (quantity > product.quantity) {
    res.status(400);
    throw new Error(`Only ${product.quantity} items available`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error("Item not in cart");
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  cart.calculateTotal();
  await cart.save();

  const populated = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price quantity",
  );
  res.json({ success: true, cart: populated });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== req.params.productId,
  );
  cart.calculateTotal();
  await cart.save();

  const populated = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price quantity",
  );
  res.json({ success: true, cart: populated });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
  }
  res.json({ success: true, message: "Cart cleared" });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
