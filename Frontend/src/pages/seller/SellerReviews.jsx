import React, { useEffect, useState } from "react";
import {
  FiStar,
  FiTrash2,
  FiMessageSquare,
  FiX,
  FiPackage,
  FiAlertCircle,
} from "react-icons/fi";
import SellerSidebar from "../../components/seller/SellerSidebar";
import {
  getSellerReviews,
  deleteReview,
  replyToReview,
} from "../../services/api";
import toast from "react-hot-toast";
import "./SellerReviews.css";

function StarDisplay({ r }) {
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          style={{
            width: 12,
            height: 12,
            fill: s <= r ? "#F59E0B" : "transparent",
            color: s <= r ? "#F59E0B" : "#D1D5DB",
          }}
        />
      ))}
    </div>
  );
}

export default function SellerReviews() {
  const [data, setData] = useState({
    reviews: [],
    byProduct: [],
    productsWithNoReview: [],
  });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("all"); // 'all' | 'by-product' | 'no-reviews'
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedProduct, setExpandedProduct] = useState(null);

  useEffect(() => {
    getSellerReviews()
      .then(({ data: d }) =>
        setData({
          reviews: d.reviews || [],
          byProduct: d.byProduct || [],
          productsWithNoReview: d.productsWithNoReview || [],
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      setData((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r._id !== id),
      }));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed");
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      const { data: d } = await replyToReview(id, { reply: replyText });
      setData((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) =>
          r._id === id ? { ...r, sellerReply: d.review.sellerReply } : r,
        ),
      }));
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply submitted");
    } catch {
      toast.error("Failed");
    }
  };

  const avgRating = data.reviews.length
    ? (
        data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length
      ).toFixed(1)
    : "—";

  if (loading)
    return (
      <div className="dash-layout">
        <SellerSidebar />
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      </div>
    );

  return (
    <div className="dash-layout">
      <SellerSidebar />
      <main className="dash-content">
        <h1 className="dash-title">Reviews & Ratings</h1>

        {/* Summary stats */}
        <div className="sr-stats-row">
          <div className="sr-stat-box sr-stat-primary">
            <p className="sr-stat-num">{data.reviews.length}</p>
            <p className="sr-stat-lbl">Total Reviews</p>
          </div>
          <div className="sr-stat-box sr-stat-gold">
            <p className="sr-stat-num">⭐ {avgRating}</p>
            <p className="sr-stat-lbl">Avg Rating</p>
          </div>
          <div className="sr-stat-box sr-stat-danger">
            <p className="sr-stat-num">{data.productsWithNoReview.length}</p>
            <p className="sr-stat-lbl">Products with No Reviews</p>
          </div>
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="sr-stat-box sr-stat-plain">
              <p className="sr-stat-num">
                {data.reviews.filter((r) => r.rating === n).length}
              </p>
              <p className="sr-stat-lbl">{"★".repeat(n)}</p>
            </div>
          ))}
        </div>

        {/* View toggle */}
        <div className="sr-view-tabs">
          {[
            { key: "all", label: "All Reviews", count: data.reviews.length },
            {
              key: "by-product",
              label: "By Product",
              count: data.byProduct.length,
            },
            {
              key: "no-reviews",
              label: "⚠ No Reviews Yet",
              count: data.productsWithNoReview.length,
            },
          ].map((t) => (
            <button
              key={t.key}
              className={`sr-tab ${view === t.key ? "active" : ""}`}
              onClick={() => setView(t.key)}
            >
              {t.label} <span className="sr-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* ALL REVIEWS */}
        {view === "all" &&
          (data.reviews.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <FiStar />
              </div>
              <h3>No reviews yet</h3>
              <p>Once customers review your products, they'll appear here</p>
            </div>
          ) : (
            <div className="sr-reviews-list">
              {data.reviews.map((rv) => (
                <div key={rv._id} className="sr-review-card card">
                  <div className="sr-review-header">
                    <div className="sr-reviewer">
                      <div className="sr-reviewer-av">{rv.user?.name?.[0]}</div>
                      <div>
                        <p className="sr-reviewer-name">{rv.user?.name}</p>
                        <StarDisplay r={rv.rating} />
                        <p className="sr-review-date">
                          {new Date(rv.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="sr-review-product-tag">
                      <img
                        src={
                          rv.product?.images?.[0] ||
                          "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=60&q=80"
                        }
                        alt={rv.product?.name}
                      />
                      <span>{rv.product?.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setReplyingTo(rv._id);
                          setReplyText(rv.sellerReply || "");
                        }}
                      >
                        <FiMessageSquare size={12} /> Reply
                      </button>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDelete(rv._id)}
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <p className="sr-review-text">{rv.comment}</p>

                  {rv.sellerReply && replyingTo !== rv._id && (
                    <div className="sr-seller-reply">
                      <strong>Your Reply:</strong> {rv.sellerReply}
                    </div>
                  )}

                  {replyingTo === rv._id && (
                    <div className="sr-reply-form">
                      <textarea
                        className="input"
                        rows={2}
                        placeholder="Write your reply to this review…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReply(rv._id)}
                        >
                          Submit Reply
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setReplyingTo(null)}
                        >
                          <FiX size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

        {/* BY PRODUCT */}
        {view === "by-product" && (
          <div className="sr-by-product">
            {data.byProduct.map(
              ({ product, reviews: pReviews, reviewCount, avgRating: avg }) => (
                <div key={product._id} className="sr-product-group card">
                  <button
                    className="sr-product-group-header"
                    onClick={() =>
                      setExpandedProduct(
                        expandedProduct === product._id ? null : product._id,
                      )
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <img
                        src={
                          product.images?.[0] ||
                          "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=80&q=80"
                        }
                        alt={product.name}
                        className="sr-product-img"
                      />
                      <div>
                        <p className="sr-product-name">{product.name}</p>
                        <p className="sr-product-cat">{product.category}</p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontWeight: 800, fontSize: 18 }}>
                          {reviewCount}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Reviews
                        </p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontWeight: 800, fontSize: 18 }}>
                          ⭐ {avg}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Avg
                        </p>
                      </div>
                      <span
                        className={`badge ${reviewCount > 0 ? "badge-success" : "badge-warning"}`}
                      >
                        {reviewCount > 0
                          ? `${reviewCount} reviews`
                          : "No reviews"}
                      </span>
                    </div>
                  </button>

                  {expandedProduct === product._id && pReviews.length > 0 && (
                    <div className="sr-product-reviews">
                      {pReviews.map((rv) => (
                        <div key={rv._id} className="sr-mini-review">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 13 }}>
                                {rv.user?.name}
                              </p>
                              <StarDisplay r={rv.rating} />
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              {new Date(rv.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--text-secondary)",
                              marginTop: 6,
                            }}
                          >
                            {rv.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}

        {/* PRODUCTS WITH NO REVIEWS */}
        {view === "no-reviews" &&
          (data.productsWithNoReview.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🎉</div>
              <h3>All products have reviews!</h3>
              <p>Great work — every product has at least one customer review</p>
            </div>
          ) : (
            <div>
              <div className="sr-no-review-banner">
                <FiAlertCircle size={16} />
                <p>
                  These {data.productsWithNoReview.length} products have not
                  received any reviews yet. Consider promoting them to get
                  customer feedback.
                </p>
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productsWithNoReview.map((p) => (
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
                                "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=60&q=80"
                              }
                              alt={p.name}
                              className="tbl-thumb"
                            />
                            <p className="tbl-name">{p.name}</p>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {p.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          ₹{p.price?.toLocaleString("en-IN")}
                        </td>
                        <td>
                          <span
                            className={`badge ${p.quantity === 0 ? "badge-danger" : p.quantity <= 5 ? "badge-warning" : "badge-success"}`}
                          >
                            {p.quantity}
                          </span>
                        </td>
                        <td>
                          <a
                            href={`/products/${p._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-xs"
                          >
                            View Product
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}
