import { createContext, useContext, useState, useEffect } from "react";
import { logoutApi } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [permisos, setPermisos] = useState(new Set());
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token     = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");
    const savedPermisos = localStorage.getItem("permisos");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setPermisos(new Set(savedPermisos ? JSON.parse(savedPermisos) : []));
    }
    setLoading(false);

    function handleSessionExpired() { setUser(null); setPermisos(new Set()); }
    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  function saveSession(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    const userData = {
      email: data.email,
      name:  data.name,
      role:  data.role,
    };
    localStorage.setItem("user", JSON.stringify(userData));

    // Guardar permisos que vienen del login response
    const permisosArray = data.permisos ?? [];
    localStorage.setItem("permisos", JSON.stringify(permisosArray));

    setUser(userData);
    setPermisos(new Set(permisosArray));
  }

  async function logout() {
    await logoutApi();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("permisos");
    setUser(null);
    setPermisos(new Set());
  }

  // Helper — ADMIN siempre tiene acceso, el resto verifica su lista
  function tienePermiso(permiso) {
    if (!permiso) return true;
    if (user?.role === "ADMIN") return true;
    return permisos.has(permiso);
  }

  return (
    <AuthContext.Provider value={{
      user, permisos, loading,
      tienePermiso,
      saveSession, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}