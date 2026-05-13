import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'seller') return '/seller';
    if (user?.role === 'admin') return '/admin';
    return '/profile';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">E-Handicrafts</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/?category=Wood Crafts" onClick={() => setMenuOpen(false)}>Wood</Link>
          <Link to="/?category=Pottery" onClick={() => setMenuOpen(false)}>Pottery</Link>
          <Link to="/?category=Jewellery" onClick={() => setMenuOpen(false)}>Jewellery</Link>
          <Link to="/?category=Textile" onClick={() => setMenuOpen(false)}>Textile</Link>
        </div>

        <div className="navbar-actions">
          {isAuthenticated && user?.role === 'buyer' && (
            <>
              <Link to="/wishlist" className="icon-btn" title="Wishlist">
                <FiHeart />
              </Link>
              <Link to="/cart" className="icon-btn cart-btn" title="Cart">
                <FiShoppingCart />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="user-dropdown">
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                  <div className="user-initials">{user?.name?.[0]?.toUpperCase()}</div>
                )}
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-role">{user?.role}</p>
                  </div>
                  <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)}>
                    <FiUser /> Dashboard
                  </Link>
                  {user?.role === 'buyer' && (
                    <Link to="/orders" onClick={() => setDropdownOpen(false)}>
                      <FiPackage /> My Orders
                    </Link>
                  )}
                  <button onClick={handleLogout} className="logout-btn">
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
