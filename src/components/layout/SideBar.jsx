import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import CalculadoraPrecio from "../../components/CalculadoraPrecio.jsx";
import PerfilPanel from "../PerfilPanel.jsx";

const navigation = [
    {
        label: "Principal",
        items: [
            { name: "Dashboard", path: "/", icon: IconDashboard, permiso: null },
        ],
    },
    {
        label: "Operaciones",
        items: [
            { name: "Ventas", path: "/ventas", icon: IconVentas, permiso: null },
            { name: "Compras", path: "/compras", icon: IconCompras, permiso: "compras:ver_todas" },
            { name: "Inventario", path: "/inventario", icon: IconInventario, permiso: "inventario:gestionar" },
            { name: "Gastos", path: "/gastos", icon: IconGastos, permiso: null },
        ],
    },
    {
        label: "Catálogos",
        items: [
            { name: "Productos", path: "/productos", icon: IconProductos, permiso: "compras:ver_todas" },
            { name: "Clientes", path: "/clientes", icon: IconClientes, permiso: "clientes:gestionar" },
            { name: "Proveedores", path: "/proveedores", icon: IconProveedores, permiso: "compras:ver_todas" },
            { name: "Precios", path: "/precios", icon: IconPrecios, permiso: "precios:ajustar" },
        ],
    },
];

export default function Sidebar() {
    const navigate = useNavigate();

    const [perfilAbierto, setPerfilAbierto] = useState(false);
    const [collapsed, setCollapsed] = useState(() =>
        localStorage.getItem("sidebar-collapsed") === "true"
    );
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showCalculadora, setShowCalculadora] = useState(false);
    const { user, logout, tienePermiso } = useAuth();
    const esAdmin = user?.role === "ADMIN";

    const navFiltrada = navigation.map(group => ({
        ...group,
        items: group.items.filter(item => tienePermiso(item.permiso))
    })).filter(group => group.items.length > 0);
    
    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", collapsed);
    }, [collapsed]);

    function handleNavClick() { setMobileOpen(false); }
    function handleLogout() { logout(); navigate("/login"); }

    const sidebarContent = (
        <aside className={`flex flex-col h-screen sticky top-0 bg-neutral-900
                           transition-all duration-300 ease-in-out overflow-hidden
                           ${collapsed ? "w-16" : "w-60"}`}>

            {/* Header */}
            <div className={`flex items-center border-b border-neutral-800 h-16 flex-shrink-0
                            ${collapsed ? "justify-center px-0" : "justify-between px-5"}`}>
                {!collapsed && (
                    <div>
                        <h1 className="text-white text-sm font-semibold tracking-widest uppercase">
                            DAW Store
                        </h1>
                        <p className="text-neutral-500 text-xs tracking-wide">Panel de control</p>
                    </div>
                )}
                <button onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:flex items-center justify-center w-7 h-7 rounded-md
                               text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
                    title={collapsed ? "Expandir menú" : "Contraer menú"}>
                    <IconChevron collapsed={collapsed} />
                </button>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5">
                {navFiltrada.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <p className="px-3 mb-1.5 text-xs font-medium text-neutral-500
                                          uppercase tracking-widest">
                                {group.label}
                            </p>
                        )}
                        <ul className="space-y-0.5">
                            {group.items.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        end={item.path === "/"}
                                        onClick={handleNavClick}
                                        title={collapsed ? item.name : undefined}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-lg text-sm transition-all
                                            ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"}
                                            ${isActive
                                                ? "bg-white text-neutral-900 font-medium"
                                                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                            }`
                                        }>
                                        <item.icon />
                                        {!collapsed && <span>{item.name}</span>}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        {collapsed && <div className="my-2 border-t border-neutral-800" />}
                    </div>
                ))}
            </nav>

            {/* Footer — usuario + calculadora + logout */}
            <div className="border-t border-neutral-800 py-3 px-2 flex-shrink-0">
                {collapsed ? (
                    <div className="flex flex-col items-center gap-1">
                        {/* Avatar — abre perfil */}
                        <button onClick={() => setPerfilAbierto(true)}
                            title="Perfil"
                            className="w-7 h-7 rounded-full bg-neutral-700 flex items-center
                                       justify-center hover:bg-neutral-600 transition-all">
                            <span className="text-xs font-medium text-neutral-300">
                                {user?.name?.charAt(0).toUpperCase() ?? "U"}
                            </span>
                        </button>

                        <button onClick={() => setShowCalculadora(true)}
                            title="Calculadora"
                            className="flex items-center justify-center w-7 h-7 rounded-md
                                       text-neutral-500 hover:text-white hover:bg-neutral-800
                                       transition-all">
                            <IconCalculadora />
                        </button>

                        <button onClick={handleLogout} title="Cerrar sesión"
                            className="flex items-center justify-center w-7 h-7 rounded-md
                                       text-neutral-500 hover:text-white hover:bg-neutral-800
                                       transition-all">
                            <IconLogout />
                        </button>
                    </div>
                ) : (
                    <>
                        <button onClick={() => setShowCalculadora(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                       text-neutral-500 hover:text-white hover:bg-neutral-800
                                       transition-all">
                            <IconCalculadora />
                            Calculadora
                        </button>

                        {/* Botón de perfil */}
                        <button onClick={() => setPerfilAbierto(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                       hover:bg-neutral-800 transition-all group">
                            <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center
                                            justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-neutral-300">
                                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm text-white font-medium truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                    {user?.role}
                                </p>
                            </div>
                            <svg className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400
                                            flex-shrink-0 transition-colors"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <button onClick={handleLogout}
                            className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                       text-sm text-neutral-500 hover:text-white hover:bg-neutral-800
                                       transition-all">
                            <IconLogout />
                            Cerrar sesión
                        </button>
                    </>
                )}
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop */}
            <div className={`hidden md:block flex-shrink-0 transition-all duration-300
                            ${collapsed ? "w-16" : "w-60"}`}>
                {sidebarContent}
            </div>

            {/* Móvil — botón hamburguesa */}
            <button onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-30 w-9 h-9 flex items-center
                           justify-center bg-neutral-900 text-white rounded-lg shadow-lg">
                <IconHamburger />
            </button>

            {/* Móvil — overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-20 bg-black/50"
                    onClick={() => setMobileOpen(false)} />
            )}

            {/* Móvil — drawer */}
            <div className={`md:hidden fixed inset-y-0 left-0 z-30 w-60 transform
                             transition-transform duration-300
                             ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {sidebarContent}
            </div>

            {/* Calculadora */}
            {showCalculadora && (
                <CalculadoraPrecio onClose={() => setShowCalculadora(false)} />
            )}

            {/* Panel de perfil — fuera del aside para evitar clipping */}
            <PerfilPanel
                open={perfilAbierto}
                onClose={() => setPerfilAbierto(false)}
            />
        </>
    );
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

