import React, { useEffect, useState } from 'react';
import { FiUsers, FiSlash, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminUsers, toggleBlockUser, deleteUser } from '../../services/api';
import toast from 'react-hot-toast';
import '../../components/common/Sidebar.css';
import '../seller/ProductForm.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminUsers()
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id) => {
    try {
      const { data } = await toggleBlockUser(id);
      setUsers(users.map((u) => u._id === id ? data.user : u));
      toast.success(data.message);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch {}
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Users</h1>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <FiUsers /> <span>{users.length} buyers registered</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                          {user.name?.[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge ${user.isBlocked ? 'badge-danger' : 'badge-success'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className={`btn btn-sm ${user.isBlocked ? 'btn-secondary' : 'btn-outline'}`}
                          onClick={() => handleBlock(user._id)}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {user.isBlocked ? <FiCheckCircle /> : <FiSlash />}
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="empty-state" style={{ padding: '40px' }}><p>No buyers found</p></div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
