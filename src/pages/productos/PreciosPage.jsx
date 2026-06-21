import { useState, useEffect } from "react";
import { fetchProductos } from "../../api/productos.js";
import { apiPatch } from "../../api/client.js";
import { formatearMoneda } from "../../utils/formato.js";

function calcularPrecio(costo, pctMargen, pctComision) {
    if (!costo || costo <= 0 || pctMargen >= 100 || pctComision >= 100) return null;
    const precioConMargen = costo / (1 - pctMargen / 100);
    const precioFinal = pctComision > 0
        ? precioConMargen / (1 - pctComision / 100)
        : precioConMargen;
    return {
        precioFinal,
        utilidad: precioConMargen - costo,
        comision: precioFinal - precioConMargen,
    };
}

export default function PreciosPage() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(null); // idVariante
    const [error, setError] = useState("");
    const [ajustes, setAjustes] = useState({});   // { idVariante: {pctMargen, pctComision} }

    useEffect(() => {
        cargar();
    }, []);

    async function cargar() {
        setLoading(true);
        try {
            const data = await fetchProductos();
            setProductos(data);
            const init = {};
            data.forEach(p =>
                (p.variantes ?? []).forEach(v => {
                    init[v.id] = {
                        pctMargen: String(v.pctMargen ?? "30"),
                        pctComision: String(v.pctComision ?? "0"),
                    };
                })
            );
            setAjustes(init);
        } catch {
            setError("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    }

    function handleAjuste(idVariante, field, value) {
        setAjustes(prev => ({
            ...prev,
            [idVariante]: { ...prev[idVariante], [field]: value }
        }));
    }

    async function handleGuardar(variante) {
        const aj = ajustes[variante.id];
        if (!aj) return;
        setGuardando(variante.id);
        setError("");
        try {
            const res = await apiPatch(`/api/productos/variantes/${variante.id}/precios`, {
                pctMargen: Number(aj.pctMargen),
                pctComision: Number(aj.pctComision),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message ?? "Error al guardar");
            }
            await cargar();
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(null);
        }
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                            rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-neutral-900">Ajuste de precios</h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    Configura margen y comisión por variante.
                    El precio de venta se recalcula automáticamente al guardar.
                </p>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200
                                rounded-lg text-sm text-red-600">{error}</div>
            )}

            <div className="space-y-6">
                {productos.map(p => (
                    <div key={p.id}
                        className="bg-white border border-neutral-200 rounded-xl overflow-hidden">

                        {/* Header producto */}
                        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
                            <p className="font-medium text-neutral-900">{p.nombre}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">{p.tipoProducto}</p>
                        </div>

                        {/* Variantes */}
                        {!p.variantes || p.variantes.length === 0 ? (
                            <div className="px-5 py-4 text-sm text-neutral-400">
                                Sin variantes registradas
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {p.variantes.map(v => {
                                    const aj = ajustes[v.id] ?? { pctMargen: "30", pctComision: "0" };
                                    const calculo = calcularPrecio(
                                        Number(v.precioCompra),
                                        Number(aj.pctMargen),
                                        Number(aj.pctComision)
                                    );
                                    const cambiado =
                                        aj.pctMargen !== String(v.pctMargen ?? "30") ||
                                        aj.pctComision !== String(v.pctComision ?? "0");

                                    // Label de atributos
                                    const attrsLabel = v.atributos
                                        ? Object.entries(v.atributos)
                                            .filter(([k]) => k !== "color_hex")
                                            .map(([, val]) => val)
                                            .join(" / ")
                                        : v.sku;

                                    return (
                                        <div key={v.id} className="p-5">
                                            {/* Info variante */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-800">
                                                        {attrsLabel || v.sku}
                                                    </p>
                                                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                                                        {v.sku}
                                                        {v.precioCompra
                                                            ? ` · Costo: ${formatearMoneda(v.precioCompra)}`
                                                            : " · Sin costo"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-neutral-400">
                                                        Precio actual
                                                    </p>
                                                    <p className="text-base font-semibold text-neutral-900">
                                                        {v.precioVenta
                                                            ? formatearMoneda(v.precioVenta)
                                                            : "—"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Controles */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="block text-xs
                                                                       text-neutral-500 mb-1.5">
                                                        Margen utilidad
                                                    </label>
                                                    <div className="relative">
                                                        <input type="number"
                                                            value={aj.pctMargen}
                                                            onChange={e => handleAjuste(
                                                                v.id, "pctMargen", e.target.value
                                                            )}
                                                            min="0" max="99" step="0.1"
                                                            className="w-full pr-8 px-3 py-2 text-sm
                                                                       border border-neutral-300 rounded-lg
                                                                       focus:outline-none focus:ring-2
                                                                       focus:ring-neutral-900" />
                                                        <span className="absolute right-3 top-1/2
                                                                         -translate-y-1/2 text-neutral-400
                                                                         text-sm">%</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs
                                                                       text-neutral-500 mb-1.5">
                                                        Comisión vendedor
                                                    </label>
                                                    <div className="relative">
                                                        <input type="number"
                                                            value={aj.pctComision}
                                                            onChange={e => handleAjuste(
                                                                v.id, "pctComision", e.target.value
                                                            )}
                                                            min="0" max="99" step="0.1"
                                                            className="w-full pr-8 px-3 py-2 text-sm
                                                                       border border-neutral-300 rounded-lg
                                                                       focus:outline-none focus:ring-2
                                                                       focus:ring-neutral-900" />
                                                        <span className="absolute right-3 top-1/2
                                                                         -translate-y-1/2 text-neutral-400
                                                                         text-sm">%</span>
                                                    </div>
                                                </div>

                                                {/* Preview */}
                                                {calculo ? (
                                                    <div className="bg-neutral-50 rounded-lg px-3 py-2">
                                                        <p className="text-xs text-neutral-400">
                                                            Precio sugerido
                                                        </p>
                                                        <p className="text-base font-semibold
                                                                       text-neutral-900 mt-0.5">
                                                            {formatearMoneda(calculo.precioFinal)}
                                                        </p>
                                                        <p className="text-xs text-neutral-400 mt-1">
                                                            Util: {formatearMoneda(calculo.utilidad)}
                                                            {" · "}
                                                            Com: {formatearMoneda(calculo.comision)}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <p className="text-xs text-neutral-400">
                                                            {!v.precioCompra
                                                                ? "Recibe una OC primero"
                                                                : "Revisa los %"}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex items-end">
                                                    <button
                                                        onClick={() => handleGuardar(v)}
                                                        disabled={
                                                            !cambiado ||
                                                            guardando === v.id ||
                                                            !v.precioCompra
                                                        }
                                                        className="w-full px-4 py-2 text-sm font-medium
                                                                   bg-neutral-900 text-white rounded-lg
                                                                   hover:bg-neutral-700 disabled:opacity-40
                                                                   transition-colors">
                                                        {guardando === v.id
                                                            ? "Guardando..."
                                                            : cambiado ? "Aplicar" : "Sin cambios"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}