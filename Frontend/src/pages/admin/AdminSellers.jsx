import React, { useEffect, useState } from 'react';
import { FiUserCheck, FiSearch, FiSlash, FiTrash2, FiCheckCircle, FiClock } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminSellers, approveSeller, toggleBlockUser, deleteUser } from '../../services/api';
import toast from 'react-hot-toast';
import '../seller/ProductForm.css';

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    getAdminSellers()
      .then(({ data }) => { setSellers(data.sellers); setFiltered(data.sellers); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = sellers;
    if (statusFilter === 'pending') result = result.filter(s => !s.isApproved && !s.isBlocked);
    else if (statusFilter === 'approved') result = result.filter(s => s.isApproved && !s.isBlocked);
    else if (statusFilter === 'blocked') result = result.filter(s => s.isBlocked);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.sellerInfo?.shopName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, sellers]);

  const handleApprove = async (id, approve) => {
    try {
      const { data } = await approveSeller(id, { approve });
      setSellers(s => s.map(x => x._id === id ? data.seller : x));
      toast.success(data.message);
    } catch { toast.error('Action failed'); }
  };

  const handleBlock = async (id) => {
    try {
      const { data } = await toggleBlockUser(id);
      setSellers(s => s.map(x => x._id === id ? data.user : x));
      toast.success(data.message);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this seller?')) return;
    try {
      await deleteUser(id);
      setSellers(s => s.filter(x => x._id !== id));
      toast.success('Seller deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const pending  = sellers.filter(s => !s.isApproved && !s.isBlocked).length;
  const approved = sellers.filter(s => s.isApproved && !s.isBlocked).length;
  const blocked  = sellers.filter(s => s.isBlocked).length;

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Sellers</h1>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: sellers.length, bg: 'var(--surface-3)', color: 'var(--ink-2)' },
            { label: 'Pending',  value: pending,  bg: '#fef3eb', color: '#d4600a' },
            { label: 'Approved', value: approved, bg: 'var(--green-light)', color: 'var(--green)' },
            { label: 'Blocked',  value: blocked,  bg: '#fde8e8', color: 'var(--brand)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 18px', borderRadius: 'var(--r-md)', background: s.bg, color: s.color, minWidth: 110 }}>
              <p style={{ fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>{s.value}</p>
              <p style={{ fontSize: '0.72rem', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ position: 'absolute', left: 10, color: 'var(--ink-5)', fontSize: '0.9rem' }} />
            <input className="form-control" style={{ paddingLeft: 32, width: 260 }}
              placeholder="Search sellers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Sellers</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="blocked">Blocked</option>
          </select>
          <span className="filter-count">{filtered.length} sellers</span>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Seller</th><th>Shop</th><th>Email</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="tbl-avatar" style={{ background: s.isBlocked ? '#9ca3af' : 'var(--ink)' }}>{s.name?.[0]}</div>
                        <span className="tbl-name">{s.name}</span>
                      </div>
                    </td>
                    <td>
                      <p className="tbl-name">{s.sellerInfo?.shopName || '—'}</p>
                      {s.sellerInfo?.shopDescription && (
                        <p className="tbl-sub" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.sellerInfo.shopDescription}
                        </p>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>{s.email}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      {s.isBlocked ? (
                        <span className="badge badge-red">Blocked</span>
                      ) : s.isApproved ? (
                        <span className="badge badge-green">Approved</span>
                      ) : (
                        <span className="badge badge-orange"><FiClock size={9} /> Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="tbl-actions">
                        {!s.isApproved && !s.isBlocked && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(s._id, true)}>
                              <FiCheckCircle /> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleApprove(s._id, false)}>
                              Reject
                            </button>
                          </>
                        )}
                        {s.isApproved && !s.isBlocked && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleBlock(s._id)}>
                            <FiSlash /> Block
                          </button>
                        )}
                        {s.isBlocked && (
                          <button className="btn btn-success btn-sm" onClick={() => handleBlock(s._id)}>
                            <FiCheckCircle /> Unblock
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="es-icon"><FiUserCheck /></div>
                <h3>No sellers found</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
