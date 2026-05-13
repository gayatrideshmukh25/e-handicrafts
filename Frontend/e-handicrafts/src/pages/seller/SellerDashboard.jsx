import React, { useEffect, useState } from "react";
import {
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import SellerSidebar from "../../components/seller/SellerSidebar";
import "../../components/common/Sidebar.css";
import { getSellerDashboard } from "../../services/api";

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerDashboard()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        {
          label: "Total Products",
          value: stats.totalProducts,
          icon: <FiPackage />,
          color: "primary",
        },
        {
          label: "Total Orders",
          value: stats.totalOrders,
          icon: <FiShoppingBag />,
          color: "secondary",
        },
        {
          label: "Total Sales",
          value: stats.totalSales,
          icon: <FiTrendingUp />,
          color: "accent",
        },
        {
          label: "Revenue",
          value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
          icon: <FiDollarSign />,
          color: "info",
        },
      ]
    : [];

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Seller Dashboard</h1>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              {cards.map((c) => (
                <div key={c.label} className="stat-card">
                  <div className={`stat-icon ${c.color}`}>{c.icon}</div>
                  <div className="stat-info">
                    <p className="stat-value">{c.value}</p>
                    <p className="stat-label">{c.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
                Quick Actions
              </h2>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a href="/seller/products/new" className="btn btn-primary">
                  + Add Product
                </a>
                <a href="/seller/orders" className="btn btn-secondary">
                  View Orders
                </a>
                <a href="/seller/reviews" className="btn btn-outline">
                  View Reviews
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
