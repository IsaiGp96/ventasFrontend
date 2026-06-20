import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
    fetchPerfil, cambiarPassword,
    fetchUsuarios, crearUsuario, toggleEstatusUsuario,
    fetchPermisos, actualizarPermisos,
} from "../api/usuarios.js";

const ROLES = [
    { value: "ADMIN", label: "Administrador" },
    { value: "EMPLOYEE", label: "Empleado" },
    { value: "SUPERVISOR", label: "Supervisor" },
];

const ROL_BADGE = {
    ADMIN: "bg-purple-50 text-purple-600",
    EMPLOYEE: "bg-blue-50 text-blue-600",
    SUPERVISOR: "bg-amber-50 text-amber-600",
};

const PERMISOS_DISPONIBLES = [
    { key: "dashboard:ver_todo", label: "Dashboard — ver datos de todos" },
    { key: "ventas:ver_todas", label: "Ventas — ver todas las ventas" },
    { key: "ventas:crear", label: "Ventas — registrar nuevas ventas" },
    { key: "compras:ver_todas", label: "Compras — ver todas las órdenes" },
    { key: "compras:crear", label: "Compras — crear órdenes de compra" },
    { key: "gastos:ver_todos", label: "Gastos — ver todos los gastos" },
    { key: "precios:ajustar", label: "Precios — ajustar márgenes y comisiones" },
    { key: "clientes:gestionar", label: "Clientes — gestionar clientes" },
    { key: "inventario:gestionar", label: "Inventario — registrar entradas" },
    { key: "usuarios:gestionar", label: "Usuarios — gestionar usuarios y permisos" },
];

