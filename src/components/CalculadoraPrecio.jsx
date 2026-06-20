import { useState } from "react";
import { apiPost } from "../api/client.js";
import { formatearMoneda } from "../utils/formato.js";

export default function CalculadoraPrecio({
    costoInicial = "",
    cantidadInicial = "",
    fleteTotal = "0",
    totalMercancia = "0",
    pctComisionInicial = "10",
    pctIvaInicial = "16",
    exentoIvaInicial = false,
    pctMargenInicial = "30",
    onClose,
}) {
    const [form, setForm] = useState({
        costoUnitario: costoInicial,
        cantidad: cantidadInicial,
        flete: fleteTotal,
        totalMercancia: totalMercancia,
        pctComision: pctComisionInicial,
        pctIva: pctIvaInicial,
        exentoIva: exentoIvaInicial,
        pctMargen: pctMargenInicial,
    });
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(f => ({
            ...f,
            [name]: type === "checkbox" ? checked : value,
        }));
        setResultado(null);
    }

    async function handleCalcular(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await apiPost("/api/compras/calcular-precio", {
                costoUnitario: Number(form.costoUnitario),
                cantidad: Number(form.cantidad) || 1,
                flete: Number(form.flete) || 0,
                totalMercancia: Number(form.totalMercancia) || 0,
                pctComision: Number(form.pctComision) || 0,
                pctIva: Number(form.pctIva) || 16,
                exentoIva: form.exentoIva,
                pctMargen: Number(form.pctMargen) || 0,
            });
            if (!res.ok) throw new Error("Error al calcular");
            setResultado(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4
                      max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5
                        border-b border-neutral-200">
                    <div>
                        <h2 className="font-semibold text-neutral-900">
                            Calculadora de precio de venta
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            El precio sugerido es solo referencial — no modifica el producto
                        </p>
                    </div>
                    {onClose && (
                        <button onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700
                         hover:bg-neutral-100 rounded-md transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <form onSubmit={handleCalcular} className="px-6 py-5 space-y-5">

                    {/* Costo y cantidad */}
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase
                          tracking-wide mb-3">Costo base</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">
                                    Costo unitario *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                                   text-sm text-neutral-400">$</span>
                                    <input type="number" name="costoUnitario"
                                        value={form.costoUnitario}
                                        onChange={handleChange} required min="0" step="0.01"
                                        className="w-full pl-7 pr-3 py-2.5 text-sm border
                               border-neutral-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-neutral-900" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">
                                    Cantidad
                                </label>
                                <input type="number" name="cantidad" value={form.cantidad}
                                    onChange={handleChange} min="1" step="1"
                                    placeholder="1"
                                    className="w-full px-3 py-2.5 text-sm border border-neutral-300
                             rounded-lg focus:outline-none focus:ring-2
                             focus:ring-neutral-900" />
                            </div>
                        </div>
                    </div>

                    {/* Flete */}
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase
                          tracking-wide mb-3">Flete (prorrateado por OC)</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">
                                    Flete total de la OC
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                                   text-sm text-neutral-400">$</span>
                                    <input type="number" name="flete" value={form.flete}
                                        onChange={handleChange} min="0" step="0.01"
                                        className="w-full pl-7 pr-3 py-2.5 text-sm border
                               border-neutral-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-neutral-900" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">
                                    Total mercancía de la OC
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                                   text-sm text-neutral-400">$</span>
                                    <input type="number" name="totalMercancia"
                                        value={form.totalMercancia}
                                        onChange={handleChange} min="0" step="0.01"
                                        className="w-full pl-7 pr-3 py-2.5 text-sm border
                               border-neutral-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-neutral-900" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Factores de precio */}
                    <div>
                        <p className="text-xs font-medium text-neutral-500 uppercase
                          tracking-wide mb-3">Factores de precio</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">
                                    Comisión
                                </label>
                                <div className="relative">
                                    <input type="number" name="pctComision"
                                        value={form.pctComision}
                                        onChange={handleChange} min="0" max="100" step="0.1"
                                        className="w-full pr-7 px-3 py-2.5 text-sm border
                               border-neutral-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-neutral-900" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2
                                   text-neutral-400 text-sm">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">
                                    IVA
                                </label>
                                <div className="relative">
                                    <input type="number" name="pctIva" value={form.pctIva}
                                        onChange={handleChange} min="0" max="100" step="0.1"
                                        disabled={form.exentoIva}
                                        className="w-full pr-7 px-3 py-2.5 text-sm border
                               border-neutral-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-neutral-900
                               disabled:bg-neutral-50 disabled:text-neutral-400" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2
                                   text-neutral-400 text-sm">%</span>
                                </div>
                                <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                                    <input type="checkbox" name="exentoIva"
                                        checked={form.exentoIva}
                                        onChange={handleChange}
                                        className="rounded" />
                                    <span className="text-xs text-neutral-500">Exento de IVA</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1.5">
                                    Margen de utilidad
                                </label>
                                <div className="relative">
                                    <input type="number" name="pctMargen" value={form.pctMargen}
                                        onChange={handleChange} min="0" max="1000" step="0.1"
                                        className="w-full pr-7 px-3 py-2.5 text-sm border
                               border-neutral-300 rounded-lg focus:outline-none
                               focus:ring-2 focus:ring-neutral-900" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2
                                   text-neutral-400 text-sm">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full px-4 py-2.5 bg-neutral-900 text-white text-sm
                       font-medium rounded-lg hover:bg-neutral-700
                       disabled:opacity-50 transition-colors">
                        {loading ? "Calculando..." : "Calcular precio sugerido"}
                    </button>
                </form>

                {/* Resultado */}
                {resultado && (
                    <div className="px-6 pb-6">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5
                            space-y-3">
                            <p className="text-xs font-medium text-neutral-500 uppercase
                            tracking-wide">Desglose</p>

                            {[
                                { label: "Costo unitario", value: resultado.costoUnitario },
                                { label: "Flete por pieza", value: resultado.fletePorPieza },
                                { label: "Costo real", value: resultado.costoReal, bold: true },
                            ].map(item => (
                                <div key={item.label}
                                    className="flex justify-between text-sm">
                                    <span className={item.bold
                                        ? "font-medium text-neutral-700"
                                        : "text-neutral-500"}>
                                        {item.label}
                                    </span>
                                    <span className={item.bold
                                        ? "font-semibold text-neutral-900"
                                        : "text-neutral-700"}>
                                        {formatearMoneda(item.value)}
                                    </span>
                                </div>
                            ))}

                            <div className="border-t border-neutral-200 pt-3 space-y-1.5">
                                <div className="flex justify-between text-xs text-neutral-400">
                                    <span>× Comisión ({form.pctComision}%)</span>
                                    <span>factor {Number(resultado.factorComision).toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-neutral-400">
                                    <span>
                                        × IVA ({form.exentoIva ? "exento" : `${form.pctIva}%`})
                                    </span>
                                    <span>factor {Number(resultado.factorIva).toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-neutral-400">
                                    <span>× Margen ({form.pctMargen}%)</span>
                                    <span>factor {Number(resultado.factorMargen).toFixed(4)}</span>
                                </div>
                            </div>

                            {/* Precio sugerido destacado */}
                            <div className="border-t border-neutral-200 pt-3">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-neutral-400">Precio sugerido</p>
                                        <p className="text-3xl font-bold text-neutral-900 mt-0.5">
                                            {formatearMoneda(resultado.precioSugerido)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-400">Ganancia por pieza</p>
                                        <p className="text-lg font-semibold text-green-600">
                                            {formatearMoneda(resultado.margenPesos)}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {Number(resultado.pctMargenReal)}% sobre precio final
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-neutral-400 pt-1">
                                Este precio es solo una sugerencia. Para aplicarlo ve a editar
                                el producto y actualiza el precio de venta manualmente.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}