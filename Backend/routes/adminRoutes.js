const express = require("express");
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  getSellers,
  toggleBlock,
  deleteUser,
  approveSeller,
  getAllProducts,
  deleteProduct,
  getAllReviews,
  deleteReview,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.get("/sellers", getSellers);
router.put("/users/:id/block", toggleBlock);
router.delete("/users/:id", deleteUser);
router.put("/sellers/:id/approve", approveSeller);
router.get("/products", getAllProducts);
router.delete("/products/:id", deleteProduct);
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

module.exports = router;
