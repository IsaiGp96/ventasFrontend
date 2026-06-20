import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../../api/dashboard.js";
import { formatearMoneda } from "../../utils/formato.js";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from "recharts";

const METODO_LABEL = {
    efectivo: "Efectivo", transferencia: "Transferencia",
    tarjeta: "Tarjeta", credito: "Crédito",
};

function KpiCard({ label, value, sub, color = "text-neutral-900", onClick }) {
    return (
        <div
            onClick={onClick}
            className={`bg-white border border-neutral-200 rounded-xl p-5
                  ${onClick ? "cursor-pointer hover:border-neutral-300 transition-all" : ""}`}
        >
            <p className="text-xs text-neutral-400 mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
        </div>
    );
}

function Variacion({ pct }) {
    if (pct == null) return null;
    const positivo = Number(pct) >= 0;
    return (
        <span className={`text-xs font-medium ${positivo ? "text-green-600" : "text-red-500"
            }`}>
            {positivo ? "▲" : "▼"} {Math.abs(Number(pct))}%
        </span>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard()
            .then(setData)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full py-32">
            <div className="w-7 h-7 border-2 border-neutral-900 border-t-transparent
                      rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="p-8 text-sm text-red-600">{error}</div>
    );

    // Formatear datos de gráfica de ventas
    const ventasPorDia = (data.ventasPorDia ?? []).map(p => ({
        dia: p.etiqueta.substring(5), // "05-20"
        total: Number(p.valor),
        ventas: Number(p.cantidad),
    }));

    // Formatear datos de gastos por categoría
    const gastosPorCat = (data.gastosPorCategoria ?? []).map(p => ({
        categoria: p.etiqueta,
        total: Number(p.valor),
    }));

    return (
        <div className="p-6 lg:p-8 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    {new Date().toLocaleDateString("es-MX", {
                        weekday: "long", day: "numeric",
                        month: "long", year: "numeric"
                    })}
                </p>
            </div>

            {/* ─── KPIs principales ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-5">
                    <p className="text-xs text-neutral-400 mb-1">Ventas hoy</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                        {formatearMoneda(data.ventasHoy?.total ?? 0)}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                        {data.ventasHoy?.cantidad ?? 0} transacciones ·{" "}
                        ticket {formatearMoneda(data.ventasHoy?.ticket ?? 0)}
                    </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5">
                    <div className="flex items-start justify-between">
                        <p className="text-xs text-neutral-400 mb-1">Ventas del mes</p>
                        <Variacion pct={data.ventasMes?.variacion} />
                    </div>
                    <p className="text-2xl font-semibold text-neutral-900">
                        {formatearMoneda(data.ventasMes?.total ?? 0)}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                        {data.ventasMes?.cantidad ?? 0} ventas ·{" "}
                        mes ant. {formatearMoneda(data.ventasMesAnterior?.total ?? 0)}
                    </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-5">
                    <p className="text-xs text-neutral-400 mb-1">Gastos del mes</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                        {formatearMoneda(data.gastosMes ?? 0)}
                    </p>
                    {data.utilidadMes !== null && (
                        <p className="text-xs text-neutral-400 mt-1">
                            Utilidad:{" "}
                            <span className={Number(data.utilidadMes) >= 0
                                ? "text-green-600 font-medium"
                                : "text-red-500 font-medium"
                            }>
                                {formatearMoneda(data.utilidadMes ?? 0)}
                            </span>
                        </p>
                    )}
                </div>
                {data.stockCritico !== null && data.stockCritico !== undefined && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-5">
                        <p className="text-xs text-neutral-400 mb-1">Stock crítico</p>
                        <p className={`text-2xl font-semibold ${(data.stockCritico ?? 0) > 0 ? "text-amber-500" : "text-green-600"
                            }`}>
                            {data.stockCritico ?? 0}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                            variantes con ≤ 5 piezas
                        </p>
                    </div>
                )}            </div>

            {/* ─── Alertas operativas ────────────────────────────────────────── */}
            {(data.cxcPendientes > 0 || data.comisionesPendientes > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.cxcPendientes > 0 && (
                        <button
                            onClick={() => navigate("/ventas")}
                            className="flex items-center gap-4 bg-amber-50 border border-amber-200
                         rounded-xl p-4 text-left hover:border-amber-300 transition-all"
                        >
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center
                              justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-amber-800">
                                    {data.cxcPendientes} CXC pendiente{data.cxcPendientes !== 1 ? "s" : ""}
                                </p>
                                <p className="text-xs text-amber-600">
                                    {formatearMoneda(data.montoCxcPendiente)} por cobrar
                                </p>
                            </div>
                        </button>
                    )}

                    {data.comisionesPendientes > 0 && (
                        <button
                            onClick={() => navigate("/ventas")}
                            className="flex items-center gap-4 bg-blue-50 border border-blue-200
                         rounded-xl p-4 text-left hover:border-blue-300 transition-all"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center
                              justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-blue-800">
                                    {data.comisionesPendientes} comisión{data.comisionesPendientes !== 1 ? "es" : ""} por pagar
                                </p>
                                <p className="text-xs text-blue-600">
                                    {formatearMoneda(data.montoComisionesPendiente)} acumulado
                                </p>
                            </div>
                        </button>
                    )}
                </div>
            )}

            {/* ─── Gráficas ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Ventas por día — ocupa 2/3 */}
                <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5">
                    <h2 className="text-sm font-medium text-neutral-900 mb-4">
                        Ventas últimos 30 días
                    </h2>
                    {ventasPorDia.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-neutral-300 text-sm">
                            Sin datos en el período
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={ventasPorDia}
                                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#171717" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "#a3a3a3" }}
                                    tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#a3a3a3" }}
                                    tickLine={false} axisLine={false}
                                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    formatter={(value) => [formatearMoneda(value), "Ventas"]}
                                    labelStyle={{ fontSize: 11, color: "#525252" }}
                                    contentStyle={{
                                        border: "1px solid #e5e5e5",
                                        borderRadius: "8px",
                                        fontSize: 12
                                    }} />
                                <Area type="monotone" dataKey="total"
                                    stroke="#171717" strokeWidth={2}
                                    fill="url(#gradVentas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Gastos por categoría — ocupa 1/3 */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5">
                    <h2 className="text-sm font-medium text-neutral-900 mb-4">
                        Gastos del mes por grupo
                    </h2>
                    {gastosPorCat.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-neutral-300 text-sm">
                            Sin gastos registrados
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={gastosPorCat} layout="vertical"
                                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5"
                                    horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "#a3a3a3" }}
                                    tickLine={false} axisLine={false}
                                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="categoria" width={90}
                                    tick={{ fontSize: 10, fill: "#a3a3a3" }}
                                    tickLine={false} axisLine={false} />
                                <Tooltip
                                    formatter={(value) => [formatearMoneda(value), "Gasto"]}
                                    contentStyle={{
                                        border: "1px solid #e5e5e5",
                                        borderRadius: "8px",
                                        fontSize: 12
                                    }} />
                                <Bar dataKey="total" fill="#171717" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ─── Tablas inferiores ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Últimas ventas */}
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4
                          border-b border-neutral-200">
                        <h2 className="font-medium text-neutral-900 text-sm">Últimas ventas</h2>
                        <button onClick={() => navigate("/ventas")}
                            className="text-xs text-neutral-400 hover:text-neutral-700
                         underline underline-offset-2 transition-colors">
                            Ver todas
                        </button>
                    </div>
                    {(data.ultimasVentas ?? []).length === 0 ? (
                        <div className="text-center py-10 text-neutral-300 text-sm">
                            Sin ventas registradas
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {data.ultimasVentas.map(v => (
                                <button key={v.id}
                                    onClick={() => navigate(`/ventas/${v.id}`)}
                                    className="w-full flex items-center justify-between px-5 py-3
                             hover:bg-neutral-50 transition-colors text-left">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">{v.cliente}</p>
                                        <p className="text-xs text-neutral-400">
                                            #{String(v.id).padStart(4, "0")} ·{" "}
                                            {METODO_LABEL[v.metodoPago] ?? v.metodoPago}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-neutral-900">
                                        {formatearMoneda(v.total)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stock crítico */}

                {data.variantesCriticas !== null && data.stockCritico > 0 && (
                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4
                          border-b border-neutral-200">
                            <h2 className="font-medium text-neutral-900 text-sm">Stock crítico</h2>
                            <button onClick={() => navigate("/inventario")}
                                className="text-xs text-neutral-400 hover:text-neutral-700
                         underline underline-offset-2 transition-colors">
                                Ver inventario
                            </button>
                        </div>
                        {(data.variantesCriticas ?? []).length === 0 ? (
                            <div className="text-center py-10 text-neutral-300 text-sm">
                                Todo el stock está bien ✓
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {data.variantesCriticas.map((v, i) => (
                                    <div key={i}
                                        className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">{v.producto}</p>
                                            <p className="text-xs text-neutral-400">
                                                {v.variante} · <span className="font-mono">{v.sku}</span>
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                   text-xs font-semibold ${v.stock === 0
                                                ? "bg-red-50 text-red-500"
                                                : "bg-amber-50 text-amber-600"
                                            }`}>
                                            {v.stock === 0 ? "Agotado" : `${v.stock} pzs`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>)}
            </div>
        </div>
    );
}