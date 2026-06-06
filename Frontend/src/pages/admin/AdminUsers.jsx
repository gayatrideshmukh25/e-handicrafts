import React, { useEffect, useState } from 'react';
import { FiUsers, FiSearch, FiSlash, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminUsers, toggleBlockUser, deleteUser } from '../../services/api';
import toast from 'react-hot-toast';
import '../seller/ProductForm.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAdminUsers().then(({ data }) => { setUsers(data.users); setFiltered(data.users); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  }, [search, users]);

  const handleBlock = async (id) => {
    try {
      const { data } = await toggleBlockUser(id);
      setUsers(u => u.map(x => x._id === id ? data.user : x));
      toast.success(data.message);
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(u => u.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <div className="page-hdr">
          <h1>Manage Users</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '8px 14px', fontSize: '0.82rem', color: 'var(--ink-4)' }}>
            <FiUsers /> {users.length} buyers
          </div>
        </div>

        <div className="filter-row">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ position: 'absolute', left: 10, color: 'var(--ink-5)', fontSize: '0.9rem' }} />
            <input className="form-control" style={{ paddingLeft: 32, width: 280 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="filter-count">{filtered.length} results</span>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner"></div></div>
        : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="tbl-avatar" style={{ background: u.isBlocked ? '#9ca3af' : 'var(--brand)' }}>{u.name?.[0]}</div>
                        <span className="tbl-name">{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>{u.email}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge ${u.isBlocked ? 'badge-red' : 'badge-green'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button
                          className={`btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => handleBlock(u._id)}
                        >
                          {u.isBlocked ? <><FiCheckCircle /> Unblock</> : <><FiSlash /> Block</>}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>
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
                <div className="es-icon"><FiUsers /></div>
                <h3>No users found</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
