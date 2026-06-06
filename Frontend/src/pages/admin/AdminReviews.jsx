import React, { useEffect, useState } from 'react';
import { FiStar, FiTrash2, FiSearch } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminReviews, adminDeleteReview } from '../../services/api';
import toast from 'react-hot-toast';
import '../seller/ProductForm.css';

function Stars({ r }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <FiStar key={s} style={{ width: 12, height: 12, fill: s <= r ? '#f59e0b' : 'transparent', color: s <= r ? '#f59e0b' : '#d1d5db' }} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingF, setRatingF] = useState('all');

  useEffect(() => {
    getAdminReviews()
      .then(({ data }) => { setReviews(data.reviews); setFiltered(data.reviews); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = reviews;
    if (ratingF !== 'all') r = r.filter(x => x.rating === Number(ratingF));
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x =>
        x.user?.name?.toLowerCase().includes(q) ||
        x.product?.name?.toLowerCase().includes(q) ||
        x.comment?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [search, ratingF, reviews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminDeleteReview(id);
      setReviews(r => r.filter(x => x._id !== id));
      toast.success('Review deleted');
    } catch { toast.error('Failed'); }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Reviews</h1>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 18px', borderRadius: 'var(--r-md)', background: 'var(--gold-light)', color: '#92620a', minWidth: 110 }}>
            <p style={{ fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>{reviews.length}</p>
            <p style={{ fontSize: '0.72rem', fontWeight: 600 }}>Total Reviews</p>
          </div>
          <div style={{ padding: '10px 18px', borderRadius: 'var(--r-md)', background: 'var(--green-light)', color: 'var(--green)', minWidth: 110 }}>
            <p style={{ fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>⭐ {avgRating}</p>
            <p style={{ fontSize: '0.72rem', fontWeight: 600 }}>Avg Rating</p>
          </div>
          {[5,4,3,2,1].map(n => (
            <div key={n} style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--surface)', border: '1px solid var(--line)', minWidth: 70, textAlign: 'center' }}>
              <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{reviews.filter(r => r.rating === n).length}</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--ink-4)' }}>{'★'.repeat(n)}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ position: 'absolute', left: 10, color: 'var(--ink-5)', fontSize: '0.9rem' }} />
            <input className="form-control" style={{ paddingLeft: 32, width: 280 }}
              placeholder="Search reviewer, product, comment…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }}
            value={ratingF} onChange={e => setRatingF(e.target.value)}>
            <option value="all">All Ratings</option>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
          </select>
          <span className="filter-count">{filtered.length} reviews</span>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Reviewer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(rv => (
                  <tr key={rv._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="tbl-avatar" style={{ width: 32, height: 32, fontSize: '0.78rem', background: 'var(--brand)', flexShrink: 0 }}>{rv.user?.name?.[0]}</div>
                        <div>
                          <p className="tbl-name">{rv.user?.name}</p>
                          <p className="tbl-sub">{rv.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="tbl-name" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rv.product?.name || '—'}
                      </p>
                    </td>
                    <td><Stars r={rv.rating} /></td>
                    <td>
                      <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rv.comment}
                      </p>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>
                      {new Date(rv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rv._id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="es-icon"><FiStar /></div>
                <h3>No reviews found</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
