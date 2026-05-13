const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getMyReviews,
} = require("../controllers/sellerController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("seller"));
router.get("/dashboard", getDashboard);
router.get("/reviews", getMyReviews);

module.exports = router;
