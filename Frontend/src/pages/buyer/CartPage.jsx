import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart?.totalAmount || 0;
  const delivery = subtotal >= 500 ? 0 : 50;
  const grandTotal = subtotal + delivery;

  const handleCheckout = () => {
    if (!cart?.items?.length) return;

    // 🔥 send snapshot to avoid mismatch issues later
    navigate("/checkout", {
      state: {
        cartSnapshot: {
          items: cart.items,
          subtotal,
          delivery,
          grandTotal,
        },
      },
    });
  };

  if (!Array.isArray(cart?.items) || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: "var(--nav-h)" }}>
          <div className="container cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>
              Your cart is empty
            </h2>
            <p style={{ color: "var(--ink-4)", marginBottom: 24 }}>
              Add some handcrafted items to get started
            </p>
            <Link to="/" className="btn btn-primary btn-lg">
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

      <div
        style={{
          paddingTop: "var(--nav-h)",
          background: "var(--surface-2)",
          minHeight: "100vh",
        }}
      >
        <div className="container cart-page fade-in">
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(-1)}
            >
              <FiArrowLeft /> Continue Shopping
            </button>

            <h1 style={{ margin: 0 }}>
              Cart{" "}
              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--ink-4)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                }}
              >
                ({cart.items.length} items)
              </span>
            </h1>
          </div>

          <div className="cart-layout">
            {/* ITEMS */}
            <div className="cart-items">
              {cart.items.map((item) => {
                if (!item?.product?._id) return null;

                const p = item.product;

                const img =
                  p.images?.[0] ||
                  "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=200&q=80";

                return (
                  <div key={item._id || p._id} className="cart-item">
                    <Link to={`/products/${p._id}`}>
                      <img src={img} alt={p.name} className="cart-item-img" />
                    </Link>

                    <div className="cart-item-info">
                      <p className="cart-item-cat">{p.category}</p>

                      <Link to={`/products/${p._id}`}>
                        <p className="cart-item-name">{p.name}</p>
                      </Link>

                      <p className="cart-item-price">
                        ₹{item.price?.toLocaleString("en-IN")} each
                      </p>

                      {p.quantity <= 5 && p.quantity > 0 && (
                        <p className="cart-item-stock-warn">
                          ⚠ Only {p.quantity} left in stock
                        </p>
                      )}
                    </div>

                    <div className="cart-item-controls">
                      {/* QUANTITY */}
                      <div className="qty-box">
                        <button
                          onClick={() =>
                            updateQuantity(p._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              p._id,
                              item.quantity < p.quantity
                                ? item.quantity + 1
                                : item.quantity,
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      {/* subtotal */}
                      <span className="cart-item-subtotal">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>

                      {/* remove */}
                      <button
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(p._id)}
                        title="Remove"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}
            <div className="cart-summary">
              <div className="cart-summary-card">
                <h2>Order Summary</h2>

                <div className="summary-row">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <span>
                    {delivery === 0 ? (
                      <span className="free">FREE</span>
                    ) : (
                      `₹${delivery}`
                    )}
                  </span>
                </div>

                {delivery === 0 ? (
                  <p className="free-delivery-msg">🎉 You get free delivery!</p>
                ) : (
                  <p className="need-more-msg">
                    Add ₹{(500 - subtotal).toFixed(0)} more for free delivery
                  </p>
                )}

                <div className="summary-row total" style={{ marginTop: 16 }}>
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                {/* CHECKOUT BUTTON */}
                <button
                  className="btn btn-primary btn-block btn-lg"
                  style={{ marginTop: 16 }}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout →
                </button>

                <Link
                  to="/"
                  className="btn btn-outline btn-block"
                  style={{ marginTop: 8 }}
                >
                  Continue Shopping
                </Link>
              </div>

              {/* TRUST */}
              <div
                style={{
                  marginTop: 14,
                  padding: "14px",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-lg)",
                }}
              >
                {[
                  "🔒 Secure payment",
                  "🚚 Reliable delivery",
                  "↩ Easy returns",
                ].map((t) => (
                  <div
                    key={t}
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--ink-4)",
                      padding: "4px 0",
                      fontWeight: 500,
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
