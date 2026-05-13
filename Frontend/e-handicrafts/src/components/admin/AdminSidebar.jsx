import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiPackage, FiShoppingBag, FiStar, FiLogOut, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../components/common/Sidebar.css';

const AdminSidebar = () => {
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
      <div className="sidebar-header">
        <div className="sidebar-logo">✦ Admin Panel</div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]}</div>
          <div>
            <p className="sidebar-name">{user?.name}</p>
            <p className="sidebar-role">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            {link.icon}<span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <FiLogOut /><span>Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
