import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Register = () => {
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
    if (!form.name || form.name.length < 2)
      e.name = "Name must be at least 2 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email is required";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (form.role === "seller" && !form.shopName)
      e.shopName = "Shop name is required";
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
    if (form.role === "seller") {
      payload.sellerInfo = {
        shopName: form.shopName,
        shopDescription: form.shopDescription,
      };
    }
    try {
      const user = await register(payload);
      if (user.role === "seller") navigate("/seller");
      else navigate("/");
    } catch {}
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <h1>✦ E-Handicrafts</h1>
          <p>Join thousands of artisans and craft lovers</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600"
          alt="Crafts"
        />
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join our artisan community</p>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${form.role === "buyer" ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: "buyer" })}
            >
              🛍️ Buyer
            </button>
            <button
              type="button"
              className={`role-btn ${form.role === "seller" ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: "seller" })}
            >
              🎨 Seller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon-wrap">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  className={`form-control ${errors.name ? "error" : ""}`}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  className={`form-control ${errors.email ? "error" : ""}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <span className="error-msg">{errors.email}</span>
              )}
            </div>

            {form.role === "seller" && (
              <>
                <div className="form-group">
                  <label>Shop Name</label>
                  <input
                    type="text"
                    className={`form-control ${errors.shopName ? "error" : ""}`}
                    placeholder="Your shop name"
                    value={form.shopName}
                    onChange={(e) =>
                      setForm({ ...form, shopName: e.target.value })
                    }
                  />
                  {errors.shopName && (
                    <span className="error-msg">{errors.shopName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Shop Description{" "}
                    <span className="optional">(optional)</span>
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Tell buyers about your craft..."
                    value={form.shopDescription}
                    onChange={(e) =>
                      setForm({ ...form, shopDescription: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  className={`form-control ${errors.password ? "error" : ""}`}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
              </div>
              {errors.confirmPassword && (
                <span className="error-msg">{errors.confirmPassword}</span>
              )}
            </div>

            {form.role === "seller" && (
              <div className="info-note">
                ℹ️ Seller accounts require admin approval before you can list
                products.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
