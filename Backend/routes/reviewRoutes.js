const express = require("express");
const router = express.Router();
const {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  replyToReview,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/product/:productId", getProductReviews);
router.post("/", protect, authorize("buyer"), addReview);
router.put("/:id", protect, authorize("buyer"), updateReview);
router.delete("/:id", protect, deleteReview);
router.put("/:id/reply", protect, authorize("seller"), replyToReview);

module.exports = router;
