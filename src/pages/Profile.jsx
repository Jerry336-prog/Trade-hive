import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserDocument, upgradeToVendor } from "../services/userService";
import { getStoreByOwner, createStore, updateStore } from "../services/storeService";
import { getInitials, stringToColor } from "../utils/helpers";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import "../styles/pages.css";

const Profile = () => {
  const { currentUser, userProfile, refreshProfile, isVendor } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [store, setStore] = useState(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });
  const [storeForm, setStoreForm] = useState({
    storeName: "",
    description: "",
    logoUrl: "",
  });

  // Populate forms from profile
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullName: userProfile.fullName || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      });
    }
  }, [userProfile]);

  // Load store if vendor
  useEffect(() => {
    if (isVendor && currentUser) {
      setLoadingStore(true);
      getStoreByOwner(currentUser.uid)
        .then((s) => {
          setStore(s);
          if (s) {
            setStoreForm({
              storeName: s.storeName || "",
              description: s.description || "",
              logoUrl: s.logoUrl || "",
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoadingStore(false));
    }
  }, [isVendor, currentUser]);

  const showMsg = (type, msg) => {
    if (type === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserDocument(currentUser.uid, profileForm);
      await refreshProfile();
      showMsg("success", "Profile updated!");
    } catch (err) {
      showMsg("error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeVendor = async () => {
    setSaving(true);
    try {
      await upgradeToVendor(currentUser.uid);
      await refreshProfile();
      showMsg("success", "You are now a vendor!");
      setTab("store");
    } catch (err) {
      showMsg("error", "Failed to upgrade account.");
    } finally {
      setSaving(false);
    }
  };

  const handleStoreSave = async (e) => {
    e.preventDefault();
    if (!storeForm.storeName.trim()) { showMsg("error", "Store name is required."); return; }
    setSaving(true);
    try {
      if (store) {
        await updateStore(store.id, storeForm);
      } else {
        const id = await createStore({
          ownerId: currentUser.uid,
          ...storeForm,
        });
        setStore({ id, ownerId: currentUser.uid, ...storeForm });
      }
      await refreshProfile();
      showMsg("success", "Store saved!");
    } catch (err) {
      showMsg("error", "Failed to save store.");
    } finally {
      setSaving(false);
    }
  };

  const avatarBg = stringToColor(userProfile?.fullName || "");
  const initials = getInitials(userProfile?.fullName || "U");

  const TABS = [
    { id: "profile", label: <><User className="icon-sm" /> Profile</> },
    { id: "store", label: <><Store className="icon-sm" /> Store</>, requireVendor: false },
  ];

  return (
    <div className="container section animate-fade">
      <h1 style={{ marginBottom: 32 }}>My Account</h1>

      <div className="profile-layout">
        {/* Left card */}
        <div>
          <div className="profile-avatar-section">
            <div className="profile-avatar" style={{ background: avatarBg }}>
              {initials}
            </div>
            <h3 style={{ marginBottom: 4 }}>{userProfile?.fullName || "User"}</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: 12 }}>{currentUser?.email}</p>
            {isVendor && <span className="badge badge-primary">Vendor</span>}
          </div>

          {/* Tab nav */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`sidebar-item ${tab === t.id ? "active" : ""}`}
                style={{ borderRadius: "var(--radius-md)", border: "none" }}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div>
          {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          {tab === "profile" && (
            <div className="card">
              <h3 style={{ marginBottom: 24 }}>Personal Information</h3>
              <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-name">Full Name</label>
                  <input
                    id="prof-name"
                    className="form-control"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={currentUser?.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-phone">Phone Number</label>
                  <input
                    id="prof-phone"
                    className="form-control"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 555 000 0000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-address">Shipping Address</label>
                  <textarea
                    id="prof-address"
                    className="form-control"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Your default address"
                    rows={3}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </form>

              {/* Become vendor CTA */}
              {!isVendor && (
                <div style={{ marginTop: 32, padding: 24, background: "linear-gradient(135deg, rgba(0,212,184,0.06), rgba(255,107,53,0.04))", border: "1px solid rgba(0,212,184,0.2)", borderRadius: "var(--radius-lg)" }}>
                  <h4 style={{ marginBottom: 8 }}><Rocket className="icon-sm" /> Start Selling on TradeHive</h4>
                  <p style={{ marginBottom: 16, fontSize: "0.875rem" }}>
                    Upgrade your account to become a vendor and start listing products.
                  </p>
                  <button className="btn btn-primary" onClick={handleBecomeVendor} disabled={saving}>
                    {saving ? "Upgrading…" : "Become a Vendor"}
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "store" && (
            <div className="card">
              <h3 style={{ marginBottom: 24 }}>
                {isVendor ? (store ? "Edit Your Store" : "Create Your Store") : "Become a Vendor First"}
              </h3>

              {!isVendor ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p style={{ marginBottom: 20 }}>You need to be a vendor to create a store.</p>
                  <button className="btn btn-primary btn-lg" onClick={handleBecomeVendor} disabled={saving}>
                    Become a Vendor
                  </button>
                </div>
              ) : loadingStore ? (
                <LoadingSpinner />
              ) : (
                <form onSubmit={handleStoreSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="store-name">Store Name *</label>
                    <input
                      id="store-name"
                      className="form-control"
                      value={storeForm.storeName}
                      onChange={(e) => setStoreForm((p) => ({ ...p, storeName: e.target.value }))}
                      placeholder="My Awesome Store"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="store-desc">Description</label>
                    <textarea
                      id="store-desc"
                      className="form-control"
                      value={storeForm.description}
                      onChange={(e) => setStoreForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Tell buyers about your store…"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="store-logo">Logo URL</label>
                    <input
                      id="store-logo"
                      className="form-control"
                      value={storeForm.logoUrl}
                      onChange={(e) => setStoreForm((p) => ({ ...p, logoUrl: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving…" : store ? "Update Store" : "Create Store"}
                    </button>
                    {store && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate(`/store/${store.id}`)}
                      >
                        View Store
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar item style reuse
import "../styles/layout.css";
import { User, Store, Rocket } from 'lucide-react';
export default Profile;
