import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrdenes, cancelarOrden, confirmarOrden, eliminarOrden } from "../../api/compras.js";
import { formatearMoneda } from "../../utils/formato.js";
import { useAuth } from "../../context/AuthContext.jsx";
const ESTATUS = {
    borrador: { label: "Borrador", bg: "bg-blue-50", text: "text-blue-500" },
    pendiente: { label: "Pendiente", bg: "bg-amber-50", text: "text-amber-600" },
    recibida: { label: "Recibida", bg: "bg-green-50", text: "text-green-600" },
    cancelada: { label: "Cancelada", bg: "bg-neutral-100", text: "text-neutral-400" },
};

export default function ComprasPage() {
    const { tienePermiso } = useAuth();
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [accion, setAccion] = useState(null); // { tipo: "recibir"|"cancelar", orden }

    useEffect(() => { cargar(); }, []);

    async function cargar() {
        try {
            setLoading(true);
            setOrdenes(await fetchOrdenes());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleAccion() {
        try {
            if (accion.tipo === "confirmar") await confirmarOrden(accion.orden.id);
            if (accion.tipo === "cancelar") await cancelarOrden(accion.orden.id);
            if (accion.tipo === "eliminar") await eliminarOrden(accion.orden.id);
            setAccion(null);
            cargar();
        } catch (e) {
            setError(e.message);
            setAccion(null);
        }
    }

    const TEXTOS_ACCION = {
        confirmar: {
            titulo: "¿Confirmar orden?",
            descripcion: (o) => `La orden #${String(o.id).padStart(4, "0")} quedará confirmada y ya no podrá editarse. Se enviará al proveedor ${o.proveedor}.`,
            boton: "Confirmar orden",
            color: "bg-amber-500 hover:bg-amber-600",
        },
        cancelar: {
            titulo: "¿Cancelar orden?",
            descripcion: (o) => `La orden será cancelada. El stock no se verá afectado.`,
            boton: "Cancelar orden",
            color: "bg-red-600 hover:bg-red-700",
        },
        eliminar: {
            titulo: "¿Eliminar borrador?",
            descripcion: (o) => `El borrador #${String(o.id).padStart(4, "0")} será eliminado permanentemente.`,
            boton: "Eliminar",
            color: "bg-red-600 hover:bg-red-700",
        },
    };

    return (
        <div className="p-6 lg:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Compras</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        Órdenes de compra y recepción de mercancía
                    </p>
                </div>
                {tienePermiso("compras:crear") && (
                    <button
                        onClick={() => navigate("/compras/nueva")}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white
                     text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva orden
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                        text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                          rounded-full animate-spin" />
                </div>
            )}

            {!loading && (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    {ordenes.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-neutral-500 text-sm">No hay órdenes de compra.</p>

                            {tienePermiso("compras:crear") && (
                                <button
                                    onClick={() => navigate("/compras/nueva")}
                                    className="mt-3 text-sm text-neutral-900 font-medium underline underline-offset-2"
                                >
                                    Crear la primera
                                </button>
                            )}

                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50">
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600">#</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Proveedor</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden sm:table-cell">Fecha</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden md:table-cell">Piezas</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600
                                 hidden md:table-cell">Total</th>
                                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Estatus</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {ordenes.map((o) => {
                                    const est = ESTATUS[o.estatus] ?? ESTATUS.pendiente;
                                    const piezas = o.detalles?.reduce((s, d) => s + d.cantidad, 0) ?? 0;
                                    return (
                                        <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 text-neutral-400 font-mono text-xs">
                                                #{String(o.id).padStart(4, "0")}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-neutral-900">
                                                {o.proveedor}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">
                                                {new Date(o.fecha).toLocaleDateString("es-MX", {
                                                    day: "2-digit", month: "short", year: "numeric"
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                                                {piezas} pzs
                                            </td>
                                            <td className="px-4 py-3 font-medium text-neutral-900 hidden md:table-cell">
                                                {formatearMoneda(o.total)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                         text-xs font-medium ${est.bg} ${est.text}`}>
                                                    {est.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    {/* Ver detalle */}
                                                    <button
                                                        onClick={() => navigate(`/compras/${o.id}`)}
                                                        className="p-1.5 text-neutral-400 hover:text-neutral-700
                                       hover:bg-neutral-100 rounded-md transition-all"
                                                        title="Ver detalle"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                            stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>

                                                    {/* Confirmar — solo borrador */}
                                                    {o.estatus === "borrador" && tienePermiso("compras:crear") && (
                                                        <button
                                                            onClick={() => setAccion({ tipo: "confirmar", orden: o })}
                                                            className="p-1.5 text-neutral-400 hover:text-amber-600
               hover:bg-amber-50 rounded-md transition-all"
                                                            title="Confirmar orden"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                                stroke="currentColor" strokeWidth={1.75}>
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Cancelar — borrador o confirmada */}
                                                    {(o.estatus === "borrador" || o.estatus === "pendiente") && tienePermiso("compras:crear") && (
                                                        <button
                                                            onClick={() => setAccion({ tipo: "cancelar", orden: o })}
                                                            className="p-1.5 text-neutral-400 hover:text-red-600
               hover:bg-red-50 rounded-md transition-all"
                                                            title="Cancelar orden"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                                stroke="currentColor" strokeWidth={1.75}>
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                    d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Eliminar — solo borrador */}
                                                    {o.estatus === "borrador" && tienePermiso("compras:crear") && (
                                                        <button
                                                            onClick={() => setAccion({ tipo: "eliminar", orden: o })}
                                                            className="p-1.5 text-neutral-400 hover:text-red-600
               hover:bg-red-50 rounded-md transition-all"
                                                            title="Eliminar borrador"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                                stroke="currentColor" strokeWidth={1.75}>
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal confirmación */}
            {accion && (() => {
                const cfg = TEXTOS_ACCION[accion.tipo];
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                            <h3 className="font-semibold text-neutral-900 mb-1">{cfg.titulo}</h3>
                            <p className="text-sm text-neutral-500 mb-5">
                                {cfg.descripcion(accion.orden)}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setAccion(null)}
                                    className="flex-1 px-4 py-2 border border-neutral-200 text-sm font-medium
                       rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
                                    Volver
                                </button>
                                <button onClick={handleAccion}
                                    className={`flex-1 px-4 py-2 text-white text-sm font-medium
                        rounded-lg transition-colors ${cfg.color}`}>
                                    {cfg.boton}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}