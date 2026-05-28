import React, { useEffect, useState } from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import SellerSidebar from '../../components/seller/SellerSidebar';
import { getSellerOrders, updateOrderStatus } from '../../services/api';
import toast from 'react-hot-toast';
import './ProductForm.css';

const SB = { placed:'badge-blue', confirmed:'badge-blue', processing:'badge-gold', shipped:'badge-gold', delivered:'badge-green', cancelled:'badge-red' };

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getSellerOrders().then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false)); }, []);

  const handleStatus = async (orderId, status) => {
    try { const { data } = await updateOrderStatus(orderId, { status }); setOrders(o => o.map(x => x._id === orderId ? data.order : x)); toast.success(`Order marked as ${status}`); }
    catch { toast.error('Failed to update'); }
  };

  return (
    <div className="dashboard-layout">
      <SellerSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Orders</h1>
        {loading ? <div className="loading-spinner"><div className="spinner"></div></div>
        : orders.length === 0 ? <div className="empty-state"><div className="es-icon"><FiShoppingBag /></div><h3>No orders yet</h3><p>Orders for your products will appear here</p></div>
        : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td><code style={{ fontSize: '0.78rem', background: 'var(--surface-2)', padding: '3px 7px', borderRadius: 4 }}>#{o._id.slice(-8).toUpperCase()}</code></td>
                    <td><div><p className="tbl-name">{o.user?.name}</p><p className="tbl-sub">{o.user?.email}</p></div></td>
                    <td style={{ fontSize: '0.85rem' }}>{o.items?.length} item(s)</td>
                    <td style={{ fontWeight: 700 }}>₹{o.grandTotal?.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge ${SB[o.orderStatus]}`}>{o.orderStatus}</span></td>
                    <td>
                      {!['delivered','cancelled'].includes(o.orderStatus) ? (
                        <select className="form-control" style={{ padding: '5px 8px', fontSize: '0.8rem', width: 'auto' }} value={o.orderStatus} onChange={e => handleStatus(o._id, e.target.value)}>
                          <option value={o.orderStatus} disabled>Change…</option>
                          {['confirmed','processing','shipped','delivered'].filter(s => s !== o.orderStatus).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                        </select>
                      ) : <span style={{ fontSize: '0.78rem', color: 'var(--ink-5)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
