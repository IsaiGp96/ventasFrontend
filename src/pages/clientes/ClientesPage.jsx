import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchClientes, desactivarCliente } from "../../api/clientes.js";
import { formatearMoneda } from "../../utils/formato.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientesPage() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState("todos");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const { tienePermiso } = useAuth();

    useEffect(() => { cargar(); }, []);

    async function cargar() {
        try {
            setLoading(true);
            setClientes(await fetchClientes());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDesactivar(id) {
        try {
            await desactivarCliente(id);
            setConfirmDelete(null);
            cargar();
        } catch (e) {
            setError(e.message);
        }
    }

    const clientesFiltrados = filtroTipo === "todos"
        ? clientes
        : clientes.filter(c => c.tipo === filtroTipo);

    return (
        <div className="p-6 lg:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Clientes</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        Gestión de clientes generales y de mayoreo
                    </p>
                </div>

                {tienePermiso("clientes:gestionar") && (
                    <button onClick={() => navigate("/clientes/nuevo")}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white
                    text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo cliente
                    </button>
                )}
            </div>

            {/* Filtro tipo */}
            <div className="flex bg-neutral-100 rounded-lg p-1 gap-1 w-fit mb-5">
                {[
                    { key: "todos", label: "Todos" },
                    { key: "general", label: "General" },
                    { key: "mayoreo", label: "Mayoreo" },
                ].map(f => (
                    <button key={f.key}
                        onClick={() => setFiltroTipo(f.key)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filtroTipo === f.key
                            ? "bg-white text-neutral-900 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700"
                            }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                        text-sm text-red-600">{error}</div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                          rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    {clientesFiltrados.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-neutral-400 text-sm">No hay clientes registrados.</p>

                            {tienePermiso("clientes:gestionar") && (
                                <button onClick={() => navigate("/clientes/nuevo")}
                                    className="mt-3 text-sm text-neutral-900 font-medium
                           underline underline-offset-2">
                                    Agregar el primero
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50">
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600">
                                        Cliente
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden sm:table-cell">Tipo</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden md:table-cell">Contacto</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden lg:table-cell">Crédito</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {clientesFiltrados.map(c => (
                                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">

                                        {/* Nombre */}
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-neutral-900">{c.nombre}</p>
                                            {c.rfc && (
                                                <p className="text-xs text-neutral-400">RFC: {c.rfc}</p>
                                            )}
                                        </td>

                                        {/* Tipo */}
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                       text-xs font-medium ${c.tipo === "mayoreo"
                                                    ? "bg-purple-50 text-purple-600"
                                                    : "bg-neutral-100 text-neutral-500"
                                                }`}>
                                                {c.tipo === "mayoreo" ? "Mayoreo" : "General"}
                                            </span>
                                        </td>

                                        {/* Contacto */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="text-neutral-600">{c.telefono ?? "—"}</p>
                                            {c.correo && (
                                                <p className="text-xs text-neutral-400">{c.correo}</p>
                                            )}
                                        </td>

                                        {/* Crédito */}
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {c.tieneCredito ? (
                                                <div>
                                                    <span className="inline-flex items-center px-2 py-0.5
                                           rounded-full text-xs font-medium
                                           bg-green-50 text-green-600">
                                                        Crédito activo
                                                    </span>
                                                    <p className="text-xs text-neutral-400 mt-0.5">
                                                        Límite: {formatearMoneda(c.limiteCredito)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-neutral-400">Solo contado</span>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">

                                                {tienePermiso("clientes:gestionar") && (
                                                    <button onClick={() => navigate(`/clientes/${c.id}/editar`)}
                                                        className="p-1.5 text-neutral-400 hover:text-neutral-700
                                     hover:bg-neutral-100 rounded-md transition-all"
                                                        title="Editar">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                            stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}


                                                {tienePermiso("clientes:gestionar") && (
                                                    <button onClick={() => setConfirmDelete(c)}
                                                        className="p-1.5 text-neutral-400 hover:text-red-600
                                     hover:bg-red-50 rounded-md transition-all"
                                                        title="Desactivar">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                            stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
                        <h3 className="font-semibold text-neutral-900 mb-1">¿Desactivar cliente?</h3>
                        <p className="text-sm text-neutral-500 mb-5">
                            <span className="font-medium text-neutral-700">{confirmDelete.nombre}</span>{" "}
                            dejará de aparecer en el sistema. Puedes reactivarlo más adelante.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-4 py-2 border border-neutral-200 text-sm font-medium
                           rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={() => handleDesactivar(confirmDelete.id)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium
                           rounded-lg hover:bg-red-700 transition-colors">
                                Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}