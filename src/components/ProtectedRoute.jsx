import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  // Wait for auth to load before checking
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading...</div>
    </div>;
  }

  // If not logged in, go to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If role not allowed, redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'resident') return <Navigate to="/resident" replace />;
    if (currentUser.role === 'volunteer') return <Navigate to="/volunteer" replace />;
    if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;