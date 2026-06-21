import { formatearMoneda } from "../../utils/formato.js";

export default function GastosResumen({ resumen, periodo, setPeriodo, onConsultar }) {
    return (
        <div className="space-y-5">

            {/* Selector de período */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4
                      flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-500">Desde</label>
                    <input type="date" value={periodo.inicio}
                        onChange={e => setPeriodo(p => ({ ...p, inicio: e.target.value }))}
                        className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-500">Hasta</label>
                    <input type="date" value={periodo.fin}
                        onChange={e => setPeriodo(p => ({ ...p, fin: e.target.value }))}
                        className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
                <button onClick={onConsultar}
                    className="px-4 py-1.5 bg-neutral-900 text-white text-sm font-medium
                     rounded-lg hover:bg-neutral-700 transition-colors">
                    Consultar
                </button>
            </div>

            {resumen && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total del período", value: resumen.totalPeriodo, color: "text-neutral-900" },
                            { label: "Gastos fijos", value: resumen.totalFijos, color: "text-blue-600" },
                            { label: "Gastos variables", value: resumen.totalVariables, color: "text-orange-500" },
                        ].map(k => (
                            <div key={k.label} className="bg-white border border-neutral-200 rounded-xl p-4">
                                <p className="text-xs text-neutral-400">{k.label}</p>
                                <p className={`text-xl font-semibold mt-1 ${k.color}`}>
                                    {formatearMoneda(k.value)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Reembolsos pendientes */}
                    {resumen.reembolsosPendientes?.length > 0 && (
                        <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-red-100 bg-red-50">
                                <h2 className="font-medium text-red-800">Reembolsos pendientes</h2>
                                <p className="text-xs text-red-500 mt-0.5">
                                    Dinero adelantado por empleados pendiente de reembolso
                                </p>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                        <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">Empleado</th>
                                        <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">Concepto</th>
                                        <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">Fecha</th>
                                        <th className="text-right px-5 py-3 font-medium text-neutral-500 text-xs">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {resumen.reembolsosPendientes.map((g, i) => (
                                        <tr key={i}>
                                            <td className="px-5 py-3 font-medium text-neutral-900">{g.pagadoPor}</td>
                                            <td className="px-5 py-3 text-neutral-600 text-xs">{g.categoria}</td>
                                            <td className="px-5 py-3 text-neutral-500">
                                                {new Date(g.fecha + "T00:00:00").toLocaleDateString("es-MX")}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-red-600">
                                                {formatearMoneda(g.monto)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-neutral-200 bg-neutral-50">
                                        <td colSpan={3} className="px-5 py-3 text-right text-sm
                                               font-medium text-neutral-600">
                                            Total pendiente
                                        </td>
                                        <td className="px-5 py-3 text-right font-bold text-red-600">
                                            {formatearMoneda(
                                                resumen.reembolsosPendientes
                                                    .reduce((s, g) => s + Number(g.monto), 0)
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* Por categoría */}
                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-200">
                            <h2 className="font-medium text-neutral-900">Por categoría</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                    <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">Concepto</th>
                                    <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs
                                 hidden md:table-cell">Tipo</th>
                                    <th className="text-right px-5 py-3 font-medium text-neutral-500 text-xs">Registros</th>
                                    <th className="text-right px-5 py-3 font-medium text-neutral-500 text-xs">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {resumen.porCategoria?.map((c, i) => (
                                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-neutral-900 text-xs">{c.categoria}</p>
                                            <p className="text-xs text-neutral-400">{c.grupo} › {c.subcategoria}</p>
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                       text-xs font-medium ${c.tipo === "fijo"
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-orange-50 text-orange-600"
                                                }`}>
                                                {c.tipo === "fijo" ? "Fijo" : "Variable"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-neutral-500">{c.cantidad}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-neutral-900">
                                            {formatearMoneda(c.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Por mes */}
                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-200">
                            <h2 className="font-medium text-neutral-900">Por mes</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                    <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">Período</th>
                                    <th className="text-right px-5 py-3 font-medium text-neutral-500 text-xs">Registros</th>
                                    <th className="text-right px-5 py-3 font-medium text-neutral-500 text-xs">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {resumen.porMes?.map((m, i) => (
                                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-neutral-900">
                                            {new Date(m.periodo + "-01").toLocaleDateString("es-MX", {
                                                month: "long", year: "numeric"
                                            })}
                                        </td>
                                        <td className="px-5 py-3 text-right text-neutral-500">{m.cantidad}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-neutral-900">
                                            {formatearMoneda(m.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}