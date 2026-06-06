import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import Navbar from '../../components/common/Navbar';
import { getMyOrders } from '../../services/api';
import './Orders.css';

const STATUS_BADGE = { placed:'badge-blue', confirmed:'badge-blue', processing:'badge-gold', shipped:'badge-gold', delivered:'badge-green', cancelled:'badge-red' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--nav-h)', background: 'var(--surface-2)', minHeight: '100vh' }}>
        <div className="container orders-page fade-in">
          <h1>My Orders</h1>
          {loading ? <div className="loading-spinner"><div className="spinner"></div></div>
          : orders.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon"><FiPackage /></div>
              <h3>No orders yet</h3>
              <p>Your orders will appear here once you make a purchase</p>
              <Link to="/" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <Link to={`/orders/${order._id}`} key={order._id} className="order-card">
                  <div className="order-card-top">
                    <div>
                      <p className="order-id">Order #{order._id.slice(-10).toUpperCase()}</p>
                      <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="order-card-top-right">
                      <span className={`badge ${STATUS_BADGE[order.orderStatus] || 'badge-gray'}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      <FiChevronRight style={{ color: 'var(--ink-5)' }} />
                    </div>
                  </div>
                  <div className="order-preview">
                    {order.items.slice(0, 5).map((item, i) => (
                      <img key={i} src={item.image || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=100&q=80'} alt={item.name} className="order-preview-img" title={item.name} />
                    ))}
                    {order.items.length > 5 && <div style={{ width: 52, height: 52, borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--ink-4)', fontWeight: 700 }}>+{order.items.length - 5}</div>}
                  </div>
                  <div className="order-card-bottom">
                    <span className="order-item-count">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.paymentMethod}</span>
                    <span className="order-total">₹{order.grandTotal?.toLocaleString('en-IN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