export default function PerfilPanel({ open, onClose }) {
    const { user } = useAuth();
    const esAdmin = user?.rol === "ADMIN" || user?.role === "ADMIN";

    const [tab, setTab] = useState("perfil");

    // ─── Perfil ───────────────────────────────────────────────────────────────
    const [perfil, setPerfil] = useState(null);
    const [pwdForm, setPwdForm] = useState({
        passwordActual: "", passwordNueva: "", confirmar: ""
    });
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState("");
    const [pwdOk, setPwdOk] = useState(false);

    // ─── Usuarios ─────────────────────────────────────────────────────────────
    const [usuarios, setUsuarios] = useState([]);
    const [mostrarNuevo, setMostrarNuevo] = useState(false);
    const [nuevoForm, setNuevoForm] = useState({
        nombre: "", email: "", password: "", rol: "EMPLEADO"
    });
    const [nuevoLoading, setNuevoLoading] = useState(false);
    const [nuevoError, setNuevoError] = useState("");
    const [toggleLoading, setToggleLoading] = useState(null);
    const [usuariosError, setUsuariosError] = useState("");

    const [usuarioPermisos, setUsuarioPermisos] = useState(null);
    const [permisosEdit, setPermisosEdit] = useState(new Set());
    const [permisosLoading, setPermisosLoading] = useState(false);
    const [permisosOk, setPermisosOk] = useState(false);
    useEffect(() => {
        if (!open) return;
        fetchPerfil().then(setPerfil).catch(() => { });
        if (esAdmin) cargarUsuarios();
    }, [open]);

    async function cargarUsuarios() {
        try {
            setUsuarios(await fetchUsuarios());
        } catch (e) {
            setUsuariosError(e.message);
        }
    }

    async function handleCambiarPassword(e) {
        e.preventDefault();
        if (pwdForm.passwordNueva !== pwdForm.confirmar) {
            setPwdError("Las contraseñas no coinciden");
            return;
        }
        setPwdLoading(true);
        setPwdError("");
        setPwdOk(false);
        try {
            await cambiarPassword({
                passwordActual: pwdForm.passwordActual,
                passwordNueva: pwdForm.passwordNueva,
            });
            setPwdOk(true);
            setPwdForm({ passwordActual: "", passwordNueva: "", confirmar: "" });
        } catch (e) {
            setPwdError(e.message);
        } finally {
            setPwdLoading(false);
        }
    }

    async function handleCrearUsuario(e) {
        e.preventDefault();
        setNuevoLoading(true);
        setNuevoError("");
        try {
            await crearUsuario(nuevoForm);
            setNuevoForm({ nombre: "", email: "", password: "", rol: "EMPLEADO" });
            setMostrarNuevo(false);
            cargarUsuarios();
        } catch (e) {
            setNuevoError(e.message);
        } finally {
            setNuevoLoading(false);
        }
    }

    async function handleToggle(id) {
        setToggleLoading(id);
        try {
            const actualizado = await toggleEstatusUsuario(id);
            setUsuarios(prev => prev.map(u =>
                u.id === actualizado.id ? actualizado : u
            ));
        } catch (e) {
            setUsuariosError(e.message);
        } finally {
            setToggleLoading(null);
        }
    }

    async function handleAbrirPermisos(u) {
        if (usuarioPermisos?.id === u.id) {
            setUsuarioPermisos(null);
            return;
        }
        try {
            const perms = await fetchPermisos(u.id);
            setPermisosEdit(new Set(perms));
            setUsuarioPermisos(u);
            setPermisosOk(false);
        } catch (e) {
            setUsuariosError(e.message);
        }
    }

    async function handleGuardarPermisos() {
        if (!usuarioPermisos) return;
        setPermisosLoading(true);
        try {
            await actualizarPermisos(usuarioPermisos.id, permisosEdit);
            setPermisosOk(true);
        } catch (e) {
            setUsuariosError(e.message);
        } finally {
            setPermisosLoading(false);
        }
    }

    const clsInput = "w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg " +
        "focus:outline-none focus:ring-2 focus:ring-neutral-900";

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/30"
                onClick={onClose} />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md z-50
                            bg-white shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4
                                border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-900
                                        flex items-center justify-center text-white
                                        text-sm font-semibold flex-shrink-0">
                            {perfil?.nombre?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-neutral-900">
                                {perfil?.nombre ?? "Cargando..."}
                            </p>
                            <p className="text-xs text-neutral-400">{perfil?.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700
                                   hover:bg-neutral-100 rounded-md transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                {esAdmin && (
                    <div className="flex bg-neutral-100 rounded-lg p-1 gap-1 mx-5 mt-4">
                        {[
                            { key: "perfil", label: "Mi perfil" },
                            { key: "usuarios", label: "Usuarios" },
                        ].map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md
                                            transition-all ${tab === t.key
                                        ? "bg-white text-neutral-900 shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-700"
                                    }`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto">

                    {/* ─── Tab Perfil ─────────────────────────────────────── */}
                    {tab === "perfil" && (
                        <div className="p-5 space-y-6">

                            {/* Info */}
                            <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                                <div>
                                    <p className="text-xs text-neutral-400">Nombre</p>
                                    <p className="text-sm font-medium text-neutral-900">
                                        {perfil?.nombre}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Email</p>
                                    <p className="text-sm text-neutral-700">{perfil?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Rol</p>
                                    <span className={`inline-flex items-center px-2 py-0.5
                                                      rounded-full text-xs font-medium mt-0.5
                                                      ${ROL_BADGE[perfil?.rol] ?? "bg-neutral-100 text-neutral-600"}`}>
                                        {ROLES.find(r => r.value === perfil?.rol)?.label ?? perfil?.rol}
                                    </span>
                                </div>
                            </div>

                            {/* Cambiar contraseña */}
                            <div>
                                <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                                    Cambiar contraseña
                                </h2>
                                <form onSubmit={handleCambiarPassword} className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1.5">
                                            Contraseña actual
                                        </label>
                                        <input type="password"
                                            value={pwdForm.passwordActual}
                                            onChange={e => setPwdForm(f => ({
                                                ...f, passwordActual: e.target.value
                                            }))}
                                            required className={clsInput} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1.5">
                                            Nueva contraseña
                                        </label>
                                        <input type="password"
                                            value={pwdForm.passwordNueva}
                                            onChange={e => setPwdForm(f => ({
                                                ...f, passwordNueva: e.target.value
                                            }))}
                                            required minLength={8}
                                            className={clsInput} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1.5">
                                            Confirmar nueva contraseña
                                        </label>
                                        <input type="password"
                                            value={pwdForm.confirmar}
                                            onChange={e => setPwdForm(f => ({
                                                ...f, confirmar: e.target.value
                                            }))}
                                            required minLength={8}
                                            className={clsInput} />
                                    </div>

                                    {pwdError && (
                                        <p className="text-xs text-red-600">{pwdError}</p>
                                    )}
                                    {pwdOk && (
                                        <p className="text-xs text-green-600">
                                            Contraseña actualizada correctamente
                                        </p>
                                    )}

                                    <button type="submit" disabled={pwdLoading}
                                        className="w-full px-4 py-2.5 bg-neutral-900 text-white
                                                   text-sm font-medium rounded-lg
                                                   hover:bg-neutral-700 disabled:opacity-50
                                                   transition-colors">
                                        {pwdLoading ? "Guardando..." : "Cambiar contraseña"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ─── Tab Usuarios (solo ADMIN) ──────────────────────── */}
                    {tab === "usuarios" && esAdmin && (
                        <div className="p-5 space-y-4">

                            {/* Botón nuevo usuario */}
                            {!mostrarNuevo && (
                                <button onClick={() => setMostrarNuevo(true)}
                                    className="w-full flex items-center justify-center gap-2
                                               px-4 py-2.5 border-2 border-dashed border-neutral-200
                                               text-sm font-medium text-neutral-500 rounded-xl
                                               hover:border-neutral-300 hover:text-neutral-700
                                               transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nuevo usuario
                                </button>
                            )}

                            {/* Formulario nuevo usuario */}
                            {mostrarNuevo && (
                                <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-neutral-900">
                                        Nuevo usuario
                                    </h3>
                                    <form onSubmit={handleCrearUsuario} className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Nombre *
                                            </label>
                                            <input type="text"
                                                value={nuevoForm.nombre}
                                                onChange={e => setNuevoForm(f => ({
                                                    ...f, nombre: e.target.value
                                                }))}
                                                required placeholder="Nombre completo"
                                                className={clsInput} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Email *
                                            </label>
                                            <input type="email"
                                                value={nuevoForm.email}
                                                onChange={e => setNuevoForm(f => ({
                                                    ...f, email: e.target.value
                                                }))}
                                                required placeholder="correo@empresa.com"
                                                className={clsInput} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Contraseña *
                                            </label>
                                            <input type="password"
                                                value={nuevoForm.password}
                                                onChange={e => setNuevoForm(f => ({
                                                    ...f, password: e.target.value
                                                }))}
                                                required minLength={8}
                                                placeholder="Mínimo 8 caracteres"
                                                className={clsInput} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Rol *
                                            </label>
                                            <select value={nuevoForm.rol}
                                                onChange={e => setNuevoForm(f => ({
                                                    ...f, rol: e.target.value
                                                }))}
                                                className={clsInput + " bg-white"}>
                                                {ROLES.map(r => (
                                                    <option key={r.value} value={r.value}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {nuevoError && (
                                            <p className="text-xs text-red-600">{nuevoError}</p>
                                        )}

                                        <div className="flex gap-2 pt-1">
                                            <button type="button"
                                                onClick={() => {
                                                    setMostrarNuevo(false);
                                                    setNuevoError("");
                                                }}
                                                className="flex-1 px-3 py-2 border border-neutral-200
                                                           text-sm font-medium rounded-lg text-neutral-600
                                                           hover:bg-white transition-colors">
                                                Cancelar
                                            </button>
                                            <button type="submit" disabled={nuevoLoading}
                                                className="flex-1 px-3 py-2 bg-neutral-900 text-white
                                                           text-sm font-medium rounded-lg
                                                           hover:bg-neutral-700 disabled:opacity-50
                                                           transition-colors">
                                                {nuevoLoading ? "Creando..." : "Crear usuario"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Lista de usuarios */}
                            {usuariosError && (
                                <p className="text-xs text-red-600">{usuariosError}</p>
                            )}
                            <div className="space-y-2">
                                {usuarios.map(u => (
                                    <div key={u.id} className="rounded-xl border transition-colors
                               bg-white border-neutral-200">
                                        <div className={`flex items-center justify-between p-3 ${!u.activo ? "opacity-50" : ""
                                            }`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center
                                justify-center text-xs font-semibold flex-shrink-0
                                ${u.activo
                                                        ? "bg-neutral-900 text-white"
                                                        : "bg-neutral-200 text-neutral-400"}`}>
                                                    {u.nombre[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 truncate">
                                                        {u.nombre}
                                                    </p>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5
                                      rounded text-xs font-medium mt-0.5
                                      ${ROL_BADGE[u.rol] ?? "bg-neutral-100 text-neutral-500"}`}>
                                                        {ROLES.find(r => r.value === u.rol)?.label ?? u.rol}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 flex-shrink-0">
                                                <button onClick={() => handleAbrirPermisos(u)}
                                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg
                                border transition-colors ${usuarioPermisos?.id === u.id
                                                            ? "bg-neutral-900 text-white border-neutral-900"
                                                            : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                                        }`}>
                                                    Permisos
                                                </button>
                                                <button onClick={() => handleToggle(u.id)}
                                                    disabled={toggleLoading === u.id}
                                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg
                                border transition-colors disabled:opacity-50 ${u.activo
                                                            ? "border-red-200 text-red-600 hover:bg-red-50"
                                                            : "border-green-200 text-green-600 hover:bg-green-50"
                                                        }`}>
                                                    {toggleLoading === u.id ? "..." : u.activo ? "Desactivar" : "Activar"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Panel de permisos expandible */}
                                        {usuarioPermisos?.id === u.id && (
                                            <div className="border-t border-neutral-100 px-3 pb-3 pt-2 space-y-2">
                                                <p className="text-xs font-medium text-neutral-600 mb-2">
                                                    Permisos de acceso
                                                </p>
                                                <div className="grid grid-cols-1 gap-1.5">
                                                    {PERMISOS_DISPONIBLES.map(p => (
                                                        <label key={p.key}
                                                            className="flex items-center gap-2 cursor-pointer group">
                                                            <input type="checkbox"
                                                                checked={permisosEdit.has(p.key)}
                                                                onChange={() => {
                                                                    setPermisosEdit(prev => {
                                                                        const next = new Set(prev);
                                                                        next.has(p.key)
                                                                            ? next.delete(p.key)
                                                                            : next.add(p.key);
                                                                        return next;
                                                                    });
                                                                    setPermisosOk(false);
                                                                }}
                                                                className="w-3.5 h-3.5 rounded border-neutral-300
                                           accent-neutral-900" />
                                                            <span className="text-xs text-neutral-600
                                             group-hover:text-neutral-900 transition-colors">
                                                                {p.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <button onClick={() => setUsuarioPermisos(null)}
                                                        className="px-3 py-1.5 text-xs border border-neutral-200
                                   rounded-lg text-neutral-600 hover:bg-neutral-50
                                   transition-colors">
                                                        Cancelar
                                                    </button>
                                                    <button onClick={handleGuardarPermisos}
                                                        disabled={permisosLoading}
                                                        className="px-3 py-1.5 text-xs bg-neutral-900 text-white
                                   rounded-lg hover:bg-neutral-700 disabled:opacity-50
                                   transition-colors">
                                                        {permisosLoading
                                                            ? "Guardando..."
                                                            : permisosOk
                                                                ? "✓ Guardado"
                                                                : "Guardar permisos"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}