function IconChevron({ collapsed }) {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
        </svg>
    );
}
function IconHamburger() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}
function IconDashboard() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}
function IconVentas() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
    );
}
function IconCompras() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        </svg>
    );
}
function IconInventario() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m-3-3h6" />
        </svg>
    );
}
function IconGastos() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}
function IconProductos() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m8 14V11m0 0L4 7m8 4l8-4" />
        </svg>
    );
}
function IconClientes() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
    );
}
function IconProveedores() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h6M9 11h6M9 15h4" />
        </svg>
    );
}
function IconLogout() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );
}
function IconCalculadora() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 56 68"
            stroke="currentColor" strokeWidth={1.75}
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="1" width="54" height="66" rx="5" />
            <rect x="7" y="7" width="42" height="14" rx="2" />
            <rect x="7" y="27" width="10" height="10" rx="2" />
            <rect x="23" y="27" width="10" height="10" rx="2" />
            <rect x="39" y="27" width="10" height="10" rx="2" />
            <rect x="7" y="42" width="10" height="10" rx="2" />
            <rect x="23" y="42" width="10" height="10" rx="2" />
            <rect x="39" y="42" width="10" height="10" rx="2" />
            <rect x="7" y="57" width="10" height="6" rx="2" />
            <rect x="23" y="57" width="10" height="6" rx="2" />
            <rect x="39" y="57" width="10" height="6" rx="2" />
        </svg>
    );
}
function IconPrecios() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 9V4a1 1 0 011-1z" />
        </svg>
    );
}