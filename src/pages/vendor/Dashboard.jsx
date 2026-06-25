import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToProductsByVendor } from "../../services/productService";
import { subscribeToOrdersByVendor } from "../../services/orderService";
import { getStoreByOwner } from "../../services/storeService";
import DashboardCard from "../../components/DashboardCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatCurrency, formatDate, statusColor } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";
import { Package, Receipt, Banknote, Clock, Hand, Plus, Inbox } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [store, setStore] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribeProducts = subscribeToProductsByVendor(
      currentUser.uid,
      (prods) => {
        setProducts(prods);
        setLoadingProducts(false);
      },
      (err) => {
        console.error(err);
        setLoadingProducts(false);
      }
    );

    const unsubscribeOrders = subscribeToOrdersByVendor(
      currentUser.uid,
      (ords) => {
        setOrders(ords);
        setLoadingOrders(false);
      },
      (err) => {
        console.error(err);
        setLoadingOrders(false);
      }
    );

    getStoreByOwner(currentUser.uid)
      .then(setStore)
      .catch(console.error)
      .finally(() => setLoadingStore(false));

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [currentUser]);

  const loading = loadingProducts || loadingOrders || loadingStore;

  if (loading) return <LoadingSpinner text="Loading dashboard…" />;

  const totalRevenue = orders
    .filter((o) => o.orderStatus === "Delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrders = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.orderStatus));

  const recentOrders = orders.slice(0, 6);

  const stats = [
    { icon: <Package className="icon-sm" />, label: "Total Products", value: products.length, color: "var(--color-primary)", sub: "Active listings" },
    { icon: <Receipt className="icon-sm" />, label: "Active Orders", value: activeOrders.length, color: "#8b5cf6", sub: "Pending fulfillment" },
    { icon: <Banknote className="icon-sm" />, label: "Revenue", value: formatCurrency(totalRevenue), color: "var(--color-accent)", sub: "From delivered orders" },
    { icon: <Clock className="icon-sm" />, label: "Pending", value: orders.filter((o) => o.orderStatus === "Pending").length, color: "var(--color-warning)", sub: "Awaiting action" },
  ];

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="vendor-page-header">
        <div className="vendor-page-title">
          Welcome back, {userProfile?.fullName?.split(" ")[0] || "Vendor"} <Hand className="icon-sm" />
        </div>
        <div className="vendor-page-sub">
          {store ? `Managing: ${store.storeName}` : "You haven't created a store yet."}
        </div>
      </div>



      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 40 }}>
        {stats.map((s) => (
          <DashboardCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => navigate("/vendor/products/add")}>
          <Plus className="icon-sm" /> Add Product
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/vendor/products")}>
          <Package className="icon-sm" /> Manage Products
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/vendor/orders")}>
          <Receipt className="icon-sm" /> View Orders
        </button>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3>Recent Orders</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/vendor/orders")}>
            View All →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}><Inbox className="icon-sm" /></div>
            <p>No orders yet. Share your store link to get started!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="recent-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} style={{ cursor: "pointer" }} onClick={() => navigate("/vendor/orders")}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td>{order.customerName || "Customer"}</td>
                    <td style={{ fontWeight: 700, color: "var(--color-accent)" }}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: statusColor(order.orderStatus) + "20",
                          color: statusColor(order.orderStatus),
                        }}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
