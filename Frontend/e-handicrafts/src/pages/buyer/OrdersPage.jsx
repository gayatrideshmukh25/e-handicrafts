import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiChevronRight } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import { getMyOrders } from "../../services/api";
import "./Orders.css";

const statusColors = {
  placed: "badge-info",
  confirmed: "badge-primary",
  processing: "badge-warning",
  shipped: "badge-warning",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <>
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="container orders-page fade-in">
        <h1 className="page-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <FiPackage size={48} />
            <h3>No orders yet</h3>
            <p>Your orders will appear here once you make a purchase</p>
            <Link
              to="/"
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link
                to={`/orders/${order._id}`}
                key={order._id}
                className="order-card card"
              >
                <div className="order-header">
                  <div>
                    <p className="order-id">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="order-header-right">
                    <span
                      className={`badge ${statusColors[order.orderStatus] || "badge-info"}`}
                    >
                      {order.orderStatus.charAt(0).toUpperCase() +
                        order.orderStatus.slice(1)}
                    </span>
                    <FiChevronRight className="chevron" />
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="order-item-preview">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=100"
                        }
                        alt={item.name}
                      />
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="more-items">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                <div className="order-footer">
                  <span>
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </span>
                  <span className="order-total">
                    ₹{order.grandTotal?.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
