import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!form.password) e.password = "Password required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const user = await login(form);
      if (user.role === "seller") navigate("/seller");
      else if (user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch {}
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <div className="auth-left-logo-mark">E</div>
            <span className="auth-left-logo-name">E-Handicrafts</span>
          </div>
          <h2>
            Welcome back to <em>Artisan India</em>
          </h2>
          <p>
            Sign in to browse authentic handcrafted products and support local
            artisans.
          </p>
        </div>
        <div>
          <div className="auth-left-img">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
              alt="Crafts"
            />
          </div>
          <div className="auth-left-stats">
            <div>
              <strong>50K+</strong>
              <span>Happy Buyers</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>Artisans</span>
            </div>
            <div>
              <strong>4.8★</strong>
              <span>Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h1>Sign In</h1>
          <p className="auth-sub">Welcome back! Please enter your details.</p>

          <div className="auth-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrap">
                  <FiMail className="inp-icon" />
                  <input
                    className={`form-control ${errors.email ? "error" : ""}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                {errors.email && (
                  <span className="error-msg">{errors.email}</span>
                )}
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <FiLock className="inp-icon" />
                  <input
                    className={`form-control ${errors.password ? "error" : ""}`}
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
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
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: 4 }}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
