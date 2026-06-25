import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStoreByOwner } from "../../services/storeService";
import { addProduct } from "../../services/productService";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../../utils/helpers";
import "../../styles/pages.css";
import { AlertTriangle, CheckCircle2, XCircle, Plus, ShoppingBag } from 'lucide-react';

const AddProduct = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    stock: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (!currentUser) return;
    getStoreByOwner(currentUser.uid)
      .then(setStore)
      .catch(console.error)
      .finally(() => setLoadingStore(false));
  }, [currentUser]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store) { setError("Create a store first before adding products."); return; }
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.price || Number(form.price) <= 0) { setError("Enter a valid price."); return; }
    if (!form.stock || Number(form.stock) < 0) { setError("Enter a valid stock quantity."); return; }

    setError("");
    setLoading(true);
    try {
      await addProduct({
        vendorId: currentUser.uid,
        storeId: store.id,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim(),
      });
      setSuccess("Product added successfully!");
      setForm({ name: "", description: "", category: "Electronics", price: "", stock: "", imageUrl: "" });
      setImgPreviewError(false);
      setTimeout(() => { setSuccess(""); navigate("/vendor/products"); }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingStore) return null;

  return (
    <div className="animate-fade">
      <div className="vendor-page-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/vendor/products")}>
          ← Back
        </button>
        <div>
          <div className="vendor-page-title">Add New Product</div>
          <div className="vendor-page-sub">Fill in the product details below.</div>
        </div>
      </div>

      {!store && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <AlertTriangle className="icon-sm" /> You need to create a store before adding products.{" "}
          <button className="btn btn-accent btn-sm" style={{ marginLeft: 8 }} onClick={() => navigate("/profile")}>
            Create Store
          </button>
        </div>
      )}

      {success && <div className="alert alert-success" style={{ marginBottom: 24 }}><CheckCircle2 className="icon-sm" /> {success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}><XCircle className="icon-sm" /> {error}</div>}

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div className="card">
            <h3 style={{ marginBottom: 24 }}>Product Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ap-name">Product Name *</label>
                <input
                  id="ap-name"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Bluetooth Headphones"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ap-desc">Description</label>
                <textarea
                  id="ap-desc"
                  name="description"
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product in detail…"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ap-category">Category *</label>
                <select
                  id="ap-category"
                  name="category"
                  className="form-control"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="ap-price">Price (NGN) *</label>
                  <input
                    id="ap-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ap-stock">Stock Quantity *</label>
                  <input
                    id="ap-stock"
                    name="stock"
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ap-image">Product Image URL</label>
                <input
                  id="ap-image"
                  name="imageUrl"
                  type="url"
                  className="form-control"
                  value={form.imageUrl}
                  onChange={(e) => { handleChange(e); setImgPreviewError(false); }}
                  placeholder="https://example.com/product-image.jpg"
                />
                <span className="text-xs text-muted" style={{ marginTop: 4 }}>
                  Paste a direct image URL from the internet
                </span>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading || !store}
                >
                  {loading ? "Adding Product…" : <><Plus className="icon-sm" /> Add Product</>}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-lg"
                  onClick={() => navigate("/vendor/products")}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Preview */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Preview</h3>
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", marginBottom: 16 }}>
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-surface-3)" }}>
              {form.imageUrl && !imgPreviewError ? (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgPreviewError(true)}
                />
              ) : (
                <span style={{ fontSize: "4rem" }}><ShoppingBag className="icon-sm" /></span>
              )}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: 4 }}>
                {form.category || "Category"}
              </div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, fontSize: "1rem" }}>
                {form.name || "Product Name"}
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-accent)", fontFamily: "var(--font-display)" }}>
                ₦{form.price || "0.00"}
              </div>
              {form.stock && (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 6 }}>
                  Stock: {form.stock} units
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
