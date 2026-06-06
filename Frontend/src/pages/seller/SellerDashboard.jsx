import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus, FiArrowRight } from 'react-icons/fi';
import SellerSidebar from '../../components/seller/SellerSidebar';
import { getSellerDashboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getSellerDashboard().then(({ data }) => setStats(data.stats)).finally(() => setLoading(false)); }, []);

  const cards = stats ? [
    { label: 'Total Products', value: stats.totalProducts, icon: <FiPackage />, color: 'primary', link: '/seller/products' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingBag />, color: 'info', link: '/seller/orders' },
    { label: 'Completed Sales', value: stats.totalSales, icon: <FiTrendingUp />, color: 'success', link: '/seller/orders' },
    { label: 'Revenue Earned', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: 'accent', link: '/seller/orders' },
  ] : [];

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        {/* Welcome */}
        <div style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)', borderRadius: 'var(--r-xl)', padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <p style={{ opacity: 0.8, fontSize: '0.82rem', marginBottom: 4 }}>Welcome back,</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#fff', margin: 0 }}>{user?.sellerInfo?.shopName || user?.name}</h1>
            <p style={{ opacity: 0.7, fontSize: '0.8rem', marginTop: 4 }}>Manage your products and track your sales</p>
          </div>
          <Link to="/seller/products/new" className="btn" style={{ background: '#fff', color: 'var(--brand)', fontWeight: 700 }}>
            <FiPlus /> Add Product
          </Link>
        </div>

        <h2 className="dashboard-title" style={{ fontSize: '1.1rem' }}>Overview</h2>
        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <>
            <div className="stats-grid">
              {cards.map(c => (
                <Link to={c.link} key={c.label} className="stat-card" style={{ textDecoration: 'none', transition: 'box-shadow 0.18s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--sh-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  <div className={`stat-icon ${c.color}`}>{c.icon}</div>
                  <div>
                    <p className="stat-value">{c.value}</p>
                    <p className="stat-label">{c.label}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: '20px 22px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ink-4)', marginBottom: 14 }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { to: '/seller/products/new', label: 'Add a new product', icon: <FiPlus /> },
                  { to: '/seller/products', label: 'Manage my products', icon: <FiPackage /> },
                  { to: '/seller/orders', label: 'View & update orders', icon: <FiShoppingBag /> },
                ].map(l => (
                  <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', textDecoration: 'none', color: 'var(--ink-2)', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{l.icon}{l.label}</span>
                    <FiArrowRight style={{ color: 'var(--ink-5)' }} />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
