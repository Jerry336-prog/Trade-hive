import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToProductsByVendor, deleteProduct } from "../../services/productService";
import { formatCurrency, formatDate } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";
import { Plus, Package, ShoppingBag, Pencil, Trash2 } from 'lucide-react';

const ManageProducts = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null); // holds product to delete

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

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteProduct(deleteModal.id);
      setProducts((p) => p.filter((item) => item.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete product.");
    }
  };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <div className="animate-fade">
      <div className="vendor-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="vendor-page-title">Manage Products</div>
          <div className="vendor-page-sub">{products.length} listed products</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/vendor/products/add")}>
          <Plus className="icon-sm" /> Add New Product
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="icon-sm" />}
          title="No products listed"
          message="You haven't added any products to your store yet."
          action={<button className="btn btn-primary" onClick={() => navigate("/vendor/products/add")}>Add First Product</button>}
        />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Inventory</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {products.map((product) => (
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
                    Stock: {product.stock} • {" "}
                    Added {formatDate(product.createdAt)}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {Number(product.stock || 0) === 0 ? (
                      <span className="badge badge-error">Out of stock</span>
                    ) : Number(product.stock || 0) <= 5 ? (
                      <span className="badge badge-warning">Low stock</span>
                    ) : null}
                  </div>
                </div>
                <div className="product-row-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Edit"
                    onClick={() => navigate(`/vendor/products/edit/${product.id}`)}
                  >
                    <Pencil className="icon-sm" />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    title="Delete"
                    onClick={() => setDeleteModal(product)}
                  >
                    <Trash2 className="icon-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirm Deletion"
        maxWidth="400px"
      >
        <div style={{ marginBottom: 24, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{deleteModal?.name}</strong>? This action cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageProducts;
