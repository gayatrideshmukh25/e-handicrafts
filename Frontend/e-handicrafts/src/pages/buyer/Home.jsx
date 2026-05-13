import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import ProductCard from "../../components/common/ProductCard";
import {
  getProducts,
  getFeaturedProducts,
  toggleWishlist,
  getWishlist,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";

const CATEGORIES = [
  "All",
  "Wood Crafts",
  "Pottery",
  "Jewellery",
  "Decor",
  "Textile",
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [sort, setSort] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFeatured();
    if (user?.role === "buyer") fetchWishlist();
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, sort, page]);

  const fetchFeatured = async () => {
    try {
      const { data } = await getFeaturedProducts();
      setFeatured(data.products);
    } catch {}
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await getWishlist();
      setWishlistIds(data.wishlist?.products?.map((p) => p._id || p) || []);
    } catch {}
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (activeCategory !== "All") params.category = activeCategory;
      if (sort) params.sort = sort;
      if (search) params.search = search;

      const { data } = await getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleWishlistToggle = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await toggleWishlist({ productId });
      setWishlistIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId],
      );
    } catch {}
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <p className="hero-tag">✦ Authentic Indian Craftsmanship</p>
            <h1 className="hero-title">
              Discover Handmade
              <br />
              <span>Treasures</span>
            </h1>
            <p className="hero-subtitle">
              Unique handicrafts crafted by skilled artisans across India.
              <br />
              Every piece tells a story.
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() =>
                  document
                    .getElementById("products-section")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Shop Now <FiArrowRight />
              </button>
              {!user && (
                <button
                  className="btn btn-outline btn-lg"
                  onClick={() => navigate("/register?role=seller")}
                >
                  Become a Seller
                </button>
              )}
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600"
              alt="Handicrafts"
            />
            <div className="hero-badge">
              <strong>500+</strong>
              <span>Artisans</span>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="container">
            <div className="stats-row">
              <div className="hero-stat">
                <strong>10,000+</strong>
                <span>Products</span>
              </div>
              <div className="hero-stat">
                <strong>500+</strong>
                <span>Artisans</span>
              </div>
              <div className="hero-stat">
                <strong>50,000+</strong>
                <span>Happy Customers</span>
              </div>
              <div className="hero-stat">
                <strong>100%</strong>
                <span>Handmade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Featured Crafts</h2>
              <p>Handpicked by our curators</p>
            </div>
            <div className="products-grid">
              {featured.slice(0, 4).map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onWishlistToggle={
                    user?.role === "buyer" ? handleWishlistToggle : undefined
                  }
                  inWishlist={wishlistIds.includes(p._id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Pills */}
      <section className="categories-section">
        <div className="container">
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat);
                  setPage(1);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="products-section" id="products-section">
        <div className="container">
          <div className="products-header">
            <h2>All Products</h2>
            <div className="products-controls">
              <form onSubmit={handleSearch} className="search-form">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search crafts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Search
                </button>
              </form>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="sort-select form-control"
              >
                <option value="">Sort: Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🎨</div>
              <h3>No products found</h3>
              <p>Try a different search or category</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onWishlistToggle={
                      user?.role === "buyer" ? handleWishlistToggle : undefined
                    }
                    inWishlist={wishlistIds.includes(p._id)}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      className={`page-btn ${page === p ? "active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <h3>✦ E-Handicrafts</h3>
              <p>Connecting artisans with art lovers across India.</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <a href="/">Home</a>
              <a href="/register">Become a Seller</a>
            </div>
            <div>
              <h4>Categories</h4>
              {CATEGORIES.slice(1).map((c) => (
                <a key={c} href={`/?category=${c}`}>
                  {c}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 E-Handicrafts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
