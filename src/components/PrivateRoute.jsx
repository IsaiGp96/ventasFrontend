import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // Mientras verifica la sesión guardada, no redirige aún
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Sin sesión → login
  if (!user) return <Navigate to="/login" replace />;

  // Rol insuficiente → inicio
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}