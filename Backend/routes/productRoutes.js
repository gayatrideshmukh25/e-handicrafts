const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/productController");

const {
  protect,
  authorize,
  approvedSeller,
} = require("../middleware/authMiddleware");

const { upload } = require("../config/cloudinary");

// GET all products
router.get("/", getProducts);

// GET featured products (must be before /:id)
router.get("/featured", getFeaturedProducts);

// GET seller products
router.get("/seller/my-products", protect, authorize("seller"), getMyProducts);

// GET single product (LAST to avoid conflict)
router.get("/:id", getProduct);

// CREATE product (Cloudinary upload)
router.post(
  "/create",
  protect,
  authorize("seller"),
  approvedSeller,
  upload.array("images", 5),
  createProduct,
);

// UPDATE product
router.put(
  "/:id",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  updateProduct,
);

// DELETE product
router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

module.exports = router;
