import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUpload, FiX } from "react-icons/fi";
import SellerSidebar from "../../components/seller/SellerSidebar";
import { createProduct, updateProduct, getProduct } from "../../services/api";
import toast from "react-hot-toast";
import "../../components/common/Sidebar.css";
import "./ProductForm.css";

const CATEGORIES = [
  "Wood Crafts",
  "Pottery",
  "Jewellery",
  "Decor",
  "Textile",
  "Other",
];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Wood Crafts",
    price: "",
    quantity: "",
    material: "",
    handmadeDetails: "",
    isHandmade: true,
    tags: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      getProduct(id)
        .then(({ data }) => {
          const p = data.product;
          setForm({
            name: p.name,
            description: p.description,
            category: p.category,
            price: p.price,
            quantity: p.quantity,
            material: p.material || "",
            handmadeDetails: p.handmadeDetails || "",
            isHandmade: p.isHandmade,
            tags: p.tags?.join(", ") || "",
          });
          setImagePreviews(p.images || []);
        })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImageFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3)
      e.name = "Name must be at least 3 characters";
    if (!form.description || form.description.length < 10)
      e.description = "Description must be at least 10 characters";
    if (!form.category) e.category = "Category is required";
    if (!form.price || form.price <= 0) e.price = "Valid price is required";
    if (!form.quantity && form.quantity !== 0)
      e.quantity = "Quantity is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      imageFiles.forEach((f) => formData.append("images", f));

      if (isEdit) {
        await updateProduct(id, formData);
        toast.success("Product updated!");
      } else {
        await createProduct(formData);
        toast.success("Product added!");
      }
      navigate("/seller/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="dashboard-layout">
        <SellerSidebar />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>

        <form onSubmit={handleSubmit} className="product-form card">
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                className={`form-control ${errors.name ? "error" : ""}`}
                placeholder="e.g. Hand-carved Wooden Elephant"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                className={`form-control ${errors.description ? "error" : ""}`}
                rows={4}
                placeholder="Describe your product in detail..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              {errors.description && (
                <span className="error-msg">{errors.description}</span>
              )}
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Category *</label>
                <select
                  className="form-control"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  className="form-control"
                  placeholder="e.g. wooden, elephant, decor"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing & Inventory</h2>
            <div className="form-row-2">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.price ? "error" : ""}`}
                  placeholder="0"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                {errors.price && (
                  <span className="error-msg">{errors.price}</span>
                )}
              </div>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  className={`form-control ${errors.quantity ? "error" : ""}`}
                  placeholder="0"
                  min="0"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
                {errors.quantity && (
                  <span className="error-msg">{errors.quantity}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Craft Details</h2>
            <div className="form-row-2">
              <div className="form-group">
                <label>Material</label>
                <input
                  className="form-control"
                  placeholder="e.g. Sheesham wood, terracotta..."
                  value={form.material}
                  onChange={(e) =>
                    setForm({ ...form, material: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Handmade Details</label>
                <input
                  className="form-control"
                  placeholder="Craft technique, region..."
                  value={form.handmadeDetails}
                  onChange={(e) =>
                    setForm({ ...form, handmadeDetails: e.target.value })
                  }
                />
              </div>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isHandmade}
                onChange={(e) =>
                  setForm({ ...form, isHandmade: e.target.checked })
                }
              />
              This is a handmade product
            </label>
          </div>

          <div className="form-section">
            <h2>Product Images</h2>
            <div
              className="image-upload-area"
              onClick={() => document.getElementById("image-input").click()}
            >
              <FiUpload size={32} />
              <p>Click to upload images (max 5)</p>
              <span>JPG, PNG, WEBP up to 5MB each</span>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageChange}
              />
            </div>
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="image-preview">
                    <img src={src} alt={`Preview ${i + 1}`} />
                    <button
                      type="button"
                      className="remove-img-btn"
                      onClick={() => {
                        setImagePreviews((p) => p.filter((_, j) => j !== i));
                        setImageFiles((f) => f.filter((_, j) => j !== i));
                      }}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/seller/products")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProductForm;
