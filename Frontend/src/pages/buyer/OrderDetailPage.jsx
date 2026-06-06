import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiX, FiCheck, FiArrowLeft, FiStar, FiPackage } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import {
  getOrder,
  cancelOrder,
  addReview,
  canReviewProduct,
} from "../../services/api";
import toast from "react-hot-toast";
import "./Orders.css";

const STEPS = ["placed", "confirmed", "processing", "shipped", "delivered"];
const SB = {
  placed: "badge-info",
  confirmed: "badge-info",
  processing: "badge-warning",
  shipped: "badge-warning",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

function ReviewModal({ orderId, product, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setSubmitting(true);
    try {
      await addReview({
        productId: product.product?._id || product.product,
        orderId,
        rating,
        comment,
      });
      toast.success("Review submitted!");
      if (onSubmitted) onSubmitted(product._id || product.product);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>Review Product</h3>
          <button className="btn btn-ghost btn-xs btn-icon" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="review-modal-product">
          <img
            src={
              product.image ||
              "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=80&q=80"
            }
            alt={product.name}
          />
          <span>{product.name}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Your Rating</label>
            <div className="modal-star-picker">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`modal-star ${s <= rating ? "on" : ""}`}
                  onClick={() => setRating(s)}
                >
                  ★
                </button>
              ))}
              <span className="modal-star-label">
                {["", "Terrible", "Poor", "Okay", "Good", "Excellent"][rating]}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Your Review</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Share your experience with this product — quality, packaging, value…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {comment.length}/500
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewStatus, setReviewStatus] = useState({}); // productId -> { canReview, reviewed }
  const [reviewModal, setReviewModal] = useState(null); // product item

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => {
        setOrder(data.order);
        fetchReviewStatus(data.order);
      })
      .catch(() => navigate("/orders"))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchReviewStatus = async (ord) => {
    if (ord.orderStatus !== "delivered") return;
    const statuses = {};
    for (const item of ord.items) {
      const pid = item.product?._id || item.product;
      if (!pid) continue;
      try {
        const { data } = await canReviewProduct(ord._id, pid);
        statuses[pid] = {
          canReview: data.canReview,
          reviewed: !data.canReview && data.reason === "Already reviewed",
        };
      } catch {
        statuses[pid] = { canReview: false };
      }
    }
    setReviewStatus(statuses);
  };

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

  const handleReviewSubmitted = (productId) => {
    setReviewStatus((prev) => ({
      ...prev,
      [productId]: { canReview: false, reviewed: true },
    }));
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="page-loader">
          <div className="spinner" />
          <p>Loading order…</p>
        </div>
      </>
    );
  if (!order) return null;

  const stepIdx = STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const isDelivered = order.orderStatus === "delivered";

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <div className="container orders-page">
          <div className="orders-header">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/orders")}
            >
              <FiArrowLeft /> Back to Orders
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <h1>Order #{order._id.slice(-10).toUpperCase()}</h1>
              <span
                className={`badge ${SB[order.orderStatus] || "badge-gray"}`}
                style={{ fontSize: 12, padding: "4px 10px" }}
              >
                {order.orderStatus.charAt(0).toUpperCase() +
                  order.orderStatus.slice(1)}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="od-grid">
            <div className="od-left">
              {/* Tracking */}
              <div className="card card-pad od-tracking">
                <h3 className="od-section-title">Order Tracking</h3>
                {isCancelled ? (
                  <div className="od-cancelled">
                    <FiX /> Cancelled —{" "}
                    {order.cancelReason || "Cancelled by buyer"}
                  </div>
                ) : (
                  <div className="od-steps">
                    {STEPS.map((step, i) => (
                      <div
                        key={step}
                        className={`od-step ${i < stepIdx ? "done" : ""} ${i === stepIdx ? "current" : ""}`}
                      >
                        <div className="od-step-line" />
                        <div className="od-step-dot">
                          {i < stepIdx ? (
                            <FiCheck size={12} />
                          ) : i === stepIdx ? (
                            "●"
                          ) : (
                            ""
                          )}
                        </div>
                        <p className="od-step-label">
                          {step.charAt(0).toUpperCase() + step.slice(1)}
                        </p>
                        {order.trackingHistory?.find(
                          (h) => h.status === step,
                        ) && (
                          <p className="od-step-time">
                            {new Date(
                              order.trackingHistory.find(
                                (h) => h.status === step,
                              ).timestamp,
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="card od-items-card">
                <div className="od-items-header">
                  <h3 className="od-section-title">
                    <FiPackage /> {order.items.length} Item
                    {order.items.length !== 1 ? "s" : ""}
                  </h3>
                  {!isCancelled && !isDelivered && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleCancel}
                      disabled={cancelling}
                    >
                      <FiX /> {cancelling ? "Cancelling…" : "Cancel Order"}
                    </button>
                  )}
                </div>
                {order.items.map((item, i) => {
                  const pid = item.product?._id || item.product;
                  const rs = reviewStatus[pid];
                  return (
                    <div key={i} className="od-item">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=80&q=80"
                        }
                        alt={item.name}
                        className="od-item-img"
                      />
                      <div className="od-item-info">
                        <p className="od-item-name">{item.name}</p>
                        <p className="od-item-sub">
                          Qty: {item.quantity} × ₹
                          {item.price?.toLocaleString("en-IN")}
                        </p>
                        {/* Review button — only for delivered orders */}
                        {isDelivered && (
                          <div style={{ marginTop: 8 }}>
                            {rs?.reviewed ? (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  fontSize: 12,
                                  color: "var(--success)",
                                  fontWeight: 600,
                                }}
                              >
                                <FiCheck size={12} /> Review submitted
                              </span>
                            ) : rs?.canReview ? (
                              <button
                                className="btn btn-outline btn-xs"
                                onClick={() => setReviewModal(item)}
                                style={{ gap: 5 }}
                              >
                                <FiStar size={12} /> Rate this product
                              </button>
                            ) : rs && !rs.canReview && !rs.reviewed ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "var(--text-muted)",
                                }}
                              >
                                Not eligible to review
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                      <span className="od-item-total">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="od-right">
              {/* Address */}
              <div className="card card-pad od-section">
                <h3 className="od-section-title">Delivery Address</h3>
                <div className="od-address">
                  <strong>{order.shippingAddress?.name}</strong>
                  <p>{order.shippingAddress?.phone}</p>
                  <p>{order.shippingAddress?.street},</p>
                  <p>
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state} -{" "}
                    {order.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="card card-pad od-section">
                <h3 className="od-section-title">Payment & Pricing</h3>
                <div className="summary-line">
                  <span>Payment Method</span>
                  <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
                </div>
                <div className="summary-line">
                  <span>Payment Status</span>
                  <span
                    className={`badge ${order.paymentStatus === "paid" ? "badge-success" : "badge-warning"}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="summary-line">
                    <span>Payment ID</span>
                    <code style={{ fontSize: 11 }}>
                      {order.razorpayPaymentId}
                    </code>
                  </div>
                )}
                <div
                  style={{
                    height: 1,
                    background: "var(--border)",
                    margin: "10px 0",
                  }}
                />
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="summary-line">
                  <span>Delivery</span>
                  <span>
                    {order.deliveryCharge === 0 ? (
                      <span
                        style={{ color: "var(--success)", fontWeight: 600 }}
                      >
                        FREE
                      </span>
                    ) : (
                      `₹${order.deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="summary-line total">
                  <span>Grand Total</span>
                  <span>₹{order.grandTotal?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          orderId={order._id}
          product={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
}
