import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: searchParams.get("role") || "buyer",
    shopName: "",
    shopDescription: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = "At least 2 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!form.password || form.password.length < 6)
      e.password = "At least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match";
    if (form.role === "seller" && !form.shopName)
      e.shopName = "Shop name required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };
    if (form.role === "seller")
      payload.sellerInfo = {
        shopName: form.shopName,
        shopDescription: form.shopDescription,
      };
    try {
      const user = await register(payload);
      if (user.role === "seller") navigate("/seller");
      else navigate("/");
    } catch {}
  };

  const f = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <div className="auth-left-logo-mark">E</div>
            <span className="auth-left-logo-name">E-Handicrafts</span>
          </div>
          <h2>
            Join the <em>Artisan Community</em>
          </h2>
          <p>
            Buy unique handmade goods or sell your crafts to thousands of buyers
            across India.
          </p>
        </div>
        <div>
          <div className="auth-left-img">
            <img
              src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80"
              alt="Crafts"
            />
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h1>Create Account</h1>
          <p className="auth-sub">
            Join thousands of artisans and craft lovers.
          </p>

          <div className="auth-card">
            <div className="role-toggle">
              <button
                type="button"
                className={`role-opt ${form.role === "buyer" ? "active" : ""}`}
                onClick={() => f("role", "buyer")}
              >
                🛍 Buyer
              </button>
              <button
                type="button"
                className={`role-opt ${form.role === "seller" ? "active" : ""}`}
                onClick={() => f("role", "seller")}
              >
                🎨 Seller
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrap">
                  <FiUser className="inp-icon" />
                  <input
                    className={`form-control ${errors.name ? "error" : ""}`}
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => f("name", e.target.value)}
                  />
                </div>
                {errors.name && (
                  <span className="error-msg">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-wrap">
                  <FiMail className="inp-icon" />
                  <input
                    className={`form-control ${errors.email ? "error" : ""}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => f("email", e.target.value)}
                  />
                </div>
                {errors.email && (
                  <span className="error-msg">{errors.email}</span>
                )}
              </div>

              {form.role === "seller" && (
                <>
                  <div className="form-group">
                    <label>Shop Name *</label>
                    <input
                      className={`form-control ${errors.shopName ? "error" : ""}`}
                      placeholder="Your shop name"
                      value={form.shopName}
                      onChange={(e) => f("shopName", e.target.value)}
                    />
                    {errors.shopName && (
                      <span className="error-msg">{errors.shopName}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Shop Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Briefly describe your craft…"
                      value={form.shopDescription}
                      onChange={(e) => f("shopDescription", e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <FiLock className="inp-icon" />
                  <input
                    className={`form-control ${errors.password ? "error" : ""}`}
                    type={showPass ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => f("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-msg">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrap">
                  <FiLock className="inp-icon" />
                  <input
                    className={`form-control ${errors.confirmPassword ? "error" : ""}`}
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => f("confirmPassword", e.target.value)}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="error-msg">{errors.confirmPassword}</span>
                )}
              </div>

              {form.role === "seller" && (
                <div className="info-note" style={{ marginBottom: 16 }}>
                  ℹ️ Seller accounts require admin approval before listing
                  products.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
