import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SearchBar from "./SearchBar";
import { stringToColor, getInitials } from "../utils/helpers";
import "../styles/layout.css";
import { Store, ShoppingCart, User, Package, Rocket, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout, isVendor } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSearch = (val) => {
    setSearch(val);
    if (val.trim()) navigate(`/products?q=${encodeURIComponent(val.trim())}`);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Shops", path: "/shops" },
  ];

  const avatarBg = stringToColor(userProfile?.fullName || currentUser?.email || "");
  const initials = getInitials(userProfile?.fullName || currentUser?.email || "U");

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <Store className="icon-sm" /> Trade<span>Hive</span>
          </Link>

          {/* Desktop search */}
          <div className="navbar-search">
            <SearchBar value={search} onChange={handleSearch} />
          </div>

          {/* Desktop nav links */}
          <div className="navbar-links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}

            {isVendor && (
              <Link to="/vendor/dashboard" className="nav-link vendor-link">
                <Store className="icon-sm" /> Dashboard
              </Link>
            )}

            {/* Cart */}
            {currentUser && (
              <Link to="/cart" className="cart-btn" aria-label={`Cart with ${totalItems} items`}>
                <ShoppingCart className="icon-sm" /> Cart
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
            )}

            {/* Auth */}
            {currentUser ? (
              <div className="user-menu" ref={dropdownRef}>
                <div
                  className="user-avatar"
                  style={{ background: avatarBg }}
                  onClick={() => setDropdownOpen((p) => !p)}
                  role="button"
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
                  {initials}
                </div>

                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{userProfile?.fullName || "User"}</div>
                      <div className="user-dropdown-email">{currentUser.email}</div>
                    </div>

                    <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>
                      <User className="icon-sm" /> My Profile
                    </button>
                    <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/orders"); }}>
                      <Package className="icon-sm" /> My Orders
                    </button>

                    {isVendor ? (
                      <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/vendor/dashboard"); }}>
                        <Store className="icon-sm" /> Vendor Dashboard
                      </button>
                    ) : (
                      <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>
                        <Rocket className="icon-sm" /> Become a Vendor
                      </button>
                    )}

                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item danger" onClick={handleLogout}>
                      <LogOut className="icon-sm" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="icon-sm" />
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-header">
            <span className="navbar-logo"><Store className="icon-sm" /> Trade<span style={{ color: "var(--color-primary)" }}>Hive</span></span>
            <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}><X className="icon-sm" /></button>
          </div>

          {/* Mobile search */}
          <div style={{ marginBottom: 24 }}>
            <SearchBar value={search} onChange={handleSearch} />
          </div>

          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`mobile-nav-link ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}

            {currentUser && (
              <>
                <button className="mobile-nav-link" onClick={() => navigate("/cart")}>
                  <ShoppingCart className="icon-sm" /> Cart {totalItems > 0 && `(${totalItems})`}
                </button>
                <button className="mobile-nav-link" onClick={() => navigate("/orders")}>
                  <Package className="icon-sm" /> My Orders
                </button>
                <button className="mobile-nav-link" onClick={() => navigate("/profile")}>
                  <User className="icon-sm" /> Profile
                </button>
              </>
            )}

            {isVendor && (
              <button className="mobile-nav-link" onClick={() => navigate("/vendor/dashboard")}>
                <Store className="icon-sm" /> Vendor Dashboard
              </button>
            )}

            <div className="user-dropdown-divider" style={{ margin: "12px 0" }} />

            {currentUser ? (
              <button className="mobile-nav-link" onClick={handleLogout} style={{ color: "var(--color-error)" }}>
                <LogOut className="icon-sm" /> Sign Out
              </button>
            ) : (
              <>
                <button className="mobile-nav-link" onClick={() => navigate("/login")}>Sign In</button>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 8 }}
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
