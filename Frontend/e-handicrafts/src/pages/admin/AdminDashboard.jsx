import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiUserCheck, FiArrowRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminAnalytics } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#c0392b','#2d4a3e','#d4a017','#1a5fa8','#7c5cbf','#e06d9b'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAdminAnalytics().then(({ data }) => setAnalytics(data.analytics)).finally(() => setLoading(false)); }, []);

  const cards = analytics ? [
    { label:'Total Buyers', value: analytics.totalUsers, icon:<FiUsers />, color:'primary', to:'/admin/users' },
    { label:'Total Sellers', value: analytics.totalSellers, icon:<FiUserCheck />, color:'info', to:'/admin/sellers' },
    { label:'Total Products', value: analytics.totalProducts, icon:<FiPackage />, color:'accent', to:'/admin/products' },
    { label:'Total Orders', value: analytics.totalOrders, icon:<FiShoppingBag />, color:'success', to:'/admin/orders' },
    { label:'Platform Revenue', value:`₹${(analytics.totalRevenue||0).toLocaleString('en-IN')}`, icon:<FiDollarSign />, color:'primary', to:'/admin/orders' },
  ] : [];

  const chartData = analytics?.monthlyOrders?.map(m => ({ name: MONTHS[m._id.month-1], orders: m.orders, revenue: Math.round(m.revenue/1000) })) || [];
  const pieData = analytics?.categoryStats?.map(c => ({ name: c._id, value: c.count })) || [];

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <div style={{ marginBottom:24 }}>
          <h1 className="dashboard-title" style={{ marginBottom:2 }}>Platform Overview</h1>
          <p style={{ color:'var(--ink-4)', fontSize:'0.85rem' }}>Welcome back, {user?.name}</p>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <>
            <div className="stats-grid">
              {cards.map(c => (
                <Link key={c.label} to={c.to} className="stat-card" style={{ textDecoration:'none' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='var(--sh-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow=''}>
                  <div className={`stat-icon ${c.color}`}>{c.icon}</div>
                  <div><p className="stat-value">{c.value}</p><p className="stat-label">{c.label}</p></div>
                </Link>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:20 }}>
              <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'var(--r-xl)', padding:22 }}>
                <h3 style={{ fontSize:'0.85rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', color:'var(--ink-4)', marginBottom:18 }}>Monthly Orders & Revenue (₹K)</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barSize={18}>
                      <XAxis dataKey="name" fontSize={11} tick={{ fill:'var(--ink-4)' }} axisLine={false} tickLine={false} />
                      <YAxis fontSize={11} tick={{ fill:'var(--ink-4)' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius:8, border:'1px solid var(--line)', fontSize:12 }} />
                      <Bar dataKey="orders" name="Orders" fill="#2d4a3e" radius={[4,4,0,0]} />
                      <Bar dataKey="revenue" name="Revenue ₹K" fill="#c0392b" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div style={{ textAlign:'center', padding:40, color:'var(--ink-4)', fontSize:'0.875rem' }}>No order data yet</div>}
              </div>

              <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'var(--r-xl)', padding:22 }}>
                <h3 style={{ fontSize:'0.85rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', color:'var(--ink-4)', marginBottom:18 }}>Products by Category</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={70} labelLine={false}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius:8, border:'1px solid var(--line)', fontSize:12 }} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize:'0.75rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div style={{ textAlign:'center', padding:40, color:'var(--ink-4)', fontSize:'0.875rem' }}>No products yet</div>}
              </div>
            </div>

            {/* Quick nav */}
            <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'var(--r-xl)', padding:'18px 22px' }}>
              <h3 style={{ fontSize:'0.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', color:'var(--ink-4)', marginBottom:12 }}>Quick Access</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:8 }}>
                {[{to:'/admin/sellers',label:'Approve Sellers'},{to:'/admin/users',label:'Manage Users'},{to:'/admin/products',label:'All Products'},{to:'/admin/reviews',label:'Manage Reviews'}].map(l => (
                  <Link key={l.to} to={l.to} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--surface-2)', borderRadius:'var(--r-md)', textDecoration:'none', color:'var(--ink-2)', fontSize:'0.82rem', fontWeight:600 }}>
                    {l.label} <FiArrowRight style={{ color:'var(--ink-5)' }} />
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
