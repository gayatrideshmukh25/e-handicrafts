import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiSearch } from "react-icons/fi";
import SellerSidebar from "../../components/seller/SellerSidebar";
import { getMyProducts, deleteProduct } from "../../services/api";
import toast from "react-hot-toast";
import "./ProductForm.css";

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMyProducts()
      .then(({ data }) => {
        setProducts(data.products);
        setFiltered(data.products);
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    setFiltered(
      products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, products]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((x) => x._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        <div className="page-hdr">
          <h1>My Products</h1>
          <Link to="/seller/products/new" className="btn btn-primary">
            <FiPlus /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">
              <FiPackage />
            </div>
            <h3>No products yet</h3>
            <p>Start adding your handcrafted products to sell online</p>
            <Link to="/seller/products/new" className="btn btn-primary">
              Add First Product
            </Link>
          </div>
        ) : (
          <>
            <div className="filter-row">
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
                    left: 10,
                    color: "var(--ink-5)",
                    fontSize: "0.9rem",
                  }}
                />
                <input
                  className="form-control"
                  style={{ paddingLeft: 32 }}
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <span className="filter-count">
                {filtered.length} of {products.length} products
              </span>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
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
                            gap: 10,
                          }}
                        >
                          <img
                            src={
                              p.images?.[0] ||
                              "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=80&q=80"
                            }
                            alt={p.name}
                            className="tbl-product-img"
                          />
                          <div>
                            <p className="tbl-name">{p.name}</p>
                            <p className="tbl-sub">
                              {p.isHandmade ? "✦ Handmade" : "Machine made"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue">{p.category}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹{p.price?.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={`badge ${p.quantity === 0 ? "badge-red" : p.quantity <= 5 ? "badge-gold" : "badge-green"}`}
                        >
                          {p.quantity} units
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {"⭐"
                          .repeat(Math.round(p.ratings?.average || 0))
                          .slice(0, 5) || "—"}{" "}
                        <span style={{ color: "var(--ink-4)" }}>
                          ({p.ratings?.count || 0})
                        </span>
                      </td>
                      <td>
                        <div className="tbl-actions">
                          <Link
                            to={`/seller/products/edit/${p._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            <FiEdit2 />
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p._id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
