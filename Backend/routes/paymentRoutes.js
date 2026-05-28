// const express = require("express");
// const router = express.Router();
// const { placeSimulatedOrder } = require("../controllers/paymentController");
// const { protect } = require("../middleware/authMiddleware");

// router.post("/simulate-pay", protect, placeSimulatedOrder);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyAndPlaceOrder,
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/create-order", protect, authorize("buyer"), createRazorpayOrder);
router.post("/verify", protect, authorize("buyer"), verifyAndPlaceOrder);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const {
//   createRazorpayOrder,
//   verifyAndPlaceOrder,
// } = require("../controllers/paymentController");
// const { protect, authorize } = require("../middleware/authMiddleware");

// router.post("/create-order", protect, authorize("buyer"), createRazorpayOrder);
// router.post("/verify", protect, authorize("buyer"), verifyAndPlaceOrder);

// module.exports = router;
