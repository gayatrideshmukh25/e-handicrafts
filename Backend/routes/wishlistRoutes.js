const express = require("express");
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("buyer"));
router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
