import React, { useEffect, useState } from "react";
import SellerSidebar from "../../components/seller/SellerSidebar";
import { getSellerOrders, updateOrderStatus } from "../../services/api";
import toast from "react-hot-toast";
import "../../components/common/Sidebar.css";
import "./ProductForm.css";

const STATUS_OPTIONS = ["confirmed", "processing", "shipped", "delivered"];

const statusColors = {
  placed: "badge-info",
  confirmed: "badge-primary",
  processing: "badge-warning",
  shipped: "badge-warning",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerOrders()
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const { data } = await updateOrderStatus(orderId, { status });
      setOrders(orders.map((o) => (o._id === orderId ? data.order : o)));
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Orders</h1>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <code style={{ fontSize: "0.78rem" }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600 }}>{order.user?.name}</p>
                        <p
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {order.user?.email}
                        </p>
                      </div>
                    </td>
                    <td>{order.items?.length} item(s)</td>
                    <td style={{ fontWeight: 700 }}>
                      ₹{order.grandTotal?.toLocaleString()}
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`badge ${statusColors[order.orderStatus]}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      {!["delivered", "cancelled"].includes(
                        order.orderStatus,
                      ) && (
                        <select
                          className="form-control"
                          style={{
                            padding: "4px 8px",
                            fontSize: "0.8rem",
                            width: "auto",
                          }}
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusUpdate(order._id, e.target.value)
                          }
                        >
                          <option value={order.orderStatus} disabled>
                            Change status
                          </option>
                          {STATUS_OPTIONS.filter(
                            (s) => s !== order.orderStatus,
                          ).map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
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

export default SellerOrders;
