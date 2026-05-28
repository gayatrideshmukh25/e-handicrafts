import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <FiStar key={s} className={s <= Math.round(rating) ? 'star-on' : 'star-off'} />
      ))}
    </div>
  );
}

export default function ProductCard({ product, onWishlistToggle, inWishlist }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80';

  const handleCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    addToCart(product._id);
  };

  const handleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (onWishlistToggle) onWishlistToggle(product._id);
  };

  return (
    <Link to={`/products/${product._id}`} className="pcard fade-up">
      <div className="pcard-img">
        <img src={img} alt={product.name} loading="lazy" />
        {product.quantity === 0 && <span className="pcard-label oos">Out of Stock</span>}
        {product.quantity > 0 && product.quantity <= 5 && <span className="pcard-label low">Only {product.quantity} left</span>}
        <div className="pcard-actions">
          {onWishlistToggle && (
            <button className={`pcard-action-btn ${inWishlist ? 'wished' : ''}`} onClick={handleWish} title="Wishlist">
              <FiHeart />
            </button>
          )}
          <button className="pcard-action-btn" onClick={handleCart} disabled={product.quantity === 0} title="Add to cart">
            <FiShoppingCart />
          </button>
        </div>
      </div>
      <div className="pcard-body">
        <p className="pcard-cat">{product.category}</p>
        <p className="pcard-name">{product.name}</p>
        <div className="pcard-meta">
          <Stars rating={product.ratings?.average || 0} />
          <span className="pcard-rating">({product.ratings?.count || 0})</span>
        </div>
        <div className="pcard-footer">
          <span className="pcard-price">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.isHandmade && <span className="pcard-hmade">✦ Handmade</span>}
        </div>
      </div>
    </Link>
  );
}
