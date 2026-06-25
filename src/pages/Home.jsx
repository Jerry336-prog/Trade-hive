import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../services/productService";
import { getAllStores } from "../services/storeService";
import ProductCard from "../components/ProductCard";
import StoreCard from "../components/StoreCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { CATEGORIES } from "../utils/helpers";
import "../styles/pages.css";
import { Laptop, Shirt, Home as HomeIcon, Trophy, Sparkles, Book, Smile, Car, Pill, ShoppingCart, Package } from 'lucide-react';

const CATEGORY_ICONS = {
  Electronics: <Laptop className="icon-sm" />, Fashion: <Shirt className="icon-sm" />, "Home & Garden": <HomeIcon className="icon-sm" />,
  Sports: <Trophy className="icon-sm" />, Beauty: <Sparkles className="icon-sm" />, Books: <Book className="icon-sm" />, Toys: <Smile className="icon-sm" />,
  Automotive: <Car className="icon-sm" />, Health: <Pill className="icon-sm" />, "Food & Grocery": <ShoppingCart className="icon-sm" />, Other: <Package className="icon-sm" />,
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredStores, setFeaturedStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, stores] = await Promise.all([
          getAllProducts(),
          getAllStores(),
        ]);
        // Simple "featured" selection - take the newest items
        setFeaturedProducts(prods.slice(0, 8));
        setFeaturedStores(stores.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <div className="animate-fade">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-decoration" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag"><Sparkles className="icon-sm" /> The Ultimate Marketplace</div>
            <h1>Discover & Shop from the Best Independent Sellers</h1>
            <p>
              TradeHive connects you with thousands of passionate vendors offering unique, high-quality products. Support independent businesses while getting the best deals.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/products")}>
                Start Shopping
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate("/register")}>
                Become a Seller
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">50k+</div>
                <div className="hero-stat-label">Active Vendors</div>
              </div>
              <div>
                <div className="hero-stat-value">2M+</div>
                <div className="hero-stat-label">Products Listed</div>
              </div>
              <div>
                <div className="hero-stat-value">99%</div>
                <div className="hero-stat-label">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ background: "var(--color-surface-2)" }}>
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
          </div>
          <div className="categories-scroll" style={{ paddingBottom: 16 }}>
            {CATEGORIES.filter((c) => c !== "All").map((cat) => (
              <button
                key={cat}
                className="category-chip"
                style={{ padding: "12px 24px", fontSize: "1rem" }}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section container">
        <div className="section-header">
          <h2>Trending Products</h2>
          <button className="btn btn-ghost" onClick={() => navigate("/products")}>View All →</button>
        </div>
        <div className="grid grid-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Featured Stores */}
      {featuredStores.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <h2>Featured Shops</h2>
            <button className="btn btn-ghost" onClick={() => navigate("/shops")}>Browse Stores →</button>
          </div>
          <div className="grid grid-4">
            {featuredStores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section container" style={{ paddingBottom: "var(--space-16)" }}>
        <div className="cta-banner">
          <h2>Ready to start your own business?</h2>
          <p>Join TradeHive as a vendor today and reach millions of customers worldwide. Setup is fast, easy, and free.</p>
          <div className="cta-banner-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>Create a Vendor Account</button>
            <button className="btn btn-outline btn-lg" style={{ color: "#fff", borderColor: "#fff" }} onClick={() => navigate("/about")}>Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
