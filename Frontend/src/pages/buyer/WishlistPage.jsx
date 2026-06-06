import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import Navbar from '../../components/common/Navbar';
import ProductCard from '../../components/common/ProductCard';
import { getWishlist, toggleWishlist } from '../../services/api';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist().then(({ data }) => setProducts(data.wishlist?.products || [])).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist({ productId });
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch {}
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--nav-h)', background: 'var(--surface-2)', minHeight: '100vh' }}>
        <div className="container fade-in" style={{ padding: '28px 20px 60px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>My Wishlist {products.length > 0 && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--ink-4)' }}>({products.length} items)</span>}</h1>
          {loading ? <div className="loading-spinner"><div className="spinner"></div></div>
          : products.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon"><FiHeart /></div>
              <h3>Your wishlist is empty</h3>
              <p>Save items you love to find them easily later</p>
              <Link to="/" className="btn btn-primary">Explore Products</Link>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} onWishlistToggle={handleRemove} inWishlist={true} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
