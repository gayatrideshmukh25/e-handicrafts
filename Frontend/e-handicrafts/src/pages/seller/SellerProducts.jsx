import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from "react-icons/fi";
import SellerSidebar from "../../components/seller/SellerSidebar";
import { getMyProducts, deleteProduct } from "../../services/api";
import toast from "react-hot-toast";
import "../../components/common/Sidebar.css";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await getMyProducts();
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h1 className="dashboard-title" style={{ marginBottom: 0 }}>
            My Products
          </h1>
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
            <FiPackage size={40} />
            <h3>No products yet</h3>
            <p>Start adding your handcrafted products</p>
            <Link
              to="/seller/products/new"
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
            >
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
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
                {products.map((p) => (
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
                          }}
                        />
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{p.category}</span>
                    </td>
                    <td>₹{p.price?.toLocaleString()}</td>
                    <td>
                      <span
                        className={
                          p.quantity === 0
                            ? "badge badge-danger"
                            : p.quantity <= 5
                              ? "badge badge-warning"
                              : "badge badge-success"
                        }
                      >
                        {p.quantity} units
                      </span>
                    </td>
                    <td>
                      {p.ratings?.average?.toFixed(1) || "—"} ⭐ (
                      {p.ratings?.count || 0})
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
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
        )}
      </main>
    </div>
  );
};

export default SellerProducts;
