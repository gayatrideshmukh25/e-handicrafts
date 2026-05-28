import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiPackage, FiShoppingBag, FiStar, FiLogOut, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../common/Sidebar.css';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { to: '/admin', icon: <FiGrid />, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { to: '/admin/sellers', icon: <FiUserCheck />, label: 'Sellers' },
    { to: '/admin/products', icon: <FiPackage />, label: 'Products' },
    { to: '/admin/orders', icon: <FiShoppingBag />, label: 'Orders' },
    { to: '/admin/reviews', icon: <FiStar />, label: 'Reviews' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">E</div>
        <span className="sidebar-brand-name">Admin Panel</span>
      </div>
      <div className="sidebar-user">
        <div className="sidebar-avatar">{user?.name?.[0]}</div>
        <div>
          <p className="sidebar-uname">{user?.name}</p>
          <p className="sidebar-urole">Administrator</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            {l.icon}<span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={handleLogout}><FiLogOut /><span>Sign Out</span></button>
      </div>
    </aside>
  );
}
