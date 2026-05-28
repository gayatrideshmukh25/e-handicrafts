const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured in .env");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", shippingAddress } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Valid amount is required");
  }

  const razorpay = getRazorpay();

  const options = {
    amount: Math.round(amount * 100), // paise
    currency,
    receipt: `rcpt_${req.user._id}`,
    notes: {
      userId: req.user._id.toString(),
      userName: req.user.name,
    },
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.json({
    success: true,
    razorpayOrder,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify payment & place order
// @route   POST /api/payment/verify
const verifyAndPlaceOrder = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shippingAddress,
  } = req.body;

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed. Invalid signature.");
  }

  // Fetch cart
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
    image: item.product.images?.[0] || "",
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
    paymentMethod: "Online",
    paymentStatus: "paid",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    totalAmount,
    deliveryCharge,
    grandTotal,
    trackingHistory: [
      { status: "placed", message: "Order placed & payment confirmed" },
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

module.exports = { createRazorpayOrder, verifyAndPlaceOrder };

// const asyncHandler = require("express-async-handler");
// const Cart = require("../models/Cart");
// const Order = require("../models/Order");

// const placeSimulatedOrder = asyncHandler(async (req, res) => {
//   const { shippingAddress, paymentMethod } = req.body;

//   const cart = await Cart.findOne({ user: req.user._id }).populate(
//     "items.product",
//   );

//   if (!cart || cart.items.length === 0) {
//     return res.status(400).json({ message: "Cart is empty" });
//   }

//   const orderItems = cart.items.map((i) => ({
//     product: i.product._id,
//     name: i.product.name,
//     image: i.product.images?.[0],
//     price: i.price,
//     quantity: i.quantity,
//   }));

//   const totalAmount = cart.totalAmount;

//   const order = await Order.create({
//     user: req.user._id,
//     items: orderItems,
//     shippingAddress,

//     paymentMethod,
//     paymentStatus: paymentMethod === "COD" ? "pending" : "paid",

//     totalAmount,
//     grandTotal: totalAmount,
//   });

//   // clear cart (ONLY ONCE)
//   cart.items = [];
//   cart.totalAmount = 0;
//   await cart.save();

//   res.json({ success: true, order });
// });

// module.exports = { placeSimulatedOrder };

// const asyncHandler = require("express-async-handler");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const Order = require("../models/Order");
// const Cart = require("../models/Cart");
// const Product = require("../models/Product");

// const getRazorpay = () => {
//   if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//     throw new Error("Razorpay credentials not configured in .env");
//   }
//   return new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });
// };

// // @desc    Create Razorpay ordera
// // @route   POST /api/payment/create-order
// const createRazorpayOrder = asyncHandler(async (req, res) => {
//   const { amount, currency = "INR", shippingAddress } = req.body;

//   if (!amount || amount <= 0) {
//     res.status(400);
//     throw new Error("Valid amount is required");
//   }

//   const razorpay = getRazorpay();

//   const options = {
//     amount: Math.round(amount * 100), // paise
//     currency,
//     receipt: `rcpt_${req.user._id}_${Date.now()}`,
//     notes: {
//       userId: req.user._id.toString(),
//       userName: req.user.name,
//     },
//   };

//   const razorpayOrder = await razorpay.orders.create(options);

//   res.json({
//     success: true,
//     razorpayOrder,
//     keyId: process.env.RAZORPAY_KEY_ID,
//   });
// });

// // @desc    Verify payment & place order
// // @route   POST /api/payment/verify
// const verifyAndPlaceOrder = asyncHandler(async (req, res) => {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     shippingAddress,
//   } = req.body;

//   // Verify signature
//   const body = razorpay_order_id + "|" + razorpay_payment_id;
//   const expectedSig = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(body)
//     .digest("hex");

//   if (expectedSig !== razorpay_signature) {
//     res.status(400);
//     throw new Error("Payment verification failed. Invalid signature.");
//   }

//   // Fetch cart
//   const cart = await Cart.findOne({ user: req.user._id }).populate(
//     "items.product",
//   );
//   if (!cart || cart.items.length === 0) {
//     res.status(400);
//     throw new Error("Cart is empty");
//   }

//   // Validate stock
//   for (const item of cart.items) {
//     if (!item.product || !item.product.isActive) {
//       res.status(400);
//       throw new Error(`Product "${item.product?.name}" is no longer available`);
//     }
//     if (item.quantity > item.product.quantity) {
//       res.status(400);
//       throw new Error(`Insufficient stock for "${item.product.name}"`);
//     }
//   }

//   const orderItems = cart.items.map((item) => ({
//     product: item.product._id,
//     name: item.product.name,
//     image: item.product.images?.[0] || "",
//     price: item.price,
//     quantity: item.quantity,
//     seller: item.product.seller,
//   }));

//   const totalAmount = cart.totalAmount;
//   const deliveryCharge = totalAmount >= 500 ? 0 : 50;
//   const grandTotal = totalAmount + deliveryCharge;

//   const order = await Order.create({
//     user: req.user._id,
//     items: orderItems,
//     shippingAddress,
//     paymentMethod: "Online",
//     paymentStatus: "paid",
//     razorpayOrderId: razorpay_order_id,
//     razorpayPaymentId: razorpay_payment_id,
//     totalAmount,
//     deliveryCharge,
//     grandTotal,
//     trackingHistory: [
//       { status: "placed", message: "Order placed & payment confirmed" },
//     ],
//   });

//   // Reduce stock
//   for (const item of cart.items) {
//     await Product.findByIdAndUpdate(item.product._id, {
//       $inc: { quantity: -item.quantity },
//     });
//   }

//   // Clear cart
//   cart.items = [];
//   cart.totalAmount = 0;
//   await cart.save();

//   const populated = await Order.findById(order._id).populate(
//     "items.product",
//     "name images",
//   );
//   res.status(201).json({ success: true, order: populated });
// });

// module.exports = { createRazorpayOrder, verifyAndPlaceOrder };
