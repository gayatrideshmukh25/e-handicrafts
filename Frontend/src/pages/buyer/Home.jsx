import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  FiArrowRight,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiAward,
} from "react-icons/fi";
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

const CATS = [
  { label: "All", icon: "🏪" },
  { label: "Wood Crafts", icon: "🪵" },
  { label: "Pottery", icon: "🏺" },
  { label: "Jewellery", icon: "💎" },
  { label: "Decor", icon: "🪔" },
  { label: "Textile", icon: "🧵" },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFeatured();
    if (user?.role === "buyer") fetchWishlist();
  }, [user]);
  useEffect(() => {
    fetchProducts();
  }, [activeCategory, sort, page, search]);

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
      const params = { page, limit: 16 };
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
    <div>
      <Navbar
        onSearch={(q) => {
          setSearch(q);
          setPage(1);
        }}
      />
      <div style={{ paddingTop: "var(--nav-h)" }}>
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <div className="hero-inner">
              <div className="hero-text">
                <div className="hero-tag">✦ Authentic Indian Craftsmanship</div>
                <h1 className="hero-title">
                  Discover Handmade
                  <br />
                  <em>Treasures</em>
                </h1>
                <p className="hero-sub">
                  Unique handicrafts crafted by skilled artisans across India.
                  Each piece carries a story, a tradition, and a soul.
                </p>
                <div className="hero-btns">
                  <button
                    className="hero-btn-primary"
                    onClick={() =>
                      document
                        .getElementById("products")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Shop Now <FiArrowRight />
                  </button>
                  {!user && (
                    <Link
                      to="/register?role=seller"
                      className="hero-btn-outline"
                    >
                      Sell Your Crafts
                    </Link>
                  )}
                </div>
                <div className="hero-stats">
                  <div className="hero-stat">
                    <strong>10K+</strong>
                    <span>Products</span>
                  </div>
                  <div className="hero-stat">
                    <strong>500+</strong>
                    <span>Artisans</span>
                  </div>
                  <div className="hero-stat">
                    <strong>50K+</strong>
                    <span>Customers</span>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-img-wrap">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxA3PgwLHE8WqSaG7OYDZkpKljPhV0sXzNqg&s"
                    alt="Handicrafts"
                  />
                </div>
                <div className="hero-badge">
                  <div className="hero-badge-icon">🏆</div>
                  <div>
                    <strong>100% Genuine</strong>
                    <span>Verified Artisans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <div className="trust-bar">
          <div className="container">
            <div className="trust-items">
              <div className="trust-item">
                <FiTruck />
                <span>Free delivery above ₹500</span>
              </div>
              <div className="trust-item">
                <FiShield />
                <span>Secure payments</span>
              </div>
              <div className="trust-item">
                <FiRefreshCw />
                <span>Easy returns</span>
              </div>
              <div className="trust-item">
                <FiAward />
                <span>Verified artisans</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Strip */}
        <div className="cat-strip">
          <div className="cat-strip-inner">
            {CATS.map((c) => (
              <button
                key={c.label}
                className={`cat-btn ${activeCategory === c.label ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(c.label);
                  setPage(1);
                }}
              >
                <span className="cat-icon">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && !search && (
          <section className="home-section home-section-alt">
            <div className="container">
              <div className="section-head">
                <h2>Featured Picks</h2>
                <button
                  onClick={() =>
                    document
                      .getElementById("products")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  View all →
                </button>
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

        {/* All Products */}
        <section className="home-section" id="products">
          <div className="container">
            <div className="filter-bar">
              <h2>
                {activeCategory === "All" ? "All Products" : activeCategory}
                {search && (
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "0.9rem",
                      color: "var(--ink-4)",
                      marginLeft: 8,
                    }}
                  >
                    for "{search}"
                  </span>
                )}
              </h2>
              <select
                className="filter-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="">Sort: Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">🎨</div>
                <h3>No products found</h3>
                <p>Try a different category or search term</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onWishlistToggle={
                        user?.role === "buyer"
                          ? handleWishlistToggle
                          : undefined
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
            <div className="footer-grid">
              <div className="footer-brand">
                <h3>✦ E-Handicrafts</h3>
                <p>
                  Connecting India's finest artisans with craft lovers
                  worldwide. Every purchase supports a family.
                </p>
              </div>
              <div className="footer-col">
                <h4>Shop</h4>
                {[
                  "Wood Crafts",
                  "Pottery",
                  "Jewellery",
                  "Decor",
                  "Textile",
                ].map((c) => (
                  <a
                    key={c}
                    href="#products"
                    onClick={() => setActiveCategory(c)}
                  >
                    {c}
                  </a>
                ))}
              </div>
              <div className="footer-col">
                <h4>Account</h4>
                <Link to="/login">Sign In</Link>
                <Link to="/register">Register</Link>
                <Link to="/orders">My Orders</Link>
                <Link to="/wishlist">Wishlist</Link>
              </div>
              <div className="footer-col">
                <h4>Sell</h4>
                <Link to="/register?role=seller">Become a Seller</Link>
                <Link to="/seller">Seller Dashboard</Link>
              </div>
            </div>
            <div className="footer-bottom">
              © 2024 E-Handicrafts. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
