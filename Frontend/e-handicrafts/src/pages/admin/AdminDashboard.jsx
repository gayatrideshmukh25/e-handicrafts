import React, { useEffect, useState } from 'react';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiUserCheck } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminAnalytics } from '../../services/api';
import '../../components/common/Sidebar.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#c8502d','#2d4a3e','#e8b84b','#4a90d9','#7c5cbf','#e06d9b'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAnalytics()
      .then(({ data }) => setAnalytics(data.analytics))
      .finally(() => setLoading(false));
  }, []);

  const cards = analytics ? [
    { label: 'Total Buyers', value: analytics.totalUsers, icon: <FiUsers />, color: 'primary' },
    { label: 'Total Sellers', value: analytics.totalSellers, icon: <FiUserCheck />, color: 'secondary' },
    { label: 'Total Products', value: analytics.totalProducts, icon: <FiPackage />, color: 'accent' },
    { label: 'Total Orders', value: analytics.totalOrders, icon: <FiShoppingBag />, color: 'info' },
    { label: 'Revenue', value: `₹${analytics.totalRevenue?.toLocaleString() || 0}`, icon: <FiDollarSign />, color: 'primary' },
  ] : [];

  const chartData = analytics?.monthlyOrders?.map((m) => ({
    name: MONTHS[m._id.month - 1],
    orders: m.orders,
    revenue: Math.round(m.revenue),
  })) || [];

  const pieData = analytics?.categoryStats?.map((c) => ({ name: c._id, value: c.count })) || [];

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <>
            <div className="stats-grid">
              {cards.map((c) => (
                <div key={c.label} className="stat-card">
                  <div className={`stat-icon ${c.color}`}>{c.icon}</div>
                  <div className="stat-info">
                    <p className="stat-value">{c.value}</p>
                    <p className="stat-label">{c.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              {/* Bar Chart */}
              <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Monthly Orders & Revenue</h2>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="orders" name="Orders" fill="#2d4a3e" radius={[4,4,0,0]} />
                      <Bar dataKey="revenue" name="Revenue ₹" fill="#c8502d" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No data yet</p>}
              </div>

              {/* Pie Chart */}
              <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Products by Category</h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No data yet</p>}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
