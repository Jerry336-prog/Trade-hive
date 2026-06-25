// ============================================================
// ProtectedRoute – Role-based route guard
// ============================================================

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

/**
 * ProtectedRoute wraps a route and enforces auth + optional vendor check.
 *
 * Props:
 *   children     – the component to render
 *   requireVendor – if true, also checks isVendor flag
 */
const ProtectedRoute = ({ children, requireVendor = false }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullscreen />;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVendor && !userProfile?.isVendor) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
