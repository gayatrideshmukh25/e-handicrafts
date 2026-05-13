import React, { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import ProductCard from "../../components/common/ProductCard";
import { getWishlist, toggleWishlist } from "../../services/api";
import toast from "react-hot-toast";

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist()
      .then(({ data }) => setProducts(data.wishlist?.products || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist({ productId });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Removed from wishlist");
    } catch {}
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="container fade-in" style={{ padding: "32px 24px 60px" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "28px" }}>
          My Wishlist
        </h1>
        {products.length === 0 ? (
          <div className="empty-state">
            <FiHeart size={48} />
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to your wishlist</p>
            <Link
              to="/"
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onWishlistToggle={handleRemove}
                inWishlist={true}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
