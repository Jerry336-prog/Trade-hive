import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToOrdersByCustomer } from "../services/orderService";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { formatCurrency, formatDate, statusColor } from "../utils/helpers";
import { useNavigate } from "react-router-dom";
import "../styles/pages.css";
import { Package, MapPin } from 'lucide-react';

const Orders = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeToOrdersByCustomer(
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

  if (loading) return <LoadingSpinner fullscreen text="Loading orders…" />;

  return (
    <div className="container section animate-fade">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 4 }}>My Orders</h1>
        <p>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="icon-sm" />}
          title="No orders yet"
          message="When you place orders, they'll appear here."
          action={
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/products")}>
              Start Shopping
            </button>
          }
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
                  <span
                    className="badge"
                    style={{
                      background: statusColor(order.orderStatus) + "20",
                      color: statusColor(order.orderStatus),
                    }}
                  >
                    {order.orderStatus}
                  </span>
                  <span style={{ fontWeight: 800, color: "var(--color-accent)", fontSize: "1rem" }}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="order-card-body">
                {order.products?.map((p, i) => (
                  <div key={i} className="order-product-row">
                    <span><Package className="icon-sm" /></span>
                    <span style={{ flex: 1 }}>{p.name}</span>
                    <span>× {p.quantity}</span>
                    <span>{formatCurrency(p.price * p.quantity)}</span>
                  </div>
                ))}

                {order.shippingAddress && (
                  <div style={{ marginTop: 8, padding: 12, background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <MapPin className="icon-sm" /> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
