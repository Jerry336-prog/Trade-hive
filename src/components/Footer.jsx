import { useNavigate } from "react-router-dom";
import "../styles/layout.css";
import { Store, Heart } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="navbar-logo" style={{ fontSize: "1.3rem" }}>
              <Store className="icon-sm" /> Trade<span>Hive</span>
            </div>
            <p>
              The premier multi-vendor marketplace connecting passionate
              sellers with millions of buyers worldwide.
            </p>
          </div>

          {/* Shop */}
          <div>
            <div className="footer-col-title">Shop</div>
            <div className="footer-links">
              {[
                { label: "All Products", path: "/products" },
                { label: "Browse Stores", path: "/shops" },
                { label: "Electronics", path: "/products?category=Electronics" },
                { label: "Fashion", path: "/products?category=Fashion" },
              ].map((l) => (
                <span key={l.path} className="footer-link" onClick={() => navigate(l.path)}>
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Sell */}
          <div>
            <div className="footer-col-title">Sell</div>
            <div className="footer-links">
              {[
                { label: "Start Selling", path: "/register" },
                { label: "Vendor Dashboard", path: "/vendor/dashboard" },
                { label: "Manage Products", path: "/vendor/products" },
                { label: "View Orders", path: "/vendor/orders" },
              ].map((l) => (
                <span key={l.path} className="footer-link" onClick={() => navigate(l.path)}>
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="footer-col-title">Account</div>
            <div className="footer-links">
              {[
                { label: "My Profile", path: "/profile" },
                { label: "My Orders", path: "/orders" },
                { label: "Shopping Cart", path: "/cart" },
                { label: "Sign In", path: "/login" },
              ].map((l) => (
                <span key={l.path} className="footer-link" onClick={() => navigate(l.path)}>
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} TradeHive. All rights reserved.</p>
          <p>Built with <Heart className="icon-sm" /> for vendors and buyers everywhere</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
