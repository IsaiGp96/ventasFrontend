import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchVenta, cancelarVenta } from "../../api/ventas.js";
import { formatearMoneda } from "../../utils/formato.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const METODO_LABEL = {
    efectivo: "Efectivo", transferencia: "Transferencia",
    tarjeta: "Tarjeta", credito: "Crédito",
};

export default function VentaDetallePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmCancel, setConfirmCancel] = useState(false);

    const cargar = useCallback(async () => {
        try {
            setVenta(await fetchVenta(id));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { cargar(); }, [cargar]);

    async function handleCancelar() {
        try {
            await cancelarVenta(id);
            setConfirmCancel(false);
            cargar();
        } catch (e) {
            setError(e.message);
        }
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                      rounded-full animate-spin" />
        </div>
    );

    if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

    return (
        <div className="p-6 lg:p-8 max-w-4xl">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/ventas")}
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
                                Venta #{String(venta.id).padStart(4, "0")}
                            </h1>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                               text-xs font-medium ${venta.estatus === "completada"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-neutral-100 text-neutral-400"
                                }`}>
                                {venta.estatus === "completada" ? "Completada" : "Cancelada"}
                            </span>
                            {venta.tieneCxc && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full
                                 text-xs font-medium bg-amber-50 text-amber-600">
                                    CXC pendiente
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">{venta.cliente}</p>
                    </div>
                </div>

                {venta.estatus === "completada" && (
                    <button onClick={() => setConfirmCancel(true)}
                        className="px-3 py-2 border border-neutral-200 text-sm font-medium
                       rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                        Cancelar venta
                    </button>
                )}
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        label: "Fecha", value: new Date(venta.fecha).toLocaleDateString("es-MX", {
                            day: "2-digit", month: "long", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                        })
                    },
                    { label: "Método de pago", value: METODO_LABEL[venta.metodoPago] ?? venta.metodoPago },
                    { label: "Registrado por", value: venta.usuario },
                    { label: "Total", value: formatearMoneda(venta.total) },
                ].map(item => (
                    <div key={item.label}
                        className="bg-white border border-neutral-200 rounded-xl p-4">
                        <p className="text-xs text-neutral-400">{item.label}</p>
                        <p className="text-sm font-semibold text-neutral-900 mt-0.5">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Detalle de productos */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-neutral-200">
                    <h2 className="font-medium text-neutral-900">Productos vendidos</h2>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/50">
                            <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">
                                Producto
                            </th>
                            <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs
                             hidden sm:table-cell">Variante</th>
                            <th className="text-right px-5 py-3 font-medium text-neutral-500 text-xs">
                                Cantidad
                            </th>
                            <th className="text-right px-5 py-3 font-medium text-neutral-500 text-xs
                             hidden md:table-cell">Precio unit.</th>
                            <th className="text-right px-5 py-3 font-medium text-neutral-500 text-xs">
                                Subtotal
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {venta.detalles?.map(d => (
                            <tr key={d.id} className="hover:bg-neutral-50">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-100
                                    border border-neutral-200 flex-shrink-0">
                                            {d.imagenUrl ? (
                                                <img src={`${API_URL}${d.imagenUrl}`} alt={d.sku}
                                                    className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-3.5 h-3.5 text-neutral-300" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">{d.producto}</p>
                                            <p className="text-xs font-mono text-neutral-400">{d.sku}</p>
                                        </div>
                                    </div>
                                </td>
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
                                <td className="px-5 py-3 text-right font-medium text-neutral-900">
                                    {d.cantidad}
                                </td>
                                <td className="px-5 py-3 text-right text-neutral-600 hidden md:table-cell">
                                    {formatearMoneda(d.precioUnitario)}
                                </td>
                                <td className="px-5 py-3 text-right font-semibold text-neutral-900">
                                    {formatearMoneda(d.subtotal)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {venta.descuento > 0 && (
                            <tr className="border-t border-neutral-100">
                                <td colSpan={4} className="px-5 py-2 text-right text-sm text-green-600">
                                    Descuento ({venta.descuento}%)
                                </td>
                                <td className="px-5 py-2 text-right text-sm font-medium text-green-600">
                                    − {formatearMoneda(
                                        venta.detalles?.reduce((s, d) => s + Number(d.subtotal), 0) *
                                        venta.descuento / 100
                                    )}
                                </td>
                            </tr>
                        )}
                        <tr className="border-t border-neutral-200 bg-neutral-50">
                            <td colSpan={4} className="px-5 py-3 text-right text-sm font-medium
                                         text-neutral-600">Total</td>
                            <td className="px-5 py-3 text-right font-bold text-neutral-900">
                                {formatearMoneda(venta.total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Notas */}
            {venta.notas && (
                <div className="bg-white border border-neutral-200 rounded-xl p-5">
                    <p className="text-xs font-medium text-neutral-500 mb-1">Notas</p>
                    <p className="text-sm text-neutral-700">{venta.notas}</p>
                </div>
            )}

            {/* Modal cancelar */}
            {confirmCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h3 className="font-semibold text-neutral-900 mb-1">¿Cancelar venta?</h3>
                        <p className="text-sm text-neutral-500 mb-5">
                            La venta #{String(venta.id).padStart(4, "0")} será cancelada.
                            El stock no se revertirá automáticamente en esta versión.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmCancel(false)}
                                className="flex-1 px-4 py-2 border border-neutral-200 text-sm font-medium
                           rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
                                Volver
                            </button>
                            <button onClick={handleCancelar}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium
                           rounded-lg hover:bg-red-700 transition-colors">
                                Cancelar venta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}