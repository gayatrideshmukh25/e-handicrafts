const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary").cloudinary;

const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (category) query.category = category;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };

  if (sort === "price_asc") sortOption = { price: 1 };
  else if (sort === "price_desc") sortOption = { price: -1 };
  else if (sort === "rating") sortOption = { "ratings.average": -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("seller", "name sellerInfo")
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "seller",
    "name sellerInfo avatar",
  );

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
});

// ================= FEATURED PRODUCTS =================
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    quantity: { $gt: 0 },
  })
    .sort({ "ratings.average": -1, createdAt: -1 })
    .limit(8)
    .populate("seller", "name");

  res.json({ success: true, products });
});

// ================= CREATE PRODUCT =================
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    quantity,
    material,
    handmadeDetails,
    isHandmade,
    tags,
  } = req.body;

  // ✅ CLOUDINARY UPLOAD
  const images = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      images.push(result.secure_url);
    }
  }

  const product = await Product.create({
    name,
    description,
    category,
    price: Number(price),
    quantity: Number(quantity),
    material,
    handmadeDetails,
    isHandmade: isHandmade === "true",
    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    images,
    seller: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// ================= UPDATE PRODUCT =================
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const updates = { ...req.body };

  // ✅ CLOUDINARY UPDATE
  if (req.files && req.files.length > 0) {
    const images = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      images.push(result.secure_url);
    }

    updates.images = images;
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, product: updated });
});

// ================= DELETE PRODUCT =================
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: "Product removed" });
});

// ================= MY PRODUCTS =================
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({ success: true, products });
});

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
