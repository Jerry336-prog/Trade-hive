import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";
import VendorLayout from "./layouts/VendorLayout";

// Public Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Shops from "./pages/Shops";
import StoreDetail from "./pages/StoreDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Customer Protected Pages
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

// Vendor Protected Pages
import VendorDashboard from "./pages/vendor/Dashboard";
import ManageProducts from "./pages/vendor/ManageProducts";
import RestockProducts from "./pages/vendor/RestockProducts";
import AddProduct from "./pages/vendor/AddProduct";
import EditProduct from "./pages/vendor/EditProduct";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorSettings from "./pages/vendor/VendorSettings";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public/Customer Routes wrapped in MainLayout */}
            <Route
              element={
                <MainLayout>
                  <Outlet />
                </MainLayout>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/store/:id" element={<StoreDetail />} />

              {/* Protected Customer Routes */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Route>

            {/* Vendor Protected Routes wrapped in VendorLayout */}
            <Route
              path="/vendor"
              element={
                <ProtectedRoute requireVendor>
                  <VendorLayout>
                    <Outlet />
                  </VendorLayout>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="restock" element={<RestockProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="settings" element={<VendorSettings />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
