import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchComisiones, fetchMisComisiones, pagarComision } from "../../api/ventas.js";
import { formatearMoneda } from "../../utils/formato.js";

const PERIODOS = (() => {
    const periodos = [];
    const hoy = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
        periodos.push({ key, label });
    }
    return periodos;
})();

export default function ComisionesTab() {
    const { user } = useAuth();
    const esAdmin = user?.role === "ADMIN" || user?.rol === "ADMIN";

    const [comisiones, setComisiones] = useState([]);
    const [periodo, setPeriodo] = useState("");
    const [filtroEstatus, setFiltroEstatus] = useState("todos");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pagando, setPagando] = useState(null);

    useEffect(() => { cargar(); }, [periodo]);

    async function cargar() {
        setLoading(true);
        setError("");
        try {
            const data = esAdmin
                ? await fetchComisiones(periodo || null)
                : await fetchMisComisiones(periodo || null);
            setComisiones(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handlePagar(id) {
        setPagando(id);
        try {
            await pagarComision(id);
            cargar();
        } catch (e) {
            setError(e.message);
        } finally {
            setPagando(null);
        }
    }

    // Agrupar por empleado para el resumen de ADMIN
    const porEmpleado = comisiones.reduce((acc, c) => {
        if (!acc[c.usuario]) acc[c.usuario] = { pendiente: 0, pagada: 0, total: 0 };
        acc[c.usuario].total += Number(c.montoComision);
        if (c.estatus === "pendiente") acc[c.usuario].pendiente += Number(c.montoComision);
        if (c.estatus === "pagada") acc[c.usuario].pagada += Number(c.montoComision);
        return acc;
    }, {});

    const comisionesFiltradas = filtroEstatus === "todos"
        ? comisiones
        : comisiones.filter(c => c.estatus === filtroEstatus);

    const totalPendiente = comisiones
        .filter(c => c.estatus === "pendiente")
        .reduce((s, c) => s + Number(c.montoComision), 0);

    return (
        <div className="space-y-6">

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">Pendiente de pago</p>
                    <p className={`text-2xl font-semibold mt-1 ${totalPendiente > 0 ? "text-amber-500" : "text-neutral-900"
                        }`}>
                        {formatearMoneda(totalPendiente)}
                    </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">Comisiones pendientes</p>
                    <p className="text-2xl font-semibold text-neutral-900 mt-1">
                        {comisiones.filter(c => c.estatus === "pendiente").length}
                    </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <p className="text-xs text-neutral-400">Total del período</p>
                    <p className="text-2xl font-semibold text-neutral-900 mt-1">
                        {formatearMoneda(
                            comisiones.reduce((s, c) => s + Number(c.montoComision), 0)
                        )}
                    </p>
                </div>
            </div>

            {/* Resumen por empleado — solo ADMIN */}
            {esAdmin && Object.keys(porEmpleado).length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-200">
                        <h2 className="text-sm font-medium text-neutral-900">
                            Resumen por empleado
                        </h2>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {Object.entries(porEmpleado).map(([nombre, montos]) => (
                            <div key={nombre}
                                className="flex items-center justify-between px-5 py-3">
                                <div>
                                    <p className="text-sm font-medium text-neutral-900">
                                        {nombre}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                        Pagado: {formatearMoneda(montos.pagada)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {montos.pendiente > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-1
                                                         rounded-full text-xs font-medium
                                                         bg-amber-50 text-amber-600">
                                            {formatearMoneda(montos.pendiente)} pendiente
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1
                                                         rounded-full text-xs font-medium
                                                         bg-green-50 text-green-600">
                                            Al corriente
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3">
                <select value={periodo} onChange={e => setPeriodo(e.target.value)}
                    className="px-3.5 py-2 text-sm border border-neutral-300 rounded-lg
                               bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900">
                    <option value="">Todos los períodos</option>
                    {PERIODOS.map(p => (
                        <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                </select>

                <div className="flex bg-neutral-100 rounded-lg p-1 gap-1">
                    {[
                        { key: "todos", label: "Todos" },
                        { key: "pendiente", label: "Pendientes" },
                        { key: "pagada", label: "Pagadas" },
                    ].map(f => (
                        <button key={f.key}
                            onClick={() => setFiltroEstatus(f.key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md
                                        transition-all ${filtroEstatus === f.key
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-700"
                                }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                                text-sm text-red-600">{error}</div>
            )}

            {/* Tabla de comisiones */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-6 h-6 border-2 border-neutral-900
                                        border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : comisionesFiltradas.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-sm text-neutral-400">
                            No hay comisiones en este período.
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50">
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                                               text-xs">Venta</th>
                                {esAdmin && (
                                    <th className="text-left px-4 py-3 font-medium
                                                   text-neutral-600 text-xs">Empleado</th>
                                )}
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                                               text-xs hidden sm:table-cell">Período</th>
                                <th className="text-right px-4 py-3 font-medium text-neutral-600
                                               text-xs">Comisión</th>
                                <th className="text-left px-4 py-3 font-medium text-neutral-600
                                               text-xs">Estatus</th>
                                {esAdmin && (
                                    <th className="px-4 py-3" />
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {comisionesFiltradas.map(c => (
                                <tr key={c.id}
                                    className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                                        #{String(c.idVenta).padStart(4, "0")}
                                    </td>
                                    {esAdmin && (
                                        <td className="px-4 py-3 text-neutral-900 font-medium">
                                            {c.usuario}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-neutral-500 hidden
                                                   sm:table-cell capitalize">
                                        {c.periodo}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold
                                                   text-neutral-900">
                                        {formatearMoneda(c.montoComision)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {c.estatus === "pendiente" ? (
                                            <span className="inline-flex items-center px-2 py-0.5
                                                             rounded-full text-xs font-medium
                                                             bg-amber-50 text-amber-600">
                                                Pendiente
                                            </span>
                                        ) : (
                                            <div>
                                                <span className="inline-flex items-center px-2 py-0.5
                                                                 rounded-full text-xs font-medium
                                                                 bg-green-50 text-green-600">
                                                    Pagada
                                                </span>
                                                {c.fechaPago && (
                                                    <p className="text-xs text-neutral-400 mt-0.5">
                                                        {new Date(c.fechaPago).toLocaleDateString("es-MX")}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    {esAdmin && (
                                        <td className="px-4 py-3">
                                            {c.estatus === "pendiente" && (
                                                <button
                                                    onClick={() => handlePagar(c.id)}
                                                    disabled={pagando === c.id}
                                                    className="px-3 py-1.5 text-xs font-medium
                                                               bg-neutral-900 text-white rounded-lg
                                                               hover:bg-neutral-700 disabled:opacity-50
                                                               transition-colors">
                                                    {pagando === c.id ? "..." : "Marcar pagada"}
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}