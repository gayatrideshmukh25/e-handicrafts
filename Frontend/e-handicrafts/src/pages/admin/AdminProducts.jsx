import React, { useEffect, useState } from "react";
import { FiPackage, FiTrash2, FiSearch, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminProducts, adminDeleteProduct } from "../../services/api";
import toast from "react-hot-toast";
import "../../components/common/Sidebar.css";
import "../seller/ProductForm.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const CATEGORIES = [
    "All",
    "Wood Crafts",
    "Pottery",
    "Jewellery",
    "Decor",
    "Textile",
    "Other",
  ];

  useEffect(() => {
    getAdminProducts()
      .then(({ data }) => {
        setProducts(data.products);
        setFiltered(data.products);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (categoryFilter !== "All")
      result = result.filter((p) => p.category === categoryFilter);
    if (search)
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.seller?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    setFiltered(result);
  }, [search, categoryFilter, products]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this product from the platform?")) return;
    try {
      await adminDeleteProduct(id);
      const updated = products.map((p) =>
        p._id === id ? { ...p, isActive: false } : p,
      );
      setProducts(updated);
      toast.success("Product removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Products</h1>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiSearch
              style={{
                position: "absolute",
                left: "10px",
                color: "var(--text-muted)",
              }}
            />
            <input
              className="form-control"
              style={{ paddingLeft: "32px", width: "260px" }}
              placeholder="Search products or sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: "auto" }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {filtered.length} products
          </span>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={
                            p.images?.[0] ||
                            "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=80"
                          }
                          alt={p.name}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            maxWidth: "140px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{p.category}</span>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {p.seller?.name || "—"}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{p.price?.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${p.quantity === 0 ? "badge-danger" : p.quantity <= 5 ? "badge-warning" : "badge-success"}`}
                      >
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      ⭐ {p.ratings?.average?.toFixed(1) || "0.0"} (
                      {p.ratings?.count || 0})
                    </td>
                    <td>
                      <span
                        className={`badge ${p.isActive ? "badge-success" : "badge-danger"}`}
                      >
                        {p.isActive ? "Active" : "Removed"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link
                          to={`/products/${p._id}`}
                          className="btn btn-outline btn-sm"
                          target="_blank"
                        >
                          <FiExternalLink />
                        </Link>
                        {p.isActive && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p._id)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: "40px" }}>
                <FiPackage size={36} />
                <p>No products found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
