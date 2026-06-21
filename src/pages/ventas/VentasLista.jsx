import { formatearMoneda } from "../../utils/formato.js";

const METODO_PAGO = {
    efectivo: { label: "Efectivo", bg: "bg-green-50", text: "text-green-600" },
    transferencia: { label: "Transferencia", bg: "bg-blue-50", text: "text-blue-600" },
    tarjeta: { label: "Tarjeta", bg: "bg-purple-50", text: "text-purple-600" },
    credito: { label: "Crédito", bg: "bg-amber-50", text: "text-amber-600" },
};

const ESTATUS = {
    completada: { label: "Completada", bg: "bg-green-50", text: "text-green-600" },
    cancelada: { label: "Cancelada", bg: "bg-neutral-100", text: "text-neutral-400" },
};

export default function VentasLista({ ventas, loading, onNueva, onVer }) {
    const totalHoy = ventas
        .filter(v => {
            const hoy = new Date().toISOString().split("T")[0];
            return v.fecha?.startsWith(hoy) && v.estatus === "completada";
        })
        .reduce((s, v) => s + Number(v.total), 0);

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                      rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-4">

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">Ventas hoy</p>
                    <p className="text-2xl font-semibold text-neutral-900 mt-1">
                        {ventas.filter(v => {
                            const hoy = new Date().toISOString().split("T")[0];
                            return v.fecha?.startsWith(hoy) && v.estatus === "completada";
                        }).length}
                    </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">Ingresos hoy</p>
                    <p className="text-2xl font-semibold text-neutral-900 mt-1">
                        {formatearMoneda(totalHoy)}
                    </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">Total registradas</p>
                    <p className="text-2xl font-semibold text-neutral-900 mt-1">
                        {ventas.filter(v => v.estatus === "completada").length}
                    </p>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {ventas.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-neutral-400 text-sm">No hay ventas registradas.</p>
                        <button onClick={onNueva}
                            className="mt-3 text-sm text-neutral-900 font-medium
                         underline underline-offset-2">
                            Registrar la primera
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50">
                                <th className="text-left px-4 py-3 font-medium text-neutral-600">#</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600">Cliente</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                               hidden sm:table-cell">Fecha</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                               hidden md:table-cell">Pago</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                               hidden lg:table-cell">Estatus</th>
                                <th className="text-right px-4 py-3 font-medium text-neutral-600">Total</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {ventas.map(v => {
                                const met = METODO_PAGO[v.metodoPago] ?? METODO_PAGO.efectivo;
                                const est = ESTATUS[v.estatus] ?? ESTATUS.completada;
                                return (
                                    <tr key={v.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 text-neutral-400 font-mono text-xs">
                                            #{String(v.id).padStart(4, "0")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-neutral-900">{v.cliente}</p>
                                            {v.tieneCxc && (
                                                <span className="text-xs text-amber-500">Con CXC</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell
                                   whitespace-nowrap">
                                            {new Date(v.fecha).toLocaleDateString("es-MX", {
                                                day: "2-digit", month: "short", year: "numeric",
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                       text-xs font-medium ${met.bg} ${met.text}`}>
                                                {met.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                       text-xs font-medium ${est.bg} ${est.text}`}>
                                                {est.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                                            {formatearMoneda(v.total)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => onVer(v.id)}
                                                className="p-1.5 text-neutral-400 hover:text-neutral-700
                                   hover:bg-neutral-100 rounded-md transition-all">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                               9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943
                               -9.542-7z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}