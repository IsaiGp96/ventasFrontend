import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client.js";
import { formatearMoneda } from "../../utils/formato.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function InventarioPage() {
    const navigate = useNavigate();
    const [vista, setVista] = useState("stock"); // "stock" | "entradas"

    // Estado stock
    const [stock, setStock] = useState([]);
    const [loadingStock, setLoadingStock] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [expandido, setExpandido] = useState(null);

    // Estado entradas
    const [ordenes, setOrdenes] = useState([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [nota, setNota] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarStock();
    }, []);

    useEffect(() => {
        if (vista === "entradas" && ordenes.length === 0) {
            cargarOrdenes();
        }
    }, [vista]);

    async function cargarStock() {
        try {
            setLoadingStock(true);
            const res = await apiGet("/api/inventario/stock");
            setStock(await res.json());
        } catch (e) {
            setError("Error al cargar stock");
        } finally {
            setLoadingStock(false);
        }
    }

    async function cargarOrdenes() {
        try {
            setLoadingOrdenes(true);
            const res = await apiGet("/api/inventario/ordenes-pendientes");
            setOrdenes(await res.json());
        } catch (e) {
            setError("Error al cargar órdenes");
        } finally {
            setLoadingOrdenes(false);
        }
    }

    async function handleRegistrarEntrada() {
        if (!ordenSeleccionada) return;
        setProcesando(true);
        setError("");
        try {
            const res = await apiPost("/api/inventario/entrada", {
                idOrdenCompra: ordenSeleccionada.id,
                nota: nota || null,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message ?? "Error al registrar entrada");
            }
            setResultado(await res.json());
            setOrdenSeleccionada(null);
            setNota("");
            cargarOrdenes();
            cargarStock(); // refresca el stock tras la entrada
        } catch (e) {
            setError(e.message);
        } finally {
            setProcesando(false);
        }
    }

    // Filtrar stock por búsqueda
    const stockFiltrado = stock.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.tipo.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Totales generales
    const totalPiezas = stock.reduce((s, p) => s + (p.stockTotal ?? 0), 0);
    const totalProductos = stock.length;
    const sinStock = stock.filter(p => p.stockTotal === 0).length;

    return (
        <div className="p-6 lg:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Inventario</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        Consulta de stock y recepción de mercancía
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-neutral-100 rounded-lg p-1 gap-1">
                    {[
                        { key: "stock", label: "Stock" },
                        { key: "entradas", label: "Entradas" },
                    ].map(tab => (
                        <button key={tab.key}
                            onClick={() => { setVista(tab.key); setError(""); }}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${vista === tab.key
                                ? "bg-white text-neutral-900 shadow-sm"
                                : "text-neutral-500 hover:text-neutral-700"
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                        text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* ─── VISTA STOCK ──────────────────────────────────────────────────────── */}
            {vista === "stock" && (
                <div className="space-y-5">

                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Productos", value: totalProductos, color: "text-neutral-900" },
                            { label: "Piezas totales", value: formatearNumero(totalPiezas), color: "text-neutral-900" },
                            { label: "Sin stock", value: sinStock, color: sinStock > 0 ? "text-red-500" : "text-green-600" },
                        ].map(kpi => (
                            <div key={kpi.label}
                                className="bg-white border border-neutral-200 rounded-xl p-4">
                                <p className="text-xs text-neutral-400">{kpi.label}</p>
                                <p className={`text-2xl font-semibold mt-1 ${kpi.color}`}>
                                    {kpi.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Buscador */}
                    <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                            text-neutral-400" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900
                         bg-white"
                        />
                    </div>

                    {/* Tabla de stock */}
                    {loadingStock ? (
                        <div className="flex justify-center py-16">
                            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                              rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                            {stockFiltrado.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-neutral-400 text-sm">
                                        {busqueda ? "Sin resultados para la búsqueda." : "No hay productos con variantes registradas."}
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-200 bg-neutral-50">
                                            <th className="text-left px-4 py-3 font-medium text-neutral-600">
                                                Producto
                                            </th>
                                            <th className="text-left px-4 py-3 font-medium text-neutral-600
                                     hidden sm:table-cell">Tipo</th>
                                            <th className="text-left px-4 py-3 font-medium text-neutral-600
                                     hidden md:table-cell">Variantes</th>
                                            <th className="text-right px-4 py-3 font-medium text-neutral-600">
                                                Stock total
                                            </th>
                                            <th className="px-4 py-3 w-10" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {stockFiltrado.map(p => (
                                            <>
                                                <tr key={p.idProducto}
                                                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                                                    onClick={() => setExpandido(
                                                        expandido === p.idProducto ? null : p.idProducto
                                                    )}>
                                                    {/* Producto */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden
                                              bg-neutral-100 border border-neutral-200
                                              flex-shrink-0 flex items-center justify-center">
                                                                {p.imagenUrl ? (
                                                                    <img src={`${API_URL}${p.imagenUrl}`}
                                                                        alt={p.nombre}
                                                                        className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <svg className="w-4 h-4 text-neutral-300" fill="none"
                                                                        viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                                            strokeWidth={1.5}
                                                                            d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-neutral-900">{p.nombre}</p>
                                                                {p.descripcion && (
                                                                    <p className="text-xs text-neutral-400 truncate max-w-[200px]">
                                                                        {p.descripcion}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">
                                                        {p.tipo}
                                                    </td>

                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <span className="text-xs text-neutral-500">
                                                            {p.totalVariantes} variante{p.totalVariantes !== 1 ? "s" : ""}
                                                        </span>
                                                    </td>

                                                    {/* Stock total */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={`inline-flex items-center px-2.5 py-1
                                             rounded-full text-xs font-semibold ${p.stockTotal === 0
                                                                ? "bg-red-50 text-red-500"
                                                                : p.stockTotal <= 5
                                                                    ? "bg-amber-50 text-amber-600"
                                                                    : "bg-green-50 text-green-600"
                                                            }`}>
                                                            {p.stockTotal} pzs
                                                        </span>
                                                    </td>

                                                    {/* Chevron */}
                                                    <td className="px-4 py-3">
                                                        <svg className={`w-4 h-4 text-neutral-400 transition-transform ${expandido === p.idProducto ? "rotate-180" : ""
                                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                            strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </td>
                                                </tr>

                                                {/* Detalle de variantes expandido */}
                                                {expandido === p.idProducto && (
                                                    <tr key={`${p.idProducto}-detalle`}>
                                                        <td colSpan={5} className="px-4 py-0 bg-neutral-50">
                                                            <div className="border-t border-neutral-100 py-3">
                                                                <table className="w-full text-xs">
                                                                    <thead>
                                                                        <tr className="text-neutral-400">
                                                                            <th className="text-left py-1.5 pr-4 font-medium">SKU</th>
                                                                            <th className="text-left py-1.5 pr-4 font-medium">Género</th>
                                                                            <th className="text-left py-1.5 pr-4 font-medium">Talla</th>
                                                                            <th className="text-left py-1.5 pr-4 font-medium">Color</th>
                                                                            <th className="text-right py-1.5 font-medium">Stock</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-neutral-100">
                                                                        {p.variantes?.map(v => (
                                                                            <tr key={v.idVariante}>
                                                                                <td className="py-2 pr-4 font-mono text-neutral-500">
                                                                                    {v.sku}
                                                                                </td>
                                                                                <td className="py-2 pr-4 text-neutral-600">
                                                                                    {v.genero}
                                                                                </td>
                                                                                <td className="py-2 pr-4 text-neutral-600">
                                                                                    {v.talla}
                                                                                </td>
                                                                                <td className="py-2 pr-4">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        {v.codigoHex && (
                                                                                            <div className="w-3 h-3 rounded-full
                                                              border border-neutral-200"
                                                                                                style={{ backgroundColor: v.codigoHex }} />
                                                                                        )}
                                                                                        <span className="text-neutral-600">{v.color}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2 text-right">
                                                                                    <span className={`font-semibold ${v.stock === 0
                                                                                        ? "text-red-500"
                                                                                        : v.stock <= 3
                                                                                            ? "text-amber-500"
                                                                                            : "text-green-600"
                                                                                        }`}>
                                                                                        {v.stock}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ─── VISTA ENTRADAS ───────────────────────────────────────────────────── */}
            {vista === "entradas" && (
                <div className="space-y-6">

                    {/* Resultado de entrada registrada */}
                    {resultado && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="font-medium text-green-800">
                                        ✓ Entrada registrada correctamente
                                    </h2>
                                    <p className="text-sm text-green-600 mt-0.5">
                                        OC #{String(resultado.idOrdenCompra).padStart(4, "0")} —{" "}
                                        {resultado.proveedor}
                                    </p>
                                </div>
                                <button onClick={() => setResultado(null)}
                                    className="text-green-600 hover:text-green-800 text-sm
                             underline underline-offset-2">
                                    Cerrar
                                </button>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-green-200">
                                        <th className="text-left py-2 font-medium text-green-700">SKU</th>
                                        <th className="text-left py-2 font-medium text-green-700">Producto</th>
                                        <th className="text-left py-2 font-medium text-green-700
                                   hidden sm:table-cell">Variante</th>
                                        <th className="text-right py-2 font-medium text-green-700">Antes</th>
                                        <th className="text-right py-2 font-medium text-green-700">+</th>
                                        <th className="text-right py-2 font-medium text-green-700">
                                            Nuevo stock
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultado.movimientos?.map((m, i) => (
                                        <tr key={i} className="border-b border-green-100">
                                            <td className="py-2 font-mono text-xs text-green-700">{m.sku}</td>
                                            <td className="py-2 text-green-800 font-medium">{m.producto}</td>
                                            <td className="py-2 text-green-700 hidden sm:table-cell">
                                                {m.variante}
                                            </td>
                                            <td className="py-2 text-right text-green-700">
                                                {m.cantidadAnterior}
                                            </td>
                                            <td className="py-2 text-right text-green-600 font-medium">
                                                +{m.cantidadAgregada}
                                            </td>
                                            <td className="py-2 text-right font-semibold text-green-800">
                                                {m.cantidadNueva}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Lista de órdenes confirmadas */}
                        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-neutral-200">
                                <h2 className="font-medium text-neutral-900">
                                    Órdenes pendientes de recepción
                                </h2>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    Órdenes confirmadas listas para recibir
                                </p>
                            </div>

                            {loadingOrdenes ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-5 h-5 border-2 border-neutral-900
                                  border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : ordenes.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-sm text-neutral-400">
                                        No hay órdenes confirmadas pendientes.
                                    </p>
                                    <button onClick={() => navigate("/compras")}
                                        className="mt-2 text-sm text-neutral-700 underline underline-offset-2">
                                        Ir a Compras
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100">
                                    {ordenes.map(o => (
                                        <button key={o.id}
                                            onClick={() => {
                                                setOrdenSeleccionada(o);
                                                setResultado(null);
                                                setError("");
                                            }}
                                            className={`w-full text-left px-5 py-4 transition-colors ${ordenSeleccionada?.id === o.id
                                                ? "bg-neutral-900 text-white"
                                                : "hover:bg-neutral-50"
                                                }`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={`font-medium text-sm ${ordenSeleccionada?.id === o.id
                                                        ? "text-white" : "text-neutral-900"
                                                        }`}>
                                                        #{String(o.id).padStart(4, "0")} — {o.proveedor}
                                                    </p>
                                                    <p className={`text-xs mt-0.5 ${ordenSeleccionada?.id === o.id
                                                        ? "text-neutral-300" : "text-neutral-400"
                                                        }`}>
                                                        {new Date(o.fecha).toLocaleDateString("es-MX", {
                                                            day: "2-digit", month: "short", year: "numeric"
                                                        })}
                                                        {" · "}
                                                        {o.detalles?.reduce((s, d) => s + d.cantidad, 0) ?? 0} pzs
                                                        {" · "}
                                                        {formatearMoneda(o.total)}
                                                    </p>
                                                </div>
                                                {ordenSeleccionada?.id === o.id && (
                                                    <svg className="w-4 h-4 text-white flex-shrink-0" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Panel de recepción */}
                        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-neutral-200">
                                <h2 className="font-medium text-neutral-900">Registrar entrada</h2>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    Selecciona una orden y confirma la recepción
                                </p>
                            </div>

                            {!ordenSeleccionada ? (
                                <div className="flex items-center justify-center py-16 text-center px-5">
                                    <div>
                                        <svg className="w-10 h-10 text-neutral-200 mx-auto mb-3" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                                        </svg>
                                        <p className="text-sm text-neutral-400">
                                            Selecciona una orden para registrar su entrada
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 space-y-5">

                                    {/* Resumen */}
                                    <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                                            Orden #{String(ordenSeleccionada.id).padStart(4, "0")}
                                        </p>
                                        <div className="divide-y divide-neutral-200">
                                            {ordenSeleccionada.detalles?.map(d => (
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
                                            ))}
                                        </div>
                                        <div className="pt-1 flex justify-between text-sm font-semibold">
                                            <span className="text-neutral-500">Total</span>
                                            <span className="text-neutral-900">
                                                {formatearMoneda(ordenSeleccionada.total)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Nota */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                            Nota{" "}
                                            <span className="text-neutral-400 font-normal">(opcional)</span>
                                        </label>
                                        <textarea value={nota} onChange={e => setNota(e.target.value)}
                                            rows={2}
                                            placeholder="Ej. Recibido con factura #123..."
                                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                                 rounded-lg focus:outline-none focus:ring-2
                                 focus:ring-neutral-900 resize-none" />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3">
                                        <button onClick={() => setOrdenSeleccionada(null)}
                                            className="flex-1 px-4 py-2.5 border border-neutral-200 text-sm
                                 font-medium rounded-lg text-neutral-700
                                 hover:bg-neutral-50 transition-colors">
                                            Cancelar
                                        </button>
                                        <button onClick={handleRegistrarEntrada} disabled={procesando}
                                            className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm
                                 font-medium rounded-lg hover:bg-green-700
                                 disabled:opacity-50 transition-colors">
                                            {procesando ? "Registrando..." : "✓ Confirmar recepción"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper para formatear números con separador de miles
function formatearNumero(n) {
    return new Intl.NumberFormat("es-MX").format(n ?? 0);
}