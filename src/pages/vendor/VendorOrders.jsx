import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToOrdersByVendor, updateOrderStatus } from "../../services/orderService";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { formatCurrency, formatDate, statusColor } from "../../utils/helpers";
import "../../styles/pages.css";
import { Inbox, Mail, Phone, MapPin } from 'lucide-react';

const VendorOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeToOrdersByVendor(
      currentUser.uid,
      (ords) => {
        setOrders(ords);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
  }, [currentUser]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <div className="animate-fade">
      <div className="vendor-page-header">
        <div className="vendor-page-title">Orders Received</div>
        <div className="vendor-page-sub">Manage and fulfill your customer orders</div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Inbox className="icon-sm" />}
          title="No orders yet"
          message="When customers buy your products, the orders will appear here."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: 2 }}>
                    Order #{order.id.slice(-8).toUpperCase()}
                  </div>
                  <div className="order-id">Placed: {formatDate(order.createdAt)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <select
                    className="status-select"
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{
                      background: statusColor(order.orderStatus) + "20",
                      color: statusColor(order.orderStatus),
                      borderColor: statusColor(order.orderStatus) + "50",
                      fontWeight: 700,
                    }}
                  >
                    <option value="Pending" style={{ color: "#fff", background: "#333" }}>Pending</option>
                    <option value="Processing" style={{ color: "#fff", background: "#333" }}>Processing</option>
                    <option value="Shipped" style={{ color: "#fff", background: "#333" }}>Shipped</option>
                    <option value="Delivered" style={{ color: "#fff", background: "#333" }}>Delivered</option>
                    <option value="Cancelled" style={{ color: "#fff", background: "#333" }}>Cancelled</option>
                  </select>
                  <span style={{ fontWeight: 800, color: "var(--color-accent)", fontSize: "1.1rem" }}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="order-card-body">
                <div className="grid grid-2" style={{ gap: 24, alignItems: "start" }}>
                  <div>
                    <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Items</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {order.products?.map((p, i) => (
                        <div key={i} className="order-product-row">
                          <span style={{ flex: 1, fontWeight: 500 }}>{p.name}</span>
                          <span style={{ color: "var(--text-muted)" }}>Qty: {p.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div>
                      <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Customer Details</h4>
                      <div style={{ background: "var(--color-surface-2)", padding: 12, borderRadius: "var(--radius-md)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{order.shippingAddress.fullName}</div>
                        <div><Mail className="icon-sm" /> {order.shippingAddress.email}</div>
                        {order.shippingAddress.phone && <div><Phone className="icon-sm" /> {order.shippingAddress.phone}</div>}
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
                          <MapPin className="icon-sm" /> {order.shippingAddress.address}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.zip}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
