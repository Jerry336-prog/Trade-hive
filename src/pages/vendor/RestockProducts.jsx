import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToProductsByVendor, updateProduct } from "../../services/productService";
import { formatCurrency } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import "../../styles/pages.css";
import { Package, Plus, RefreshCw, ShoppingBag } from "lucide-react";

const RestockProducts = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amounts, setAmounts] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeToProductsByVendor(
      currentUser.uid,
      (prods) => {
        setProducts(prods);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
  }, [currentUser]);

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        const aStock = Number(a.stock || 0);
        const bStock = Number(b.stock || 0);
        if (aStock === bStock) return a.name.localeCompare(b.name);
        return aStock - bStock;
      }),
    [products]
  );

  const handleRestock = async (product) => {
    const amount = Number(amounts[product.id] || 0);
    if (!Number.isFinite(amount) || amount <= 0) return;

    setSavingId(product.id);
    try {
      await updateProduct(product.id, {
        stock: Number(product.stock || 0) + amount,
      });
      setAmounts((prev) => ({ ...prev, [product.id]: "" }));
    } catch (err) {
      console.error(err);
      alert("Failed to restock product.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <div className="animate-fade">
      <div className="vendor-page-header">
        <div className="vendor-page-title">Restock Products</div>
        <div className="vendor-page-sub">Update inventory for low and out-of-stock products</div>
      </div>

      {sortedProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="icon-sm" />}
          title="No products listed"
          message="Add products before restocking inventory."
        />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Inventory Restock</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {sortedProducts.map((product) => {
              const stock = Number(product.stock || 0);
              const isSaving = savingId === product.id;

              return (
                <div key={product.id} className="product-row">
                  <div className="product-row-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <span><ShoppingBag className="icon-sm" /></span>
                    )}
                  </div>
                  <div className="product-row-info">
                    <div className="product-row-name">{product.name}</div>
                    <div className="product-row-meta">
                      <span style={{ color: "var(--color-primary)" }}>{product.category}</span> • {" "}
                      {formatCurrency(product.price)} • {" "}
                      Current stock: {stock}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      {stock === 0 ? (
                        <span className="badge badge-error">Out of stock</span>
                      ) : stock <= 5 ? (
                        <span className="badge badge-warning">Low stock</span>
                      ) : (
                        <span className="badge badge-success">In stock</span>
                      )}
                    </div>
                  </div>

                  <div className="product-row-actions restock-actions">
                    <input
                      className="form-control restock-input"
                      type="number"
                      min="1"
                      value={amounts[product.id] || ""}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [product.id]: e.target.value }))}
                      placeholder="Qty"
                      aria-label={`Restock quantity for ${product.name}`}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRestock(product)}
                      disabled={isSaving}
                    >
                      {isSaving ? <RefreshCw className="icon-sm" /> : <Plus className="icon-sm" />}
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestockProducts;
