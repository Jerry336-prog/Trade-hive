import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStore } from "../services/storeService";
import { getProductsByStore } from "../services/productService";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { stringToColor, getInitials, formatDate } from "../utils/helpers";
import { Frown, Package, Calendar } from 'lucide-react';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [str, prods] = await Promise.all([
          getStore(id),
          getProductsByStore(id),
        ]);
        setStore(str);
        setProducts(prods);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner fullscreen />;

  if (!store) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}><Frown className="icon-sm" /></div>
        <h2>Store not found</h2>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("/shops")}>
          Browse Stores
        </button>
      </div>
    );
  }

  const bg = stringToColor(store.storeName);
  const initials = getInitials(store.storeName);

  return (
    <div className="animate-fade">
      {/* Store Banner */}
      <div style={{ background: `linear-gradient(135deg, ${bg}15 0%, rgba(0,0,0,0) 100%)`, borderBottom: "1px solid var(--color-border)", padding: "48px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {store.logoUrl && !logoError ? (
            <img
              src={store.logoUrl}
              alt={store.storeName}
              style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--color-border)" }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, color: "#fff", border: "3px solid var(--color-border)", flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <div>
            <h1 style={{ marginBottom: 6 }}>{store.storeName}</h1>
            {store.description && <p style={{ marginBottom: 8 }}>{store.description}</p>}
            <div style={{ display: "flex", gap: 16, fontSize: "0.8rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
              <span><Package className="icon-sm" /> {products.length} product{products.length !== 1 ? "s" : ""}</span>
              <span><Calendar className="icon-sm" /> Joined {formatDate(store.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container section">
        <h2 style={{ marginBottom: 24 }}>Products from this store</h2>
        {products.length === 0 ? (
          <EmptyState icon={<Package className="icon-sm" />} title="No products yet" message="This store hasn't listed any products." />
        ) : (
          <div className="grid grid-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;
