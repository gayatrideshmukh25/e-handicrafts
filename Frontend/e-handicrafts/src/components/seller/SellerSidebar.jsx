import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiStar,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "../common/Sidebar.css";

const SellerSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = [
    { to: "/seller", icon: <FiGrid />, label: "Dashboard", end: true },
    { to: "/seller/products", icon: <FiPackage />, label: "My Products" },
    { to: "/seller/orders", icon: <FiShoppingBag />, label: "Orders" },
    { to: "/seller/reviews", icon: <FiStar />, label: "Reviews" },
    { to: "/profile", icon: <FiUser />, label: "Profile" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">✦ Seller Hub</div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]}</div>
          <div>
            <p className="sidebar-name">{user?.name}</p>
            <p className="sidebar-shop">
              {user?.sellerInfo?.shopName || "My Shop"}
            </p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <FiLogOut />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default SellerSidebar;
