import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiSearch, FiTrash2, FiExternalLink } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAdminProducts, adminDeleteProduct } from '../../services/api';
import toast from 'react-hot-toast';
import '../seller/ProductForm.css';

const CATS = ['All', 'Wood Crafts', 'Pottery', 'Jewellery', 'Decor', 'Textile', 'Other'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  useEffect(() => {
    getAdminProducts()
      .then(({ data }) => { setProducts(data.products); setFiltered(data.products); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = products;
    if (cat !== 'All') r = r.filter(p => p.category === cat);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.seller?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [search, cat, products]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product from the platform?')) return;
    try {
      await adminDeleteProduct(id);
      setProducts(p => p.map(x => x._id === id ? { ...x, isActive: false } : x));
      toast.success('Product removed');
    } catch { toast.error('Failed'); }
  };

  const active   = products.filter(p => p.isActive).length;
  const inactive = products.filter(p => !p.isActive).length;

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-content">
        <h1 className="dashboard-title">Manage Products</h1>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',   value: products.length, bg: 'var(--surface-3)',   color: 'var(--ink-2)' },
            { label: 'Active',  value: active,           bg: 'var(--green-light)', color: 'var(--green)' },
            { label: 'Removed', value: inactive,         bg: '#fde8e8',            color: 'var(--brand)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 18px', borderRadius: 'var(--r-md)', background: s.bg, color: s.color, minWidth: 100 }}>
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
              placeholder="Search by product or seller…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }}
            value={cat} onChange={e => setCat(e.target.value)}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <span className="filter-count">{filtered.length} products</span>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=80&q=80'}
                          alt={p.name}
                          className="tbl-product-img"
                        />
                        <p className="tbl-name" style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </p>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td>
                      <p className="tbl-name">{p.seller?.name || '—'}</p>
                      <p className="tbl-sub">{p.seller?.email}</p>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{p.price?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-red' : p.quantity <= 5 ? 'badge-gold' : 'badge-green'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      ⭐ {p.ratings?.average?.toFixed(1) || '0.0'}
                      <span style={{ color: 'var(--ink-4)', marginLeft: 3 }}>({p.ratings?.count || 0})</span>
                    </td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>
                        {p.isActive ? 'Active' : 'Removed'}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <Link to={`/products/${p._id}`} target="_blank" className="btn btn-outline btn-sm">
                          <FiExternalLink />
                        </Link>
                        {p.isActive && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="es-icon"><FiPackage /></div>
                <h3>No products found</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
