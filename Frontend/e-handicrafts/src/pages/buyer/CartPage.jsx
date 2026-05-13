import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const deliveryCharge = cart.totalAmount >= 500 ? 0 : 50;
  const grandTotal = (cart.totalAmount || 0) + deliveryCharge;

  if (!cart.items || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="empty-state" style={{ marginTop: "60px" }}>
            <div style={{ fontSize: "4rem" }}>🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some handcrafted items to get started</p>
            <Link
              to="/"
              className="btn btn-primary btn-lg"
              style={{ marginTop: "20px" }}
            >
              <FiShoppingBag /> Browse Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container cart-page fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Continue Shopping
          </button>
          <h1>
            Shopping Cart{" "}
            <span className="count-badge">({cart.items.length} items)</span>
          </h1>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => {
              const p = item.product;
              if (!p) return null;
              const img =
                p.images?.[0] ||
                "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=200";
              return (
                <div key={item._id} className="cart-item card">
                  <Link to={`/products/${p._id}`}>
                    <img src={img} alt={p.name} className="cart-item-image" />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/products/${p._id}`}>
                      <h3 className="cart-item-name">{p.name}</h3>
                    </Link>
                    <p className="cart-item-price">
                      ₹{item.price?.toLocaleString()}
                    </p>
                    {p.quantity < 10 && p.quantity > 0 && (
                      <p className="stock-warning">
                        Only {p.quantity} in stock
                      </p>
                    )}
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-selector">
                      <button
                        onClick={() => updateQuantity(p._id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            p._id,
                            Math.min(p.quantity, item.quantity + 1),
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <p className="cart-item-total">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(p._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cart.totalAmount?.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0 ? (
                  <span className="free-delivery">FREE</span>
                ) : (
                  `₹${deliveryCharge}`
                )}
              </span>
            </div>
            {deliveryCharge > 0 && (
              <p className="free-delivery-note">
                Add ₹{(500 - cart.totalAmount).toFixed(0)} more for free
                delivery
              </p>
            )}
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
            <Link
              to="/"
              className="btn btn-outline btn-block"
              style={{ marginTop: "10px" }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
