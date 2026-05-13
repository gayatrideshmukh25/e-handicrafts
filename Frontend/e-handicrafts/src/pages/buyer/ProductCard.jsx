import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import "./ProductCard.css";

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          className={s <= Math.round(rating) ? "star-filled" : "star-empty"}
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product, onWishlistToggle, inWishlist }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) onWishlistToggle(product._id);
  };

  const imageUrl =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400";

  return (
    <Link to={`/products/${product._id}`} className="product-card fade-in">
      <div className="product-card-image">
        <img src={imageUrl} alt={product.name} loading="lazy" />
        {product.quantity === 0 && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
        {product.quantity > 0 && product.quantity <= 5 && (
          <div className="low-stock-badge">Only {product.quantity} left</div>
        )}
        <div className="product-card-actions">
          {onWishlistToggle && (
            <button
              className={`wishlist-btn ${inWishlist ? "active" : ""}`}
              onClick={handleWishlist}
              title="Wishlist"
            >
              <FiHeart />
            </button>
          )}
          <button
            className="add-cart-btn"
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            title="Add to Cart"
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>

      <div className="product-card-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-meta">
          <StarRating rating={product.ratings?.average || 0} />
          <span className="review-count">({product.ratings?.count || 0})</span>
        </div>
        <div className="product-footer">
          <span className="product-price">
            ₹{product.price?.toLocaleString()}
          </span>
          {product.isHandmade && (
            <span className="handmade-tag">✦ Handmade</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
