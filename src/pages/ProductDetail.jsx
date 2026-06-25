import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { subscribeToProduct } from "../services/productService";
import { getStore } from "../services/storeService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCurrency, formatDate } from "../utils/helpers";
import "../styles/pages.css";
import { Frown, ShoppingBag, Store, CheckCircle2, AlertTriangle, XCircle, ShoppingCart } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProduct(
      id,
      async (prod) => {
        setProduct(prod);
        if (prod?.storeId) {
          const str = await getStore(prod.storeId);
          setStore(str);
        } else {
          setStore(null);
        }
        setLoading(false);
        setQuantity((q) => Math.max(1, Math.min(q, prod?.stock || 1)));
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [id]);

  const handleAddToCart = () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <LoadingSpinner fullscreen />;

  if (!product) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}><Frown className="icon-sm" /></div>
        <h2>Product not found</h2>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("/products")}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container section animate-fade">
      {/* Breadcrumb */}
      <nav style={{ display: "flex", gap: 8, marginBottom: 32, fontSize: "0.875rem", color: "var(--text-muted)" }}>
        <span style={{ cursor: "pointer", color: "var(--color-primary)" }} onClick={() => navigate("/")}>Home</span>
        <span>/</span>
        <span style={{ cursor: "pointer", color: "var(--color-primary)" }} onClick={() => navigate("/products")}>Products</span>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-detail-layout">
        {/* Image */}
        <div className="product-detail-image">
          {product.imageUrl && !imgError ? (
            <img src={product.imageUrl} alt={product.name} onError={() => setImgError(true)} />
          ) : (
            <span><ShoppingBag className="icon-sm" /></span>
          )}
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{product.category}</span>
            <h1 style={{ marginBottom: 8 }}>{product.name}</h1>
            {store && (
              <span
                style={{ color: "var(--color-primary)", cursor: "pointer", fontSize: "0.9rem" }}
                onClick={() => navigate(`/store/${store.id}`)}
              >
                <Store className="icon-sm" /> {store.storeName}
              </span>
            )}
          </div>

          <div className="product-detail-price">{formatCurrency(product.price)}</div>

          {/* Stock status */}
          <div className="product-detail-stock">
            {product.stock > 5 ? (
              <><span style={{ color: "var(--color-success)" }}><CheckCircle2 className="icon-sm" /></span> <span style={{ color: "var(--color-success)" }}>In Stock</span> ({product.stock} available)</>
            ) : product.stock > 0 ? (
              <><span style={{ color: "var(--color-warning)" }}><AlertTriangle className="icon-sm" /></span> <span style={{ color: "var(--color-warning)" }}>Low Stock</span> (only {product.stock} left)</>
            ) : (
              <><span style={{ color: "var(--color-error)" }}><XCircle className="icon-sm" /></span> <span style={{ color: "var(--color-error)" }}>Out of Stock</span></>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h4 style={{ marginBottom: 8 }}>Description</h4>
              <p style={{ lineHeight: 1.8 }}>{product.description}</p>
            </div>
          )}

          <div className="divider" />

          {/* Quantity + Add to cart */}
          {product.stock > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Quantity</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span style={{ fontWeight: 700, fontSize: "1.1rem", width: 40, textAlign: "center" }}>
                    {quantity}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className={`btn btn-lg ${added ? "btn-outline" : "btn-primary"}`}
                  style={{ flex: 1 }}
                  onClick={handleAddToCart}
                >
                  {added ? <><CheckCircle2 className="icon-sm" /> Added!</> : <><ShoppingCart className="icon-sm" /> Add to Cart</>}
                </button>
                <button
                  className="btn btn-accent btn-lg"
                  style={{ flex: 1 }}
                  onClick={() => { handleAddToCart(); navigate("/cart"); }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Store info card */}
          {store && (
            <div
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <div style={{ fontSize: "2rem" }}><Store className="icon-sm" /></div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{store.storeName}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Visit store →</div>
              </div>
            </div>
          )}

          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Listed: {formatDate(product.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
