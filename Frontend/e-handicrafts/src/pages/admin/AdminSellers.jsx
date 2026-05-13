import React, { useEffect, useState } from 'react';
import { FiUserCheck, FiSlash, FiTrash2, FiCheckCircle, FiClock } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminSellers, approveSeller, toggleBlockUser, deleteUser } from '../../services/api';
import toast from 'react-hot-toast';
import '../../components/common/Sidebar.css';
import '../seller/ProductForm.css';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSellers()
      .then(({ data }) => setSellers(data.sellers))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id, approve) => {
    try {
      const { data } = await approveSeller(id, { approve });
      setSellers(sellers.map((s) => s._id === id ? data.seller : s));
      toast.success(data.message);
    } catch {
      toast.error('Action failed');
    }
  };

  const handleBlock = async (id) => {
    try {
      const { data } = await toggleBlockUser(id);
      setSellers(sellers.map((s) => s._id === id ? data.user : s));
      toast.success(data.message);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this seller account?')) return;
    try {
      await deleteUser(id);
      setSellers(sellers.filter((s) => s._id !== id));
      toast.success('Seller deleted');
    } catch {}
  };

  const pending = sellers.filter((s) => !s.isApproved && !s.isBlocked);
  const approved = sellers.filter((s) => s.isApproved);
  const blocked = sellers.filter((s) => s.isBlocked);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Sellers</h1>

        {/* Summary cards */}
        <div className="stats-grid" style={{ marginBottom: '28px' }}>
          {[
            { label: 'Pending Approval', value: pending.length, color: 'accent' },
            { label: 'Approved', value: approved.length, color: 'secondary' },
            { label: 'Blocked', value: blocked.length, color: 'primary' },
            { label: 'Total', value: sellers.length, color: 'info' },
          ].map((c) => (
            <div key={c.label} className="stat-card">
              <div className={`stat-icon ${c.color}`}><FiUserCheck /></div>
              <div className="stat-info">
                <p className="stat-value">{c.value}</p>
                <p className="stat-label">{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Shop</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                          {seller.name?.[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{seller.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{seller.sellerInfo?.shopName || '—'}</p>
                        {seller.sellerInfo?.shopDescription && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {seller.sellerInfo.shopDescription}
                          </p>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{seller.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(seller.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      {seller.isBlocked ? (
                        <span className="badge badge-danger">Blocked</span>
                      ) : seller.isApproved ? (
                        <span className="badge badge-success">Approved</span>
                      ) : (
                        <span className="badge badge-warning"><FiClock style={{ verticalAlign: 'middle' }} /> Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {!seller.isApproved && !seller.isBlocked && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleApprove(seller._id, true)}>
                              <FiCheckCircle /> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleApprove(seller._id, false)}>
                              Reject
                            </button>
                          </>
                        )}
                        {seller.isApproved && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleBlock(seller._id)}>
                            <FiSlash /> {seller.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                        {seller.isBlocked && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleBlock(seller._id)}>
                            <FiCheckCircle /> Unblock
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(seller._id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sellers.length === 0 && (
              <div className="empty-state" style={{ padding: '40px' }}>
                <FiUserCheck size={36} />
                <p>No sellers registered yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSellers;
