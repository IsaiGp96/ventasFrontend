import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrden, confirmarOrden, cancelarOrden, eliminarOrden } from "../../api/compras.js";
import { formatearMoneda } from "../../utils/formato.js";
import { apiGet } from "../../api/client.js";

const ESTATUS = {
    borrador: { label: "Borrador", bg: "bg-blue-50", text: "text-blue-500" },
    confirmada: { label: "Confirmada", bg: "bg-amber-50", text: "text-amber-600" },
    recibida: { label: "Recibida", bg: "bg-green-50", text: "text-green-600" },
    cancelada: { label: "Cancelada", bg: "bg-neutral-100", text: "text-neutral-400" },
};
const TEXTOS_ACCION = {
    confirmar: {
        titulo: "¿Confirmar orden?",
        descripcion: (o) => `La orden #${String(o.id).padStart(4, "0")} quedará confirmada y ya no podrá editarse. Se enviará al proveedor ${o.proveedor}.`,
        boton: "Confirmar orden",
        color: "bg-amber-500 hover:bg-amber-600",
    },
    recibir: {
        titulo: "¿Recibir mercancía?",
        descripcion: (o) => `Se actualizará el stock automáticamente. Esta acción no se puede deshacer.`,
        boton: "Confirmar recepción",
        color: "bg-green-600 hover:bg-green-700",
    },
    eliminar: {
        titulo: "¿Eliminar borrador?",
        descripcion: (o) => `El borrador #${String(o.id).padStart(4, "0")} será eliminado permanentemente.`,
        boton: "Eliminar",
        color: "bg-red-600 hover:bg-red-700",
    },
};
export default function OrdenDetallePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [accion, setAccion] = useState(null);

    const cargar = useCallback(async () => {
        try {
            setOrden(await fetchOrden(id));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { cargar(); }, [cargar]);

    async function handleAccion() {
        try {
            if (accion.tipo === "confirmar") await confirmarOrden(accion.orden.id);
            if (accion.tipo === "cancelar") await cancelarOrden(accion.orden.id);
            if (accion.tipo === "eliminar") await eliminarOrden(accion.orden.id);
            setAccion(null);
            if (accion.tipo === "eliminar") {
                navigate("/compras");
            } else {
                cargar();
            }
        } catch (e) {
            setError(e.message);
            setAccion(null);
        }
    }

    // Función de descarga
    async function handleDescargarPdf() {
        try {
            const res = await apiGet(`/api/compras/${id}/pdf`);
            if (!res.ok) throw new Error("Error al generar el PDF");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `OC-${String(id).padStart(4, "0")}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setError("No se pudo generar el PDF");
        }
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                      rounded-full animate-spin" />
        </div>
    );

    if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

    const est = ESTATUS[orden.estatus] ?? ESTATUS.pendiente;
    const piezas = orden.detalles?.reduce((s, d) => s + d.cantidad, 0) ?? 0;

    return (
        <div className="p-6 lg:p-8 max-w-4xl">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/compras")}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700
                       hover:bg-neutral-100 rounded-md transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold text-neutral-900">
                                Orden #{String(orden.id).padStart(4, "0")}
                            </h1>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                               text-xs font-medium ${est.bg} ${est.text}`}>
                                {est.label}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">{orden.proveedor}</p>
                    </div>
                </div>

                {/* Botones según estatus */}
                <div className="flex gap-2">
                    {orden.estatus === "borrador" && (
                        <>
                            <button onClick={() => navigate(`/compras/${id}/editar`)}
                                className="px-3 py-2 border border-neutral-200 text-sm font-medium
                 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
                                Editar
                            </button>
                            <button onClick={() => setAccion({ tipo: "eliminar", orden })}
                                className="px-3 py-2 border border-neutral-200 text-sm font-medium
                   rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                                Eliminar borrador
                            </button>
                            <button onClick={() => setAccion({ tipo: "confirmar", orden })}
                                className="px-3 py-2 bg-amber-500 text-white text-sm font-medium
                   rounded-lg hover:bg-amber-600 transition-colors">
                                ✓ Confirmar orden
                            </button>
                        </>
                    )}
                    {orden.estatus === "confirmada" && (
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-neutral-400">
                                Ve a{" "}
                                <button
                                    onClick={() => navigate("/inventario")}
                                    className="text-neutral-700 font-medium underline underline-offset-2
                   hover:text-neutral-900 transition-colors"
                                >
                                    Inventario
                                </button>
                                {" "}para registrar la recepción
                            </p>
                        </div>
                    )}
                    {(orden.estatus === "confirmada" || orden.estatus === "recibida") && (
                        <button
                            onClick={handleDescargarPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white
                     text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar PDF
                        </button>
                    )}
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    {
                        label: "Fecha", value: new Date(orden.fecha).toLocaleDateString("es-MX", {
                            day: "2-digit", month: "long", year: "numeric"
                        })
                    },
                    { label: "Total de piezas", value: `${piezas} pzs` },
                    { label: "Total de la orden", value: `${formatearMoneda(orden.total)}` },
                ].map(item => (
                    <div key={item.label}
                        className="bg-white border border-neutral-200 rounded-xl p-4">
                        <p className="text-xs text-neutral-400">{item.label}</p>
                        <p className="text-lg font-semibold text-neutral-900 mt-0.5">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Detalles */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-200">
                    <h2 className="font-medium text-neutral-900">Productos</h2>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/50">
                            <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">SKU</th>
                            <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">Producto</th>
                            <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs
                             hidden sm:table-cell">Variante</th>
                            <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">Cantidad</th>
                            <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs
                             hidden md:table-cell">Costo unit.</th>
                            <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs
                             hidden md:table-cell">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {orden.detalles?.map((d) => (
                            <tr key={d.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs text-neutral-500">{d.sku}</td>
                                <td className="px-5 py-3 font-medium text-neutral-900">{d.producto}</td>
                                <td className="px-5 py-3 hidden sm:table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {d.atributos && Object.entries(d.atributos)
                                            .filter(([k]) => k !== "color_hex")
                                            .map(([nombre, valor]) => (
                                                <span key={nombre}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               text-xs bg-neutral-100 text-neutral-600">
                                                    <span className="text-neutral-400">{nombre}:</span>
                                                    {valor}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-neutral-900 font-medium">{d.cantidad}</td>
                                <td className="px-5 py-3 text-neutral-600 hidden md:table-cell">
                                    {formatearMoneda(d.costoUnitario)}
                                </td>
                                <td className="px-5 py-3 font-medium text-neutral-900 hidden md:table-cell">
                                    {formatearMoneda(d.subtotal)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-neutral-200 bg-neutral-50">
                            <td colSpan={5} className="px-5 py-3 text-right text-sm
                                         font-medium text-neutral-600">
                                Total
                            </td>
                            <td className="px-5 py-3 font-semibold text-neutral-900 hidden md:table-cell">
                                {formatearMoneda(orden.total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

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