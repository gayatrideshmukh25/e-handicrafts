const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("buyer"), placeOrder);
router.get("/my-orders", protect, authorize("buyer"), getMyOrders);
router.get("/seller-orders", protect, authorize("seller"), getSellerOrders);
router.get("/all", protect, authorize("admin"), getAllOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/cancel", protect, authorize("buyer"), cancelOrder);
router.put(
  "/:id/status",
  protect,
  authorize("seller", "admin"),
  updateOrderStatus,
);

module.exports = router;
