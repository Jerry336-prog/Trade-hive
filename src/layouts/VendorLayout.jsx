import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Menu } from 'lucide-react';

/**
 * VendorLayout – wraps vendor dashboard pages with sidebar.
 */
const VendorLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar />
      <div className="vendor-layout">
        <Sidebar open={sidebarOpen} />
        <main className="vendor-main">
          {/* Mobile sidebar toggle */}
          <button
            className="btn btn-ghost btn-sm hide-desktop"
            style={{ marginBottom: 16 }}
            onClick={() => setSidebarOpen((p) => !p)}
          >
            <Menu className="icon-sm" /> Menu
          </button>
          {children}
        </main>
      </div>
    </>
  );
};

export default VendorLayout;
