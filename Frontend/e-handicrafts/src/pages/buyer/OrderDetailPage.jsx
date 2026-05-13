import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiCircle, FiX } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import { getOrder, cancelOrder } from "../../services/api";
import toast from "react-hot-toast";
import "./Orders.css";

const STEPS = ["placed", "confirmed", "processing", "shipped", "delivered"];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => navigate("/orders"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      const { data } = await cancelOrder(id, { reason: "Cancelled by buyer" });
      setOrder(data.order);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel");
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </>
    );
  if (!order) return null;

  const currentStep = STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <>
      <Navbar />
      <div className="container order-detail-page fade-in">
        <div className="order-detail-header">
          <div>
            <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="order-date">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {!isCancelled && !["delivered"].includes(order.orderStatus) && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleCancel}
              disabled={cancelling}
            >
              <FiX /> {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>

        {/* Tracking */}
        <div className="card tracking-card">
          <h2>Order Tracking</h2>
          {isCancelled ? (
            <div className="cancelled-notice">
              <FiX /> Order Cancelled — {order.cancelReason}
            </div>
          ) : (
            <div className="tracking-steps">
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`tracking-step ${i <= currentStep ? "done" : ""} ${i === currentStep ? "current" : ""}`}
                >
                  <div className="step-icon">
                    {i <= currentStep ? <FiCheckCircle /> : <FiCircle />}
                  </div>
                  <div className="step-info">
                    <p className="step-label">
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </p>
                    {i <= currentStep &&
                      order.trackingHistory?.find((h) => h.status === step) && (
                        <p className="step-date">
                          {new Date(
                            order.trackingHistory.find((h) => h.status === step)
                              .timestamp,
                          ).toLocaleDateString()}
                        </p>
                      )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`step-line ${i < currentStep ? "done" : ""}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="order-detail-grid">
          {/* Items */}
          <div className="card order-section">
            <h2>Items Ordered</h2>
            {order.items.map((item, i) => (
              <div key={i} className="order-product-row">
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=100"
                  }
                  alt={item.name}
                />
                <div className="order-product-info">
                  <p className="order-product-name">{item.name}</p>
                  <p className="order-product-qty">
                    Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                  </p>
                </div>
                <p className="order-product-total">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="order-side">
            {/* Address */}
            <div className="card order-section">
              <h2>Delivery Address</h2>
              <div className="address-block">
                <strong>{order.shippingAddress?.name}</strong>
                <p>{order.shippingAddress?.phone}</p>
                <p>
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}
                </p>
                <p>
                  {order.shippingAddress?.state} —{" "}
                  {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* Payment & Summary */}
            <div className="card order-section">
              <h2>Payment & Summary</h2>
              <div className="summary-row">
                <span>Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="summary-row">
                <span>Payment Status</span>
                <span
                  className={`badge ${order.paymentStatus === "paid" ? "badge-success" : "badge-warning"}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>₹{order.deliveryCharge}</span>
              </div>
              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span>₹{order.grandTotal?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailPage;
