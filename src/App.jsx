import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import PermisoGuard from "./components/PermisoGuard.jsx";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import ProductosPage from "./pages/productos/ProductosPage.jsx";
import ProductoFormPage from "./pages/productos/ProductoFormPage.jsx";
import ProductoDetallePage from "./pages/productos/ProductoDetallePage.jsx";
import PreciosPage from "./pages/productos/PreciosPage.jsx";
import ProveedoresPage from "./pages/proveedores/ProveedoresPage.jsx";
import ProveedorFormPage from "./pages/proveedores/ProveedorFormPage.jsx";
import ComprasPage from "./pages/compras/ComprasPage.jsx";
import NuevaOrdenPage from "./pages/compras/NuevaOrdenPage.jsx";
import OrdenDetallePage from "./pages/compras/OrdenDetallePage.jsx";
import EditarOrdenPage from "./pages/compras/EditarOrdenPage.jsx";
import InventarioPage from "./pages/inventario/InventarioPage.jsx";
import GastosPage from "./pages/gastos/GastosPage.jsx";
import ClientesPage from "./pages/clientes/ClientesPage.jsx";
import ClienteFormPage from "./pages/clientes/ClienteFormPage.jsx";
import VentasPage from "./pages/ventas/VentasPage.jsx";
import NuevaVentaPage from "./pages/ventas/NuevaVentaPage.jsx";
import VentaDetallePage from "./pages/ventas/VentaDetallePage.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

// ─── Página de acceso denegado ────────────────────────────────────────────────
function AccesoDenegado() {
    const location = useLocation();
    const mensaje = location.state?.mensajeAcceso ?? "No tienes permiso para acceder a esta sección";
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
            <p className="text-neutral-500 text-sm">{mensaje}</p>
            <a href="/" className="text-sm font-medium text-neutral-900 underline
                                   underline-offset-2">
                Volver al inicio
            </a>
        </div>
    );
}

// ─── Helper para rutas con permiso ───────────────────────────────────────────
function PR({ permiso, children }) {
    return (
        <PrivateRoute>
            <PermisoGuard permiso={permiso}>
                <MainLayout>
                    {children}
                </MainLayout>
            </PermisoGuard>
        </PrivateRoute>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>

                    <Routes>
                        <Route path="/login" element={<LoginPage />} />

                        {/* Dashboard */}
                        <Route path="/" element={
                            <PrivateRoute><MainLayout><DashboardPage /></MainLayout></PrivateRoute>
                        } />

                        {/* Ventas — todos pueden crear, ver todas requiere permiso */}
                        <Route path="/ventas" element={
                            <PrivateRoute><MainLayout><VentasPage /></MainLayout></PrivateRoute>
                        } />
                        <Route path="/ventas/nueva" element={
                            <PR permiso="ventas:crear"><NuevaVentaPage /></PR>
                        } />
                        <Route path="/ventas/:id" element={
                            <PrivateRoute><MainLayout><VentaDetallePage /></MainLayout></PrivateRoute>
                        } />

                        {/* Compras */}
                        <Route path="/compras" element={
                            <PR permiso="compras:ver_todas"><ComprasPage /></PR>
                        } />
                        <Route path="/compras/nueva" element={
                            <PR permiso="compras:crear"><NuevaOrdenPage /></PR>
                        } />
                        <Route path="/compras/:id" element={
                            <PR permiso="compras:ver_todas"><OrdenDetallePage /></PR>
                        } />
                        <Route path="/compras/:id/editar" element={
                            <PR permiso="compras:crear"><EditarOrdenPage /></PR>
                        } />

                        {/* Inventario */}
                        <Route path="/inventario" element={
                            <PR permiso="inventario:gestionar"><InventarioPage /></PR>
                        } />

                        {/* Productos */}
                        <Route path="/productos" element={
                            <PR permiso="compras:ver_todas"><ProductosPage /></PR>
                        } />
                        <Route path="/productos/nuevo" element={
                            <PR permiso="compras:crear"><ProductoFormPage /></PR>
                        } />
                        <Route path="/productos/:id" element={
                            <PR permiso="compras:ver_todas"><ProductoDetallePage /></PR>
                        } />
                        <Route path="/productos/:id/editar" element={
                            <PR permiso="compras:crear"><ProductoFormPage /></PR>
                        } />

                        {/* Precios */}
                        <Route path="/precios" element={
                            <PR permiso="precios:ajustar"><PreciosPage /></PR>
                        } />

                        {/* Proveedores */}
                        <Route path="/proveedores" element={
                            <PR permiso="compras:ver_todas"><ProveedoresPage /></PR>
                        } />
                        <Route path="/proveedores/nuevo" element={
                            <PR permiso="compras:crear"><ProveedorFormPage /></PR>
                        } />
                        <Route path="/proveedores/:id/editar" element={
                            <PR permiso="compras:crear"><ProveedorFormPage /></PR>
                        } />

                        {/* Clientes */}
                        <Route path="/clientes" element={
                            <PR permiso="clientes:gestionar"><ClientesPage /></PR>
                        } />
                        <Route path="/clientes/nuevo" element={
                            <PR permiso="clientes:gestionar"><ClienteFormPage /></PR>
                        } />
                        <Route path="/clientes/:id/editar" element={
                            <PR permiso="clientes:gestionar"><ClienteFormPage /></PR>
                        } />

                        {/* Gastos */}
                        <Route path="/gastos" element={
                            <PrivateRoute><MainLayout><GastosPage /></MainLayout></PrivateRoute>
                        } />

                        {/* Acceso denegado */}
                        <Route path="/sin-permiso" element={<AccesoDenegado />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}