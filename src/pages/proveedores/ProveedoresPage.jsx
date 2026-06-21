import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProveedores, eliminarProveedor } from "../../api/proveedores.js";

export default function ProveedoresPage() {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { cargar(); }, []);

    async function cargar() {
        try {
            setLoading(true);
            setProveedores(await fetchProveedores());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleEliminar(id) {
        try {
            await eliminarProveedor(id);
            setConfirmDelete(null);
            cargar();
        } catch (e) {
            setError(e.message);
            setConfirmDelete(null);
        }
    }

    return (
        <div className="p-6 lg:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Proveedores</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        Gestiona tus proveedores de mercancía
                    </p>
                </div>
                <button
                    onClick={() => navigate("/proveedores/nuevo")}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white
                     text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo proveedor
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                        text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                          rounded-full animate-spin" />
                </div>
            )}

            {/* Tabla */}
            {!loading && (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    {proveedores.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-neutral-500 text-sm">No hay proveedores registrados.</p>
                            <button
                                onClick={() => navigate("/proveedores/nuevo")}
                                className="mt-3 text-sm text-neutral-900 font-medium
                           underline underline-offset-2"
                            >
                                Agregar el primero
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50">
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Nombre</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden sm:table-cell">Teléfono</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden md:table-cell">Correo</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden lg:table-cell">RFC</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {proveedores.map((p) => (
                                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-neutral-900">{p.nombre}</td>
                                        <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">
                                            {p.telefono ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                                            {p.correo ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">
                                            {p.rfc ?? "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button
                                                    onClick={() => navigate(`/proveedores/${p.id}/editar`)}
                                                    className="p-1.5 text-neutral-400 hover:text-neutral-700
                                     hover:bg-neutral-100 rounded-md transition-all"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(p)}
                                                    className="p-1.5 text-neutral-400 hover:text-red-600
                                     hover:bg-red-50 rounded-md transition-all"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal confirmar eliminar */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h3 className="font-semibold text-neutral-900 mb-1">¿Eliminar proveedor?</h3>
                        <p className="text-sm text-neutral-500 mb-5">
                            <span className="font-medium text-neutral-700">{confirmDelete.nombre}</span> será
                            eliminado permanentemente. Solo es posible si no tiene órdenes de compra asociadas.
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
                                onClick={() => handleEliminar(confirmDelete.id)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium
                           rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}