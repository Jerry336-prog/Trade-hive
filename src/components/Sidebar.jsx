import { useNavigate, useLocation } from "react-router-dom";
import "../styles/layout.css";
import { BarChart3, Package, Plus, Receipt, RefreshCw, Settings, ShoppingBag, Store, ShoppingCart, User } from 'lucide-react';

const vendorLinks = [
  { label: "Dashboard", path: "/vendor/dashboard", icon: <BarChart3 className="icon-sm" /> },
  { label: "My Products", path: "/vendor/products", icon: <Package className="icon-sm" /> },
  { label: "Restock", path: "/vendor/restock", icon: <RefreshCw className="icon-sm" /> },
  { label: "Add Product", path: "/vendor/products/add", icon: <Plus className="icon-sm" /> },
  { label: "Orders", path: "/vendor/orders", icon: <Receipt className="icon-sm" /> },
  { label: "Settings", path: "/vendor/settings", icon: <Settings className="icon-sm" /> },
];

const customerLinks = [
  { label: "Browse Products", path: "/products", icon: <ShoppingBag className="icon-sm" /> },
  { label: "Browse Stores", path: "/shops", icon: <Store className="icon-sm" /> },
  { label: "My Orders", path: "/orders", icon: <Package className="icon-sm" /> },
  { label: "My Cart", path: "/cart", icon: <ShoppingCart className="icon-sm" /> },
  { label: "Profile", path: "/profile", icon: <User className="icon-sm" /> },
];

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      {/* Vendor Section */}
      <div className="sidebar-section-label">Vendor Tools</div>
      {vendorLinks.map((l) => (
        <button
          key={l.path}
          className={`sidebar-item ${isActive(l.path) ? "active" : ""}`}
          onClick={() => navigate(l.path)}
          aria-current={isActive(l.path) ? "page" : undefined}
        >
          <span className="sidebar-item-icon">{l.icon}</span>
          {l.label}
        </button>
      ))}

      {/* Customer Section */}
      <div className="sidebar-section-label" style={{ marginTop: 12 }}>Marketplace</div>
      {customerLinks.map((l) => (
        <button
          key={l.path}
          className={`sidebar-item ${isActive(l.path) ? "active" : ""}`}
          onClick={() => navigate(l.path)}
          aria-current={isActive(l.path) ? "page" : undefined}
        >
          <span className="sidebar-item-icon">{l.icon}</span>
          {l.label}
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;
