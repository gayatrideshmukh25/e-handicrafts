import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser,
  FiLogOut, FiPackage, FiGrid, FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const CATS = ['Wood Crafts','Pottery','Jewellery','Decor','Textile'];

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [drop, setDrop] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    else { navigate(`/?search=${encodeURIComponent(query)}`); }
  };

  const handleLogout = () => { logout(); navigate('/'); setDrop(false); };

  const getDashLink = () => {
    if (user?.role === 'seller') return '/seller';
    if (user?.role === 'admin') return '/admin';
    return '/profile';
  };

  return (
    <header>
      <nav className="navbar">
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-mark">E</div>
            <div className="nav-logo-text">E‑<span>Handicrafts</span></div>
          </Link>

          {/* Search */}
          <form className="nav-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for handmade products, crafts…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="nav-search-btn"><FiSearch /></button>
          </form>

          {/* Actions */}
          <div className="nav-actions">
            {user?.role === 'buyer' && (
              <>
                <Link to="/wishlist" className="nav-action-btn">
                  <FiHeart />
                  <span className="nav-action-label">Wishlist</span>
                </Link>
                <Link to="/cart" className="nav-action-btn">
                  <FiShoppingCart />
                  {cartCount > 0 && <span className="nav-cart-count">{cartCount > 99 ? '99+' : cartCount}</span>}
                  <span className="nav-action-label">Cart</span>
                </Link>
              </>
            )}

            {user ? (
              <div className="nav-user" ref={dropRef}>
                <button className="nav-user-trigger" onClick={() => setDrop(!drop)}>
                  <div className="nav-avatar">{user.name?.[0]?.toUpperCase()}</div>
                  <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
                  <FiChevronDown style={{ fontSize: '0.8rem', color: 'var(--ink-4)' }} />
                </button>
                {drop && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-head">
                      <p>{user.name}</p>
                      <span>{user.email}</span>
                    </div>
                    <Link to={getDashLink()} onClick={() => setDrop(false)}>
                      <FiGrid /> Dashboard
                    </Link>
                    {user.role === 'buyer' && (
                      <Link to="/orders" onClick={() => setDrop(false)}>
                        <FiPackage /> My Orders
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setDrop(false)}>
                      <FiUser /> Profile
                    </Link>
                    <button onClick={handleLogout}>
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
