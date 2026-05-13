import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { placeOrder } from "../../services/api";
import toast from "react-hot-toast";
import "./Checkout.css";

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    country: "India",
  });
  const [errors, setErrors] = useState({});

  const deliveryCharge = (cart.totalAmount || 0) >= 500 ? 0 : 50;
  const grandTotal = (cart.totalAmount || 0) + deliveryCharge;

  const validate = () => {
    const e = {};
    if (!address.name) e.name = "Name is required";
    if (!address.phone || address.phone.length < 10)
      e.phone = "Valid phone is required";
    if (!address.street) e.street = "Street address is required";
    if (!address.city) e.city = "City is required";
    if (!address.state) e.state = "State is required";
    if (!address.pincode || address.pincode.length < 6)
      e.pincode = "Valid pincode is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await placeOrder({
        shippingAddress: address,
        paymentMethod,
      });
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container checkout-page fade-in">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Address Form */}
          <div className="checkout-form">
            <div className="card checkout-section">
              <h2>Delivery Address</h2>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    className={`form-control ${errors.name ? "error" : ""}`}
                    value={address.name}
                    onChange={(e) =>
                      setAddress({ ...address, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <span className="error-msg">{errors.name}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    className={`form-control ${errors.phone ? "error" : ""}`}
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    maxLength={10}
                  />
                  {errors.phone && (
                    <span className="error-msg">{errors.phone}</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  className={`form-control ${errors.street ? "error" : ""}`}
                  placeholder="House no., Street, Area..."
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                />
                {errors.street && (
                  <span className="error-msg">{errors.street}</span>
                )}
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    className={`form-control ${errors.city ? "error" : ""}`}
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />
                  {errors.city && (
                    <span className="error-msg">{errors.city}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    className={`form-control ${errors.state ? "error" : ""}`}
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                  />
                  {errors.state && (
                    <span className="error-msg">{errors.state}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    className={`form-control ${errors.pincode ? "error" : ""}`}
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress({ ...address, pincode: e.target.value })
                    }
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <span className="error-msg">{errors.pincode}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="card checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                {["COD", "Online"].map((m) => (
                  <label
                    key={m}
                    className={`payment-option ${paymentMethod === m ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      value={m}
                      checked={paymentMethod === m}
                      onChange={() => setPaymentMethod(m)}
                    />
                    <div className="payment-icon">
                      {m === "COD" ? "💵" : "💳"}
                    </div>
                    <div>
                      <strong>
                        {m === "COD" ? "Cash on Delivery" : "Online Payment"}
                      </strong>
                      <p>
                        {m === "COD"
                          ? "Pay when your order arrives"
                          : "Pay securely online"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="card checkout-section">
              <h2>Order Summary</h2>
              <div className="checkout-items">
                {cart.items.map((item) => {
                  const p = item.product;
                  if (!p) return null;
                  return (
                    <div key={item._id} className="checkout-item">
                      <img
                        src={
                          p.images?.[0] ||
                          "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=100"
                        }
                        alt={p.name}
                      />
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">{p.name}</p>
                        <p className="checkout-item-qty">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="checkout-item-price">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cart.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span style={{ color: "#198754", fontWeight: 600 }}>
                      FREE
                    </span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handleOrder}
                disabled={loading}
              >
                {loading
                  ? "Placing Order..."
                  : `Place Order · ₹${grandTotal.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
