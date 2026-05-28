import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiLock, FiTruck, FiCreditCard } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { placeOrder } from "../../services/api";
import { useRazorpay } from "../../hooks/useRazorpay";
import toast from "react-hot-toast";
import "./Checkout.css";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pay, loading: rzpLoading } = useRazorpay();
  const [codLoading, setCodLoading] = useState(false);
  const [payMethod, setPayMethod] = useState("COD");
  const [addr, setAddr] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    country: "India",
  });
  const [errors, setErrors] = useState({});

  const delivery = (cart.totalAmount || 0) >= 500 ? 0 : 50;
  const grand = (cart.totalAmount || 0) + delivery;
  const a = (k, v) => setAddr((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!addr.name.trim()) e.name = "Required";
    if (!addr.phone || addr.phone.length < 10)
      e.phone = "Valid 10-digit number required";
    if (!addr.street.trim()) e.street = "Required";
    if (!addr.city.trim()) e.city = "Required";
    if (!addr.state.trim()) e.state = "Required";
    if (!addr.pincode || addr.pincode.length < 6)
      e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleCOD = async () => {
    if (!validate()) return;
    setCodLoading(true);
    try {
      const { data } = await placeOrder({
        shippingAddress: addr,
        paymentMethod: "COD",
      });
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setCodLoading(false);
    }
  };

  const handleOnlinePayment = () => {
    if (!validate()) return;
    pay({
      amount: grand,
      user,
      shippingAddress: addr,
      onSuccess: (order) => {
        clearCart();
        navigate(`/orders/${order._id}`);
      },
      onFailure: () => {},
    });
  };

  const handlePlaceOrder = () => {
    if (payMethod === "COD") handleCOD();
    else handleOnlinePayment();
  };

  if (!cart.items?.length) {
    navigate("/cart");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <div className="container checkout-page">
          {/* Progress */}
          <div className="checkout-progress">
            <div className="cp-step done">
              <span>1</span> Cart
            </div>
            <div className="cp-divider done" />
            <div className="cp-step active">
              <span>2</span> Checkout
            </div>
            <div className="cp-divider" />
            <div className="cp-step">
              <span>3</span> Confirmation
            </div>
          </div>

          <div className="checkout-grid">
            {/* Left — address + payment */}
            <div className="checkout-left">
              {/* Address */}
              <div className="card card-pad co-section">
                <h2 className="co-section-title">
                  <FiTruck /> Delivery Address
                </h2>
                <div className="co-grid-2">
                  <div className="form-group">
                    <label className="label">Full Name *</label>
                    <input
                      className={`input ${errors.name ? "error" : ""}`}
                      value={addr.name}
                      onChange={(e) => a("name", e.target.value)}
                      placeholder="Recipient name"
                    />
                    {errors.name && (
                      <span className="error-msg">{errors.name}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label">Phone *</label>
                    <input
                      className={`input ${errors.phone ? "error" : ""}`}
                      value={addr.phone}
                      onChange={(e) => a("phone", e.target.value)}
                      placeholder="10-digit mobile"
                      maxLength={10}
                    />
                    {errors.phone && (
                      <span className="error-msg">{errors.phone}</span>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Street Address *</label>
                  <input
                    className={`input ${errors.street ? "error" : ""}`}
                    value={addr.street}
                    onChange={(e) => a("street", e.target.value)}
                    placeholder="House no., building, street, area"
                  />
                  {errors.street && (
                    <span className="error-msg">{errors.street}</span>
                  )}
                </div>
                <div className="co-grid-3">
                  <div className="form-group">
                    <label className="label">City *</label>
                    <input
                      className={`input ${errors.city ? "error" : ""}`}
                      value={addr.city}
                      onChange={(e) => a("city", e.target.value)}
                    />
                    {errors.city && (
                      <span className="error-msg">{errors.city}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label">State *</label>
                    <input
                      className={`input ${errors.state ? "error" : ""}`}
                      value={addr.state}
                      onChange={(e) => a("state", e.target.value)}
                    />
                    {errors.state && (
                      <span className="error-msg">{errors.state}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label">Pincode *</label>
                    <input
                      className={`input ${errors.pincode ? "error" : ""}`}
                      value={addr.pincode}
                      onChange={(e) => a("pincode", e.target.value)}
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <span className="error-msg">{errors.pincode}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="card card-pad co-section">
                <h2 className="co-section-title">
                  <FiCreditCard /> Payment Method
                </h2>
                <div className="pay-opts">
                  {[
                    {
                      id: "COD",
                      icon: "💵",
                      title: "Cash on Delivery",
                      desc: "Pay when your order arrives",
                      badge: null,
                    },
                    {
                      id: "Online",
                      icon: "💳",
                      title: "Pay Online",
                      desc: "UPI, Cards, Net Banking via Razorpay",
                      badge: "Instant Confirmation",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`pay-opt ${payMethod === opt.id ? "selected" : ""}`}
                      onClick={() => setPayMethod(opt.id)}
                    >
                      <div className="pay-opt-radio">
                        {payMethod === opt.id && <FiCheck size={11} />}
                      </div>
                      <div className="pay-opt-icon">{opt.icon}</div>
                      <div className="pay-opt-info">
                        <div className="pay-opt-title">
                          {opt.title}
                          {opt.badge && (
                            <span className="pay-opt-badge">{opt.badge}</span>
                          )}
                        </div>
                        <p className="pay-opt-desc">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {payMethod === "Online" && (
                  <div className="razorpay-info">
                    <FiLock size={13} /> Secured by Razorpay &nbsp;·&nbsp;
                    256-bit SSL Encryption
                    <div className="rzp-logos">
                      {[
                        "UPI",
                        "Visa",
                        "Mastercard",
                        "RuPay",
                        "Net Banking",
                      ].map((p) => (
                        <span key={p} className="rzp-logo-chip">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right — order summary */}
            <div className="checkout-right">
              <div className="card card-pad co-summary">
                <h2 className="co-section-title">Order Summary</h2>

                <div className="co-items">
                  {cart.items.map((item) => {
                    const p = item.product;
                    if (!p) return null;
                    return (
                      <div key={p._id} className="co-item">
                        <div className="co-item-img-wrap">
                          <img
                            src={
                              p.images?.[0] ||
                              "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=100&q=80"
                            }
                            alt={p.name}
                            className="co-item-img"
                          />
                          <span className="co-item-qty">{item.quantity}</span>
                        </div>
                        <div className="co-item-info">
                          <p className="co-item-name">{p.name}</p>
                          <p className="co-item-cat">{p.category}</p>
                        </div>
                        <span className="co-item-price">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="co-divider" />
                <div className="summary-line">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{cart.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="summary-line">
                  <span>Delivery</span>
                  <span>
                    {delivery === 0 ? (
                      <span className="summary-free">FREE</span>
                    ) : (
                      `₹${delivery}`
                    )}
                  </span>
                </div>
                {delivery === 0 && (
                  <p className="co-free-note">
                    🎉 You qualify for free delivery!
                  </p>
                )}
                <div className="summary-line total">
                  <span>Total</span>
                  <span>₹{grand.toLocaleString("en-IN")}</span>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg co-place-btn"
                  onClick={handlePlaceOrder}
                  disabled={codLoading || rzpLoading}
                >
                  {codLoading || rzpLoading
                    ? "Processing…"
                    : payMethod === "Online"
                      ? `Pay ₹${grand.toLocaleString("en-IN")}`
                      : `Place Order · ₹${grand.toLocaleString("en-IN")}`}
                </button>

                <p className="co-secure-note">
                  <FiLock size={11} /> Your personal data is protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
