import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiStar,
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiTrash2,
} from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import {
  getProduct,
  getProductReviews,
  addReview,
  deleteReview,
  toggleWishlist,
  getWishlist,
} from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./ProductDetail.css";

const StarPicker = ({ value, onChange }) => (
  <div className="star-picker">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={`star-pick-btn ${s <= value ? "active" : ""}`}
      >
        <FiStar />
      </button>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (user?.role === "buyer") fetchWishlistStatus();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await getProduct(id);
      setProduct(data.product);
    } catch {
      toast.error("Product not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await getProductReviews(id);
      setReviews(data.reviews);
      if (user) {
        setHasReviewed(data.reviews.some((r) => r.user?._id === user._id));
      }
    } catch {}
  };

  const fetchWishlistStatus = async () => {
    try {
      const { data } = await getWishlist();
      const ids = data.wishlist?.products?.map((p) => p._id || p) || [];
      setInWishlist(ids.includes(id));
    } catch {}
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart(product._id, qty);
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await toggleWishlist({ productId: id });
      setInWishlist(!inWishlist);
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
    } catch {}
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await addReview({ productId: id, ...reviewForm });
      setReviews([data.review, ...reviews]);
      setHasReviewed(true);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review submitted!");
      fetchProduct(); // refresh ratings
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      toast.success("Review deleted");
      fetchProduct();
    } catch {}
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
  if (!product) return null;

  const images =
    product.images?.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600"];

  return (
    <div>
      <Navbar />
      <div className="container product-detail-page fade-in">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft /> Back
        </button>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-image">
              <img src={images[activeImage]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb ${activeImage === i ? "active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <div className="product-badges">
              <span className="badge badge-primary">{product.category}</span>
              {product.isHandmade && (
                <span className="badge badge-success">✦ Handmade</span>
              )}
              {product.quantity === 0 && (
                <span className="badge badge-danger">Out of Stock</span>
              )}
              {product.quantity > 0 && product.quantity <= 5 && (
                <span className="badge badge-warning">
                  Only {product.quantity} left!
                </span>
              )}
            </div>

            <h1 className="product-detail-name">{product.name}</h1>

            <div className="product-rating-row">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    className={
                      s <= Math.round(product.ratings?.average)
                        ? "star-filled"
                        : "star-empty"
                    }
                  />
                ))}
              </div>
              <span className="rating-text">
                {product.ratings?.average?.toFixed(1) || "0.0"} (
                {product.ratings?.count || 0} reviews)
              </span>
            </div>

            <div className="product-detail-price">
              ₹{product.price?.toLocaleString()}
            </div>

            <div className="product-seller-info">
              <p>
                Sold by{" "}
                <strong>
                  {product.seller?.sellerInfo?.shopName || product.seller?.name}
                </strong>
              </p>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {(product.material || product.handmadeDetails) && (
              <div className="product-details-list">
                {product.material && (
                  <div className="detail-row">
                    <span>Material</span>
                    <strong>{product.material}</strong>
                  </div>
                )}
                {product.handmadeDetails && (
                  <div className="detail-row">
                    <span>Craft Details</span>
                    <strong>{product.handmadeDetails}</strong>
                  </div>
                )}
                <div className="detail-row">
                  <span>Stock</span>
                  <strong>{product.quantity} units</strong>
                </div>
              </div>
            )}

            {user?.role === "buyer" && product.quantity > 0 && (
              <div className="product-actions">
                <div className="qty-selector">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                >
                  <FiShoppingCart /> Add to Cart
                </button>
                <button
                  className={`btn btn-outline icon-only ${inWishlist ? "wishlisted" : ""}`}
                  onClick={handleWishlist}
                >
                  <FiHeart />
                </button>
              </div>
            )}

            {!user && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/login")}
              >
                Login to Purchase
              </button>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>

          {/* Add Review */}
          {user?.role === "buyer" && !hasReviewed && (
            <div className="add-review-card card">
              <h3>Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Your Rating</label>
                  <StarPicker
                    value={reviewForm.rating}
                    onChange={(r) =>
                      setReviewForm({ ...reviewForm, rating: r })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Your Comment</label>
                  <textarea
                    className="form-control"
                    placeholder="Share your experience with this product..."
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    rows={3}
                    maxLength={500}
                  />
                  <small className="char-count">
                    {reviewForm.comment.length}/500
                  </small>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingReview}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {hasReviewed && (
            <div className="info-note">
              ✓ You have already reviewed this product.
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px" }}>
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.user?.name?.[0]}
                      </div>
                      <div>
                        <p className="reviewer-name">{review.user?.name}</p>
                        <p className="review-date">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="review-right">
                      <div className="stars small">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar
                            key={s}
                            className={
                              s <= review.rating ? "star-filled" : "star-empty"
                            }
                          />
                        ))}
                      </div>
                      {(user?._id === review.user?._id ||
                        user?.role === "admin" ||
                        user?.role === "seller") && (
                        <button
                          className="delete-review-btn"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  {review.sellerReply && (
                    <div className="seller-reply">
                      <strong>Seller Reply:</strong> {review.sellerReply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
