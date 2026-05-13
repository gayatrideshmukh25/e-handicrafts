import React, { useEffect, useState } from 'react';
import { FiStar, FiTrash2, FiSearch } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminReviews, adminDeleteReview } from '../../services/api';
import toast from 'react-hot-toast';
import '../../components/common/Sidebar.css';
import '../seller/ProductForm.css';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    getAdminReviews()
      .then(({ data }) => {
        setReviews(data.reviews);
        setFiltered(data.reviews);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = reviews;
    if (ratingFilter !== 'all') result = result.filter((r) => r.rating === Number(ratingFilter));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.user?.name?.toLowerCase().includes(q) ||
               r.product?.name?.toLowerCase().includes(q) ||
               r.comment?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, ratingFilter, reviews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminDeleteReview(id);
      const updated = reviews.filter((r) => r._id !== id);
      setReviews(updated);
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Reviews</h1>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ padding: '12px 20px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', minWidth: '130px' }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#856404' }}>{reviews.length}</p>
            <p style={{ fontSize: '0.78rem', color: '#856404' }}>Total Reviews</p>
          </div>
          <div style={{ padding: '12px 20px', background: 'var(--secondary-light)', borderRadius: 'var(--radius-sm)', minWidth: '130px' }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--secondary)' }}>⭐ {avgRating}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>Platform Avg Rating</p>
          </div>
          {[5, 4, 3, 2, 1].map((r) => (
            <div key={r} style={{ padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontWeight: 700 }}>{reviews.filter((rev) => rev.rating === r).length}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{'⭐'.repeat(r)}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input className="form-control" style={{ paddingLeft: '32px', width: '260px' }}
              placeholder="Search reviews, users, products..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
          </select>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} reviews</span>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((review) => (
                  <tr key={review._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                          {review.user?.name?.[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{review.user?.name}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{review.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '160px' }}>
                      <span style={{ fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.product?.name || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '1px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} style={{
                            width: '13px', height: '13px',
                            fill: s <= review.rating ? 'var(--accent)' : 'transparent',
                            color: s <= review.rating ? 'var(--accent)' : 'var(--border)'
                          }} />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.comment}
                      </p>
                    </td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(review._id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '40px' }}>
                <FiStar size={36} />
                <p>No reviews found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReviews;
