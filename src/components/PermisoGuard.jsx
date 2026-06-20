import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function PermisoGuard({ permiso, children }) {
    const { tienePermiso } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const notificado = useRef(false);

    useEffect(() => {
        if (!tienePermiso(permiso) && !notificado.current) {
            notificado.current = true;
            showToast("No tienes permiso para acceder a esta sección", "warning");
            navigate("/", { replace: true });
        }
    }, [permiso, location.pathname]);

    if (!tienePermiso(permiso)) return null;
    return children;
}