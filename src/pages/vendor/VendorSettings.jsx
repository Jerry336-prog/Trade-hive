import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStoreByOwner, updateStore } from "../../services/storeService";
import LoadingSpinner from "../../components/LoadingSpinner";
import "../../styles/pages.css";

const VendorSettings = () => {
  const { currentUser } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    storeName: "",
    description: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (!currentUser) return;
    getStoreByOwner(currentUser.uid)
      .then((s) => {
        setStore(s);
        if (s) {
          setForm({
            storeName: s.storeName || "",
            description: s.description || "",
            logoUrl: s.logoUrl || "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser]);

  const showMsg = (type, msg) => {
    if (type === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!store) return;
    if (!form.storeName.trim()) { showMsg("error", "Store name is required."); return; }

    setSaving(true);
    try {
      await updateStore(store.id, form);
      showMsg("success", "Settings saved successfully!");
    } catch (err) {
      console.error(err);
      showMsg("error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <div className="animate-fade">
      <div className="vendor-page-header">
        <div className="vendor-page-title">Store Settings</div>
        <div className="vendor-page-sub">Update your store's public profile</div>
      </div>

      {!store ? (
        <div className="alert alert-warning">
          You haven't created a store yet. Please go to your profile to create one.
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 640 }}>
          {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input
                className="form-control"
                value={form.storeName}
                onChange={(e) => setForm((p) => ({ ...p, storeName: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Store Description</label>
              <textarea
                className="form-control"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logo URL</label>
              <input
                className="form-control"
                value={form.logoUrl}
                onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VendorSettings;
