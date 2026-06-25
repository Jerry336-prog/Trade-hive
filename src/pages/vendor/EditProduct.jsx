import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProduct, updateProduct } from "../../services/productService";
import { useNavigate, useParams } from "react-router-dom";
import { CATEGORIES } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import "../../styles/pages.css";
import { CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    const fetchProd = async () => {
      try {
        const p = await getProduct(id);
        if (p && p.vendorId === currentUser?.uid) {
          setForm({
            name: p.name,
            description: p.description || "",
            category: p.category || "Electronics",
            price: p.price.toString(),
            stock: p.stock.toString(),
            imageUrl: p.imageUrl || "",
          });
        } else {
          navigate("/vendor/products");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchProd();
  }, [id, currentUser, navigate]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.price || Number(form.price) <= 0) { setError("Enter a valid price."); return; }
    if (!form.stock || Number(form.stock) < 0) { setError("Enter a valid stock quantity."); return; }

    setError("");
    setSaving(true);
    try {
      await updateProduct(id, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim(),
      });
      setSuccess("Product updated successfully!");
      setTimeout(() => { setSuccess(""); navigate("/vendor/products"); }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <div className="animate-fade">
      <div className="vendor-page-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/vendor/products")}>
          ← Back
        </button>
        <div>
          <div className="vendor-page-title">Edit Product</div>
          <div className="vendor-page-sub">Update product details below.</div>
        </div>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: 24 }}><CheckCircle2 className="icon-sm" /> {success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}><XCircle className="icon-sm" /> {error}</div>}

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div className="card">
            <h3 style={{ marginBottom: 24 }}>Product Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ep-name">Product Name *</label>
                <input
                  id="ep-name"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ep-desc">Description</label>
                <textarea
                  id="ep-desc"
                  name="description"
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ep-category">Category *</label>
                <select
                  id="ep-category"
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
                  <label className="form-label" htmlFor="ep-price">Price (NGN) *</label>
                  <input
                    id="ep-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ep-stock">Stock Quantity *</label>
                  <input
                    id="ep-stock"
                    name="stock"
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ep-image">Product Image URL</label>
                <input
                  id="ep-image"
                  name="imageUrl"
                  type="url"
                  className="form-control"
                  value={form.imageUrl}
                  onChange={(e) => { handleChange(e); setImgPreviewError(false); }}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={saving}
                >
                  {saving ? "Updating…" : "Update Product"}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
