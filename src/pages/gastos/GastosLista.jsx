import { formatearMoneda } from "../../utils/formato.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function GastosLista({
    gastos, loading, onNuevo, onEditar, onEliminar,
    onComprobante, onReembolsar,
}) {
    const total = gastos.reduce((s, g) => s + Number(g.monto), 0);

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                      rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-4">

            {/* KPIs */}
            {gastos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-neutral-200 rounded-xl p-4">
                        <p className="text-xs text-neutral-400">Total registrado</p>
                        <p className="text-2xl font-semibold text-neutral-900 mt-1">
                            {formatearMoneda(total)}
                        </p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-xl p-4">
                        <p className="text-xs text-neutral-400">Número de gastos</p>
                        <p className="text-2xl font-semibold text-neutral-900 mt-1">
                            {gastos.length}
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {gastos.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-neutral-400 text-sm">No hay gastos registrados.</p>
                        <button onClick={onNuevo}
                            className="mt-3 text-sm text-neutral-900 font-medium
                         underline underline-offset-2">
                            Registrar el primero
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50">
                                <th className="text-left px-4 py-3 font-medium text-neutral-600">Fecha</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600">Concepto</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                               hidden md:table-cell">Proveedor</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                               hidden lg:table-cell">Tipo</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                               hidden lg:table-cell">Reembolso</th>
                                <th className="text-right px-4 py-3 font-medium text-neutral-600">Monto</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {gastos.map(g => (
                                <tr key={g.id} className="hover:bg-neutral-50 transition-colors">

                                    {/* Fecha */}
                                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                                        {new Date(g.fecha + "T00:00:00").toLocaleDateString("es-MX", {
                                            day: "2-digit", month: "short", year: "numeric"
                                        })}
                                    </td>

                                    {/* Concepto */}
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-neutral-900 text-xs">{g.categoria}</p>
                                        <p className="text-xs text-neutral-400">
                                            {g.grupo} › {g.subcategoria}
                                        </p>
                                        {g.descripcion && (
                                            <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-[200px]">
                                                {g.descripcion}
                                            </p>
                                        )}
                                    </td>

                                    {/* Proveedor */}
                                    <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">
                                        {g.proveedor ?? "—"}
                                    </td>

                                    {/* Tipo fijo/variable */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                     text-xs font-medium ${g.tipo === "fijo"
                                                ? "bg-blue-50 text-blue-600"
                                                : "bg-orange-50 text-orange-600"
                                            }`}>
                                            {g.tipo === "fijo" ? "Fijo" : "Variable"}
                                        </span>
                                    </td>

                                    {/* Reembolso */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {g.esReembolso ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5
                                           rounded-full text-xs font-medium ${g.estatusReembolso === "pendiente"
                                                            ? "bg-red-50 text-red-500"
                                                            : "bg-green-50 text-green-600"
                                                        }`}>
                                                        {g.estatusReembolso === "pendiente" ? "Pendiente" : "Pagado"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-neutral-400">{g.pagadoPor}</p>
                                                {g.estatusReembolso === "pendiente" && (
                                                    <button onClick={() => onReembolsar(g.id)}
                                                        className="text-xs text-green-600 hover:text-green-800
                                       underline underline-offset-2 text-left
                                       transition-colors">
                                                        Marcar pagado
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-neutral-300">—</span>
                                        )}
                                    </td>

                                    {/* Monto */}
                                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                                        {formatearMoneda(g.monto)}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 justify-end">

                                            {/* Comprobante */}
                                            {g.comprobanteUrl ? (
                                                <a href={`${API_URL}${g.comprobanteUrl}`}
                                                    target="_blank" rel="noreferrer"
                                                    className="p-1.5 text-blue-400 hover:text-blue-600
                                     hover:bg-blue-50 rounded-md transition-all"
                                                    title="Ver comprobante">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <label className="p-1.5 text-neutral-300 hover:text-neutral-600
                                          hover:bg-neutral-100 rounded-md transition-all
                                          cursor-pointer" title="Subir comprobante">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    <input type="file" className="hidden"
                                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                                        onChange={e => {
                                                            const f = e.target.files?.[0];
                                                            if (f) onComprobante(g.id, f);
                                                        }} />
                                                </label>
                                            )}

                                            {/* Editar */}
                                            <button onClick={() => onEditar(g)}
                                                className="p-1.5 text-neutral-400 hover:text-neutral-700
                                   hover:bg-neutral-100 rounded-md transition-all">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            {/* Eliminar */}
                                            <button onClick={() => onEliminar(g)}
                                                className="p-1.5 text-neutral-400 hover:text-red-600
                                   hover:bg-red-50 rounded-md transition-all">
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
        </div>
    );
}