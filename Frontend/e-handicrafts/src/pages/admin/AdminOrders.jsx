import React, { useEffect, useState } from 'react';
import { FiShoppingBag, FiSearch } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import toast from 'react-hot-toast';
import '../../components/common/Sidebar.css';
import '../seller/ProductForm.css';

const statusColors = {
  placed: 'badge-info', confirmed: 'badge-primary', processing: 'badge-warning',
  shipped: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-danger',
};

const ALL_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    getAllOrders()
      .then(({ data }) => {
        setOrders(data.orders);
        setFiltered(data.orders);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'all') result = result.filter((o) => o.orderStatus === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) => o._id.toLowerCase().includes(q) || o.user?.name?.toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const { data } = await updateOrderStatus(orderId, { status });
      setOrders(orders.map((o) => o._id === orderId ? data.order : o));
      toast.success(`Order updated to ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  // Summary counts
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.orderStatus === s).length;
    return acc;
  }, {});
  const totalRevenue = orders.filter((o) => o.orderStatus === 'delivered').reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Orders</h1>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            { label: 'Total Orders', value: orders.length, bg: 'var(--secondary-light)', color: 'var(--secondary)' },
            { label: 'Delivered', value: counts.delivered || 0, bg: '#d4edda', color: '#155724' },
            { label: 'Pending/Processing', value: (counts.placed || 0) + (counts.confirmed || 0) + (counts.processing || 0), bg: '#fff3cd', color: '#856404' },
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, bg: 'var(--primary-light)', color: 'var(--primary)' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '12px 20px', borderRadius: 'var(--radius-sm)', background: s.bg, color: s.color, minWidth: '150px' }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{s.value}</p>
              <p style={{ fontSize: '0.78rem', opacity: 0.8 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input className="form-control" style={{ paddingLeft: '32px', width: '240px' }}
              placeholder="Search by order ID or customer..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} orders</span>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
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
                {filtered.map((order) => (
                  <tr key={order._id}>
                    <td><code style={{ fontSize: '0.78rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>#{order._id.slice(-8).toUpperCase()}</code></td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.user?.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</p>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{order.items?.length} item(s)</td>
                    <td style={{ fontWeight: 700 }}>₹{order.grandTotal?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentMethod} · {order.paymentStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      {!['delivered', 'cancelled'].includes(order.orderStatus) ? (
                        <select className="form-control" style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}>
                          <option value={order.orderStatus} disabled>Change</option>
                          {ALL_STATUSES.filter((s) => s !== order.orderStatus && s !== 'placed').map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '40px' }}>
                <FiShoppingBag size={36} />
                <p>No orders found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
