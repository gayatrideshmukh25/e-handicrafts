import React, { useEffect, useState } from 'react';
import { FiShoppingBag, FiSearch } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import toast from 'react-hot-toast';
import '../seller/ProductForm.css';

const SB = {
  placed: 'badge-blue', confirmed: 'badge-blue',
  processing: 'badge-gold', shipped: 'badge-gold',
  delivered: 'badge-green', cancelled: 'badge-red',
};
const ALL_STATUSES = ['placed','confirmed','processing','shipped','delivered','cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');

  useEffect(() => {
    getAllOrders()
      .then(({ data }) => { setOrders(data.orders); setFiltered(data.orders); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = orders;
    if (statusF !== 'all') r = r.filter(o => o.orderStatus === statusF);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(o =>
        o._id.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [search, statusF, orders]);

  const handleStatus = async (orderId, status) => {
    try {
      const { data } = await updateOrderStatus(orderId, { status });
      setOrders(o => o.map(x => x._id === orderId ? data.order : x));
      toast.success(`Order marked as ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const revenue = orders.filter(o => o.orderStatus === 'delivered').reduce((s, o) => s + o.grandTotal, 0);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Orders</h1>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',     value: orders.length,                                              bg: 'var(--surface-3)',   color: 'var(--ink-2)' },
            { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length,   bg: 'var(--green-light)', color: 'var(--green)' },
            { label: 'Active',    value: orders.filter(o => !['delivered','cancelled'].includes(o.orderStatus)).length, bg: 'var(--gold-light)', color: '#92620a' },
            { label: 'Cancelled', value: orders.filter(o => o.orderStatus === 'cancelled').length,   bg: '#fde8e8',            color: 'var(--brand)' },
            { label: 'Revenue',   value: `₹${revenue.toLocaleString('en-IN')}`,                     bg: 'var(--brand-light)', color: 'var(--brand)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 18px', borderRadius: 'var(--r-md)', background: s.bg, color: s.color, minWidth: 110 }}>
              <p style={{ fontWeight: 800, fontSize: s.label === 'Revenue' ? '1rem' : '1.3rem', fontFamily: 'var(--font-display)' }}>{s.value}</p>
              <p style={{ fontSize: '0.72rem', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ position: 'absolute', left: 10, color: 'var(--ink-5)', fontSize: '0.9rem' }} />
            <input className="form-control" style={{ paddingLeft: 32, width: 260 }}
              placeholder="Search by order ID or customer…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }}
            value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="all">All Status</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <span className="filter-count">{filtered.length} orders</span>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o._id}>
                    <td>
                      <code style={{ fontSize: '0.75rem', background: 'var(--surface-2)', padding: '3px 7px', borderRadius: 4, letterSpacing: '0.3px' }}>
                        #{o._id.slice(-8).toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <p className="tbl-name">{o.user?.name}</p>
                      <p className="tbl-sub">{o.user?.email}</p>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{o.items?.length}</td>
                    <td style={{ fontWeight: 700 }}>₹{o.grandTotal?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '0.68rem' }}>
                        {o.paymentMethod} · {o.paymentStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td><span className={`badge ${SB[o.orderStatus]}`}>{o.orderStatus}</span></td>
                    <td>
                      {!['delivered','cancelled'].includes(o.orderStatus) ? (
                        <select className="form-control" style={{ padding: '5px 8px', fontSize: '0.78rem', width: 'auto' }}
                          value={o.orderStatus}
                          onChange={e => handleStatus(o._id, e.target.value)}>
                          <option value={o.orderStatus} disabled>Change…</option>
                          {ALL_STATUSES.filter(s => s !== o.orderStatus && s !== 'placed').map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      ) : <span style={{ fontSize: '0.75rem', color: 'var(--ink-5)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="es-icon"><FiShoppingBag /></div>
                <h3>No orders found</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
