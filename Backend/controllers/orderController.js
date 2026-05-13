const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Place order
// @route   POST /api/orders
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  // Validate stock
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      res.status(400);
      throw new Error(`Product "${item.product?.name}" is no longer available`);
    }
    if (item.quantity > item.product.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${item.product.name}"`);
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0] || "",
    price: item.price,
    quantity: item.quantity,
    seller: item.product.seller,
  }));

  const totalAmount = cart.totalAmount;
  const deliveryCharge = totalAmount >= 500 ? 0 : 50;
  const grandTotal = totalAmount + deliveryCharge;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
    deliveryCharge,
    grandTotal,
    trackingHistory: [
      { status: "placed", message: "Order placed successfully" },
    ],
  });

  // Reduce stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { quantity: -item.quantity },
    });
  }

  // Clear cart
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  const populated = await Order.findById(order._id).populate(
    "items.product",
    "name images",
  );
  res.status(201).json({ success: true, order: populated });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("items.product", "name images");
  res.json({ success: true, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "name images");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role === "buyer"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (["delivered", "cancelled"].includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Cannot cancel a ${order.orderStatus} order`);
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || "Cancelled by buyer";
  order.trackingHistory.push({
    status: "cancelled",
    message: req.body.reason || "Order cancelled by buyer",
  });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: item.quantity },
    });
  }

  await order.save();
  res.json({ success: true, order });
});

// @desc    Get seller orders
// @route   GET /api/orders/seller-orders
const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.seller": req.user._id })
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("items.product", "name images");
  res.json({ success: true, orders });
});

// @desc    Update order status (seller/admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = status;
  order.trackingHistory.push({ status, message: message || `Order ${status}` });

  if (status === "delivered") {
    order.deliveredAt = new Date();
    order.paymentStatus = "paid";
  }

  await order.save();
  res.json({ success: true, order });
});

// @desc    Admin: Get all orders
// @route   GET /api/orders/all
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("items.product", "name");
  res.json({ success: true, orders });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
  getAllOrders,
};
