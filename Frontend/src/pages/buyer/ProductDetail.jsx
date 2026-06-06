import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiHeart, FiChevronLeft, FiTrash2, FiCheck } from 'react-icons/fi';
import Navbar from '../../components/common/Navbar';
import { getProduct, getProductReviews, addReview, deleteReview, toggleWishlist, getWishlist } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetail.css';

function Stars({ rating, size = 13 }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <FiStar key={s} style={{ width: size, height: size }} className={s <= Math.round(rating) ? 'star-on' : 'star-off'} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams(); const navigate = useNavigate();
  const { addToCart } = useCart(); const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => { fetchProduct(); fetchReviews(); if (user?.role === 'buyer') fetchWishlistStatus(); }, [id]);

  const fetchProduct = async () => {
    try { const { data } = await getProduct(id); setProduct(data.product); }
    catch { toast.error('Product not found'); navigate('/'); }
    finally { setLoading(false); }
  };
  const fetchReviews = async () => {
    try {
      const { data } = await getProductReviews(id);
      setReviews(data.reviews);
      if (user) setHasReviewed(data.reviews.some(r => r.user?._id === user._id));
    } catch {}
  };
  const fetchWishlistStatus = async () => {
    try { const { data } = await getWishlist(); setInWishlist(data.wishlist?.products?.some(p => (p._id || p) === id)); } catch {}
  };

  const handleCart = () => { if (!user) { navigate('/login'); return; } addToCart(product._id, qty); };
  const handleWish = async () => {
    if (!user) { navigate('/login'); return; }
    try { await toggleWishlist({ productId: id }); setInWishlist(!inWishlist); toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist'); } catch {}
  };
  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      const { data } = await addReview({ productId: id, ...reviewForm });
      setReviews([data.review, ...reviews]); setHasReviewed(true); setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!'); fetchProduct();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };
  const handleDeleteReview = async (rid) => {
    try { await deleteReview(rid); setReviews(reviews.filter(r => r._id !== rid)); toast.success('Review deleted'); fetchProduct(); } catch {}
  };

  if (loading) return <><Navbar /><div className="loading-spinner"><div className="spinner"></div></div></>;
  if (!product) return null;

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80'];

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: 'var(--nav-h)' }}>
        <div className="container pd-page fade-in">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">Home</Link><span className="breadcrumb-sep">/</span>
            <Link to={`/?category=${product.category}`}>{product.category}</Link><span className="breadcrumb-sep">/</span>
            <span>{product.name}</span>
          </div>

          <div className="pd-grid">
            {/* Images */}
            <div className="pd-images">
              <div className="pd-main-img"><img src={images[activeImg]} alt={product.name} /></div>
              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.map((img, i) => (
                    <button key={i} className={`pd-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                      <img src={img} alt={`${i+1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="pd-info">
              <div className="pd-badges">
                <span className="badge badge-blue">{product.category}</span>
                {product.isHandmade && <span className="badge badge-green">✦ Handmade</span>}
                {product.quantity === 0 && <span className="badge badge-red">Out of Stock</span>}
                {product.quantity > 0 && product.quantity <= 5 && <span className="badge badge-gold">Only {product.quantity} left</span>}
              </div>

              <h1 className="pd-name">{product.name}</h1>

              <div className="pd-rating-row">
                <Stars rating={product.ratings?.average || 0} size={15} />
                <span className="pd-rating-val">{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                <span className="pd-rating-count">({product.ratings?.count || 0} reviews)</span>
              </div>

              <div className="pd-divider" />
              <div className="pd-price">₹{product.price?.toLocaleString('en-IN')}</div>
              <p className="pd-delivery">{product.price >= 500 ? '🚚 Free delivery' : '🚚 ₹50 delivery charge'}</p>

              <div className="pd-seller">
                <div className="pd-seller-av">{product.seller?.name?.[0]}</div>
                <div>
                  <p className="pd-seller-name">{product.seller?.sellerInfo?.shopName || product.seller?.name}</p>
                  <p className="pd-seller-sub">Verified Seller</p>
                </div>
              </div>

              <div className="pd-desc">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>

              {(product.material || product.handmadeDetails) && (
                <div className="pd-specs">
                  {product.material && <div className="pd-spec-row"><span>Material</span><span>{product.material}</span></div>}
                  {product.handmadeDetails && <div className="pd-spec-row"><span>Craft Details</span><span>{product.handmadeDetails}</span></div>}
                  <div className="pd-spec-row"><span>Availability</span><span>{product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}</span></div>
                </div>
              )}

              {user?.role === 'buyer' && product.quantity > 0 && (
                <>
                  <div className="pd-qty-row">
                    <span className="pd-qty-label">Qty:</span>
                    <div className="qty-box">
                      <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(Math.min(product.quantity, qty + 1))}>+</button>
                    </div>
                  </div>
                  <div className="pd-actions">
                    <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleCart}>
                      <FiShoppingCart /> Add to Cart
                    </button>
                    <button className={`pd-wish-btn ${inWishlist ? 'active' : ''}`} onClick={handleWish}>
                      <FiHeart />
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/login')}>
                  Sign in to Purchase
                </button>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="pd-reviews">
            <h2>Customer Reviews</h2>

            <div className="pd-review-summary">
              <div className="pd-avg-score">{product.ratings?.average?.toFixed(1) || '0.0'}</div>
              <div>
                <Stars rating={product.ratings?.average || 0} size={18} />
                <p className="pd-avg-count" style={{ marginTop: 4 }}>{product.ratings?.count || 0} reviews</p>
              </div>
            </div>

            {user?.role === 'buyer' && !hasReviewed && (
              <div className="pd-add-review">
                <h3>Write a Review</h3>
                <form onSubmit={handleReview}>
                  <div className="form-group">
                    <label>Your Rating</label>
                    <div className="star-picker">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" className={`star-pick ${s <= reviewForm.rating ? 'on' : ''}`} onClick={() => setReviewForm({...reviewForm, rating: s})}>★</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Your Comment</label>
                    <textarea className="form-control" rows={3} placeholder="Share your experience…"
                      value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} maxLength={500} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink-4)' }}>{reviewForm.comment.length}/500</span>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
            {hasReviewed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--green-light)', borderRadius: 'var(--r-sm)', marginBottom: 20, fontSize: '0.875rem', color: 'var(--green)', fontWeight: 600 }}>
                <FiCheck /> You've reviewed this product
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="es-icon">💬</div>
                <h3>No reviews yet</h3>
                <p>Be the first to review this product</p>
              </div>
            ) : (
              <div className="pd-reviews-list">
                {reviews.map(rv => (
                  <div key={rv._id} className="pd-review">
                    <div className="pd-review-head">
                      <div className="pd-reviewer">
                        <div className="pd-reviewer-av">{rv.user?.name?.[0]}</div>
                        <div>
                          <p className="pd-reviewer-name">{rv.user?.name}</p>
                          <Stars rating={rv.rating} size={12} />
                          <p className="pd-reviewer-date">{new Date(rv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      {(user?._id === rv.user?._id || user?.role === 'admin' || user?.role === 'seller') && (
                        <button className="pd-review-del" onClick={() => handleDeleteReview(rv._id)}><FiTrash2 /></button>
                      )}
                    </div>
                    <p className="pd-review-text">{rv.comment}</p>
                    {rv.sellerReply && <div className="pd-seller-reply"><strong>Seller:</strong> {rv.sellerReply}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
