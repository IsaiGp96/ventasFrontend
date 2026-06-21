import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProductos, desactivarProducto } from "../../api/productos.js";
import { useAuth } from "../../context/AuthContext.jsx";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function ProductosPage() {
    const { tienePermiso } = useAuth();
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        cargarProductos();
    }, []);

    async function cargarProductos() {
        try {
            setLoading(true);
            const data = await fetchProductos();
            setProductos(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDesactivar(id) {
        try {
            await desactivarProducto(id);
            setConfirmDelete(null);
            cargarProductos();
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <div className="p-6 lg:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Productos</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        Gestiona el catálogo de productos
                    </p>
                </div>
                {tienePermiso("compras:crear") && (
                    <button
                        onClick={() => navigate("/productos/nuevo")}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white
                    text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo producto
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Tabla */}
            {!loading && (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    {productos.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-neutral-500 text-sm">No hay productos registrados.</p>
                            {tienePermiso("compras:crear") && (

                                <button
                                    onClick={() => navigate("/productos/nuevo")}
                                    className="mt-3 text-sm text-neutral-900 font-medium underline underline-offset-2"
                                >
                                    Crear el primero
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50">
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Producto</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 hidden sm:table-cell">Tipo</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 hidden md:table-cell">Precio venta</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 hidden lg:table-cell">Variantes</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600 hidden lg:table-cell">Proveedor</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {productos.map((p) => (
                                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">

                                        {/* Imagen + nombre */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                                                    {p.imagenUrl ? (
                                                        <img
                                                            src={`${API_URL}${p.imagenUrl}`}
                                                            alt={p.nombre}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                                    d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m8 14V11" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-neutral-900 truncate">{p.nombre}</p>
                                                    {p.descripcion && (
                                                        <p className="text-xs text-neutral-400 truncate max-w-[180px]">
                                                            {p.descripcion}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Tipo */}
                                        <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">
                                            {p.tipoProducto}
                                        </td>

                                        {/* Precio venta */}
                                        <td className="px-4 py-3 text-neutral-900 font-medium hidden md:table-cell">
                                            ${Number(p.precioVenta).toFixed(2)}
                                        </td>

                                        {/* Variantes */}
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                                       bg-neutral-100 text-neutral-600 font-medium">
                                                {p.variantes?.length ?? 0} variante{p.variantes?.length !== 1 ? "s" : ""}
                                            </span>
                                        </td>

                                        {/* Proveedor */}
                                        <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">
                                            {p.proveedor ?? "—"}
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button
                                                    onClick={() => navigate(`/productos/${p.id}`)}
                                                    className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100
                                     rounded-md transition-all"
                                                    title="Ver detalle"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/productos/${p.id}/editar`)}
                                                    className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100
                                     rounded-md transition-all"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {tienePermiso("compras:crear") && (
                                                    <button
                                                        onClick={() => setConfirmDelete(p)}
                                                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50
                                                    rounded-md transition-all"
                                                        title="Desactivar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal confirmar desactivar */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h3 className="font-semibold text-neutral-900 mb-1">¿Desactivar producto?</h3>
                        <p className="text-sm text-neutral-500 mb-5">
                            <span className="font-medium text-neutral-700">{confirmDelete.nombre}</span> dejará
                            de aparecer en el catálogo. Puedes reactivarlo más adelante.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-4 py-2 border border-neutral-200 text-sm font-medium
                           rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDesactivar(confirmDelete.id)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium
                           rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}