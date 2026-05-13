import React, { useEffect, useState } from "react";
import { FiStar, FiTrash2, FiMessageSquare } from "react-icons/fi";
import SellerSidebar from "../../components/seller/SellerSidebar";
import {
  getSellerReviews,
  deleteReview,
  replyToReview,
} from "../../services/api";
import toast from "react-hot-toast";
import "../../components/common/Sidebar.css";

const SellerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    getSellerReviews()
      .then(({ data }) => setReviews(data.reviews))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      setReviews(reviews.filter((r) => r._id !== id));
      toast.success("Review deleted");
    } catch {}
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      const { data } = await replyToReview(id, { reply: replyText });
      setReviews(
        reviews.map((r) =>
          r._id === id ? { ...r, sellerReply: data.review.sellerReply } : r,
        ),
      );
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply added");
    } catch {}
  };

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Customer Reviews</h1>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <FiStar size={40} />
            <h3>No reviews yet</h3>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {reviews.map((review) => (
              <div
                key={review._id}
                className="card"
                style={{ padding: "20px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "var(--primary)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      {review.user?.name?.[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {review.user?.name}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {review.product?.name}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar
                          key={s}
                          style={{
                            width: "13px",
                            color:
                              s <= review.rating
                                ? "var(--accent)"
                                : "var(--border)",
                            fill:
                              s <= review.rating
                                ? "var(--accent)"
                                : "transparent",
                          }}
                        />
                      ))}
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setReplyingTo(review._id);
                        setReplyText(review.sellerReply || "");
                      }}
                    >
                      <FiMessageSquare />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(review._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    marginBottom: "8px",
                  }}
                >
                  {review.comment}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {review.sellerReply && replyingTo !== review._id && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px 14px",
                      background: "var(--secondary-light)",
                      borderLeft: "3px solid var(--secondary)",
                      borderRadius: "0 6px 6px 0",
                      fontSize: "0.875rem",
                    }}
                  >
                    <strong>Your Reply:</strong> {review.sellerReply}
                  </div>
                )}

                {replyingTo === review._id && (
                  <div style={{ marginTop: "12px" }}>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                    >
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleReply(review._id)}
                      >
                        Submit Reply
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerReviews;
