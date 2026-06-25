import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrdersAndUpdateStock } from "../services/orderService";
import { formatCurrency } from "../utils/helpers";
import EmptyState from "../components/EmptyState";
import "../styles/pages.css";
import { PartyPopper, ShoppingCart, Package, CreditCard, Landmark, Receipt } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalAmount, emptyCart } = useCart();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: userProfile?.fullName || "",
    email: currentUser?.email || "",
    phone: userProfile?.phone || "",
    address: userProfile?.address || "",
    city: "",
    country: "",
    zip: "",
    paymentMethod: "card",
  });

  const shipping = totalAmount > 100 ? 0 : 9.99;
  const tax = totalAmount * 0.08;
  const grandTotal = totalAmount + shipping + tax;

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setError("");
    setLoading(true);

    try {
      // Group by vendorId and create one order per vendor
      const vendorMap = {};
      items.forEach((item) => {
        if (!vendorMap[item.vendorId]) vendorMap[item.vendorId] = [];
        vendorMap[item.vendorId].push(item);
      });

      const orders = Object.entries(vendorMap).map(([vendorId, vendorItems]) => ({
          customerId: currentUser.uid,
          customerName: form.fullName,
          vendorId,
          products: vendorItems,
          totalAmount: vendorItems.reduce((s, i) => s + i.price * i.quantity, 0),
          shippingAddress: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            country: form.country,
            zip: form.zip,
          },
          paymentMethod: form.paymentMethod,
        }));

      await placeOrdersAndUpdateStock(orders);
      await emptyCart();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container section" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "5rem", marginBottom: 24 }}><PartyPopper className="icon-sm" /></div>
        <h2 style={{ marginBottom: 12, color: "var(--color-success)" }}>Order Placed!</h2>
        <p style={{ marginBottom: 32 }}>
          Thank you for your purchase! You'll receive a confirmation shortly.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/orders")}>
            View My Orders
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <EmptyState
          icon={<ShoppingCart className="icon-sm" />}
          title="Your cart is empty"
          message="Add products to your cart before checking out."
          action={<button className="btn btn-primary" onClick={() => navigate("/products")}>Shop Now</button>}
        />
      </div>
    );
  }

  return (
    <div className="container section animate-fade">
      <h1 style={{ marginBottom: 32 }}>Checkout</h1>

      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      <form onSubmit={handlePlaceOrder}>
        <div className="checkout-layout">
          {/* Shipping Form */}
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 24 }}><Package className="icon-sm" /> Shipping Information</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="co-name">Full Name</label>
                    <input id="co-name" name="fullName" className="form-control" value={form.fullName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="co-email">Email</label>
                    <input id="co-email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-phone">Phone</label>
                  <input id="co-phone" name="phone" className="form-control" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-address">Street Address</label>
                  <input id="co-address" name="address" className="form-control" value={form.address} onChange={handleChange} required placeholder="123 Main St" />
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="co-city">City</label>
                    <input id="co-city" name="city" className="form-control" value={form.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="co-country">Country</label>
                    <input id="co-country" name="country" className="form-control" value={form.country} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="co-zip">ZIP Code</label>
                    <input id="co-zip" name="zip" className="form-control" value={form.zip} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 20 }}><CreditCard className="icon-sm" /> Payment Method</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { value: "card", label: <><CreditCard className="icon-sm" /> Credit / Debit Card</> },
                  { value: "paypal", label: <><CreditCard className="icon-sm" /> PayPal</> },
                  { value: "bank", label: <><Landmark className="icon-sm" /> Bank Transfer</> },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      background: form.paymentMethod === opt.value ? "var(--color-primary-glow)" : "var(--color-surface-2)",
                      border: `1px solid ${form.paymentMethod === opt.value ? "rgba(0,212,184,0.4)" : "var(--color-border)"}`,
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={handleChange}
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <p style={{ fontSize: "0.78rem", marginTop: 12, color: "var(--text-muted)" }}>
                * This is a demo. No actual payment will be charged.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="cart-summary">
              <h3 style={{ marginBottom: 20 }}><Receipt className="icon-sm" /> Order Summary</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {items.map((item) => (
                  <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: "var(--color-success)" }}>Free</span> : formatCurrency(shipping)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: 24 }}
                disabled={loading}
              >
                {loading ? "Placing Order…" : `Place Order – ${formatCurrency(grandTotal)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
