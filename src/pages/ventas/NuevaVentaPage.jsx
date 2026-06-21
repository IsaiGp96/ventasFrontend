import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { crearVenta } from "../../api/ventas.js";
import { fetchClientes } from "../../api/clientes.js";
import { apiGet } from "../../api/client.js";
import { formatearMoneda } from "../../utils/formato.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const METODOS_PAGO = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "credito", label: "Crédito" },
];

const clsInput = `w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
    bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900`;

export default function NuevaVentaPage() {
    const navigate = useNavigate();

    const [clientes, setClientes] = useState([]);
    const [stock, setStock] = useState([]);
    const [idCliente, setIdCliente] = useState("");
    const [metodoPago, setMetodoPago] = useState("efectivo");
    const [descuento, setDescuento] = useState("0");
    const [notas, setNotas] = useState("");
    const [lineas, setLineas] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Catálogo — producto seleccionado y buscador
    const [productoActivo, setProductoActivo] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        Promise.all([
            fetchClientes(),
            apiGet("/api/inventario/stock").then(r => r.json()),
        ]).then(([c, s]) => {
            setClientes(c);
            setStock(s);
            if (s.length > 0) setProductoActivo(s[0]);
        }).catch(() => setError("Error al cargar datos"))
            .finally(() => setLoadingData(false));
    }, []);

    const clienteSeleccionado = clientes.find(c => String(c.id) === idCliente);
    const tieneCredito = clienteSeleccionado?.tieneCredito ?? false;

    function handleClienteChange(e) {
        setIdCliente(e.target.value);
        const c = clientes.find(x => String(x.id) === e.target.value);
        if (c && !c.tieneCredito && metodoPago === "credito") setMetodoPago("efectivo");
    }

    // Productos filtrados por búsqueda
    const productosFiltrados = busqueda.trim()
        ? stock.filter(p =>
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.variantes ?? []).some(v =>
                v.sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
                Object.values(v.atributos ?? {}).join(" ").toLowerCase()
                    .includes(busqueda.toLowerCase())
            )
        )
        : stock;

    function agregarVariante(variante, producto) {
        const existente = lineas.findIndex(l => l.idVariante === variante.idVariante);
        if (existente >= 0) {
            const nuevas = [...lineas];
            if (nuevas[existente].cantidad < variante.stock)
                nuevas[existente].cantidad += 1;
            setLineas(nuevas);
        } else {
            setLineas([...lineas, {
                idVariante: variante.idVariante,
                sku: variante.sku,
                nombreProducto: producto.nombre,
                atributos: variante.atributos ?? {},
                imagenUrl: variante.imagenUrl ?? producto.imagenUrl,
                cantidad: 1,
                stockDisponible: variante.stock,
                precioUnitario: Number(variante.precioVenta ?? producto.precioVenta ?? 0),
                precioCompra: Number(producto.precioCompra ?? 0),
            }]);
        }
    }

    function actualizarLinea(idx, field, value) {
        const nuevas = [...lineas];
        nuevas[idx] = { ...nuevas[idx], [field]: value };
        setLineas(nuevas);
    }

    function eliminarLinea(idx) {
        setLineas(lineas.filter((_, i) => i !== idx));
    }

    function varianteEnPedido(idVariante) {
        return lineas.find(l => l.idVariante === idVariante);
    }

    const subtotal = lineas.reduce((s, l) => s + (Number(l.precioUnitario) || 0) * (l.cantidad || 0), 0);
    const pctDescuento = Number(descuento) || 0;
    const montoDescuento = subtotal * pctDescuento / 100;
    const total = subtotal - montoDescuento;

    async function handleSubmit(e) {
        e.preventDefault();
        if (lineas.length === 0) { setError("Agrega al menos un producto"); return; }
        setLoading(true);
        setError("");
        try {
            const venta = await crearVenta({
                idCliente: idCliente ? Number(idCliente) : null,
                metodoPago,
                descuento: pctDescuento,
                notas: notas || null,
                detalles: lineas.map(l => ({
                    idVariante: l.idVariante,
                    cantidad: l.cantidad,
                    precioUnitario: Number(l.precioUnitario),
                })),
            });
            navigate(`/ventas/${venta.id}`);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    if (loadingData) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const atributosLabel = (atributos) =>
        Object.entries(atributos ?? {})
            .filter(([k]) => k !== "color_hex")
            .map(([, v]) => v).join(" / ");

    return (
        <div className="flex flex-col h-full">

            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200 flex-shrink-0">
                <button onClick={() => navigate("/ventas")}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700
                               hover:bg-neutral-100 rounded-md transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Nueva venta</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">Selecciona productos y registra la venta</p>
                </div>
            </div>

            {/* Layout principal */}
            <form onSubmit={handleSubmit}
                className="flex flex-1 overflow-hidden">

                {/* ─── Columna izquierda — catálogo ─────────────────── */}
                <div className="flex flex-col flex-1 min-w-0 border-r border-neutral-200
                                bg-neutral-50 overflow-hidden">

                    {/* Buscador */}
                    <div className="px-4 py-3 border-b border-neutral-200 bg-white flex-shrink-0">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                                           text-neutral-400" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                placeholder="Buscar producto, SKU o atributo..."
                                className="w-full pl-9 pr-3.5 py-2 text-sm border border-neutral-200
                                           rounded-lg bg-neutral-50 focus:outline-none
                                           focus:ring-2 focus:ring-neutral-900 focus:bg-white" />
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">

                        {/* Grid de productos */}
                        <div className="w-48 flex-shrink-0 border-r border-neutral-200
                                        overflow-y-auto bg-white">
                            {productosFiltrados.filter(p =>
                                (p.variantes ?? []).some(v => v.stock > 0)
                            ).map(p => {
                                const totalVariantes = (p.variantes ?? []).filter(v => v.stock > 0).length;
                                const activo = productoActivo?.idProducto === p.idProducto;
                                return (
                                    <button key={p.idProducto} type="button"
                                        onClick={() => setProductoActivo(p)}
                                        className={`w-full text-left px-3 py-3 border-b
                                                    border-neutral-100 transition-colors flex
                                                    items-center gap-3 ${activo
                                                ? "bg-neutral-900 text-white"
                                                : "hover:bg-neutral-50 text-neutral-700"
                                            }`}>
                                        <div className={`w-8 h-8 rounded-lg flex-shrink-0
                                                         flex items-center justify-center ${activo ? "bg-white/20" : "bg-neutral-100"
                                            }`}>
                                            {p.imagenUrl ? (
                                                <img src={`${API_URL}${p.imagenUrl}`}
                                                    alt={p.nombre}
                                                    className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <svg className={`w-4 h-4 ${activo ? "text-white/60" : "text-neutral-400"}`}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium truncate leading-tight">
                                                {p.nombre}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${activo ? "text-white/60" : "text-neutral-400"
                                                }`}>
                                                {totalVariantes} var.
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Lista de variantes */}
                        <div className="flex-1 overflow-y-auto">
                            {!productoActivo ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-neutral-400">
                                        Selecciona un producto
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="px-4 py-2.5 bg-white border-b border-neutral-200
                                                    sticky top-0 z-10">
                                        <p className="text-xs font-semibold text-neutral-500 uppercase
                                                       tracking-widest">
                                            {productoActivo.nombre}
                                        </p>
                                    </div>
                                    {(productoActivo.variantes ?? [])
                                        .filter(v => v.stock > 0)
                                        .map(v => {
                                            const enPedido = varianteEnPedido(v.idVariante);
                                            const attrs = atributosLabel(v.atributos);
                                            return (
                                                <button key={v.idVariante} type="button"
                                                    onClick={() => agregarVariante(v, productoActivo)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3
                                                                border-b border-neutral-100 transition-colors
                                                                text-left ${enPedido
                                                            ? "bg-green-50 hover:bg-green-100"
                                                            : "bg-white hover:bg-neutral-50"
                                                        }`}>

                                                    {/* Check / plus */}
                                                    <div className={`w-6 h-6 rounded-full flex items-center
                                                                     justify-center flex-shrink-0 text-xs
                                                                     font-bold ${enPedido
                                                            ? "bg-green-600 text-white"
                                                            : "bg-neutral-100 text-neutral-400"
                                                        }`}>
                                                        {enPedido ? "✓" : "+"}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-neutral-900">
                                                            {attrs || v.sku}
                                                        </p>
                                                        <p className="text-xs text-neutral-400 font-mono">
                                                            {v.sku}
                                                        </p>
                                                    </div>

                                                    {/* Precio y stock */}
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-sm font-semibold text-neutral-900">
                                                            {formatearMoneda(v.precioVenta ?? productoActivo.precioVenta)}
                                                        </p>
                                                        <p className="text-xs text-neutral-400">
                                                            {enPedido
                                                                ? <span className="text-green-600 font-medium">
                                                                    {enPedido.cantidad} en pedido
                                                                </span>
                                                                : `${v.stock} disp.`
                                                            }
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Columna derecha — pedido ──────────────────────── */}
                <div className="w-80 flex-shrink-0 flex flex-col bg-white overflow-hidden">

                    {/* Header pedido */}
                    <div className="px-4 py-3 border-b border-neutral-200 flex-shrink-0">
                        <p className="text-sm font-semibold text-neutral-900">Pedido</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {lineas.length === 0
                                ? "Sin productos"
                                : `${lineas.length} producto${lineas.length > 1 ? "s" : ""}`}
                        </p>
                    </div>

                    {/* Líneas del pedido */}
                    <div className="flex-1 overflow-y-auto">
                        {lineas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
                                <svg className="w-8 h-8 text-neutral-200" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
                                </svg>
                                <p className="text-xs text-neutral-400 text-center px-4">
                                    Haz click en una variante para agregarla
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {lineas.map((l, idx) => {
                                    const precioMinimo = l.precioCompra ? l.precioCompra * 1.10 : null;
                                    const bajoCosto = precioMinimo && Number(l.precioUnitario) < precioMinimo;
                                    const attrs = atributosLabel(l.atributos);
                                    return (
                                        <div key={idx} className="px-4 py-3">
                                            <div className="flex items-start gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-neutral-900 leading-tight">
                                                        {l.nombreProducto}
                                                    </p>
                                                    <p className="text-xs text-neutral-400">
                                                        {attrs || l.sku}
                                                    </p>
                                                </div>
                                                <button type="button" onClick={() => eliminarLinea(idx)}
                                                    className="p-1 text-neutral-300 hover:text-red-500
                                                               transition-colors flex-shrink-0">
                                                    <svg className="w-3.5 h-3.5" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor"
                                                        strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Precio unitario */}
                                                <div className="relative flex-1">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2
                                                                     text-xs text-neutral-400">$</span>
                                                    <input type="number"
                                                        value={l.precioUnitario}
                                                        min="0" step="0.01"
                                                        onChange={e => actualizarLinea(idx,
                                                            "precioUnitario", Number(e.target.value))}
                                                        className={`w-full pl-5 pr-2 py-1.5 text-xs border
                                                                    rounded-md focus:outline-none
                                                                    focus:ring-1 focus:ring-neutral-900
                                                                    ${bajoCosto
                                                                ? "border-red-300 bg-red-50"
                                                                : "border-neutral-200"}`} />
                                                </div>

                                                {/* Cantidad */}
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button type="button"
                                                        onClick={() => {
                                                            if (l.cantidad > 1)
                                                                actualizarLinea(idx, "cantidad", l.cantidad - 1);
                                                        }}
                                                        className="w-6 h-6 flex items-center justify-center
                                                                   rounded border border-neutral-200
                                                                   text-neutral-600 hover:bg-neutral-100
                                                                   text-sm transition-colors">
                                                        −
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-medium
                                                                     text-neutral-900">
                                                        {l.cantidad}
                                                    </span>
                                                    <button type="button"
                                                        onClick={() => {
                                                            if (l.cantidad < l.stockDisponible)
                                                                actualizarLinea(idx, "cantidad", l.cantidad + 1);
                                                        }}
                                                        className="w-6 h-6 flex items-center justify-center
                                                                   rounded border border-neutral-200
                                                                   text-neutral-600 hover:bg-neutral-100
                                                                   text-sm transition-colors">
                                                        +
                                                    </button>
                                                </div>

                                                {/* Subtotal */}
                                                <p className="text-xs font-semibold text-neutral-900
                                                              min-w-[52px] text-right flex-shrink-0">
                                                    {formatearMoneda(l.precioUnitario * l.cantidad)}
                                                </p>
                                            </div>

                                            {bajoCosto && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    Mín: {formatearMoneda(precioMinimo)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer — totales + configuración + botón */}
                    <div className="border-t border-neutral-200 flex-shrink-0 bg-neutral-50">

                        {/* Totales */}
                        <div className="px-4 py-3 space-y-1">
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>Subtotal</span>
                                <span>{formatearMoneda(subtotal)}</span>
                            </div>
                            {pctDescuento > 0 && (
                                <div className="flex justify-between text-xs text-green-600">
                                    <span>Descuento ({pctDescuento}%)</span>
                                    <span>− {formatearMoneda(montoDescuento)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-semibold
                                            text-neutral-900 pt-1 border-t border-neutral-200 mt-1">
                                <span>Total</span>
                                <span>{formatearMoneda(total)}</span>
                            </div>
                        </div>

                        {/* Formulario compacto */}
                        <div className="px-4 pb-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Cliente</label>
                                    <select value={idCliente} onChange={handleClienteChange}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-200
                                                   rounded-lg bg-white focus:outline-none
                                                   focus:ring-1 focus:ring-neutral-900">
                                        <option value="">Público general</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Pago</label>
                                    <select value={metodoPago}
                                        onChange={e => setMetodoPago(e.target.value)}
                                        required
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-200
                                                   rounded-lg bg-white focus:outline-none
                                                   focus:ring-1 focus:ring-neutral-900">
                                        {METODOS_PAGO.map(m => (
                                            <option key={m.value} value={m.value}
                                                disabled={m.value === "credito" &&
                                                    (!idCliente || !tieneCredito)}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-neutral-400 mb-1">
                                        Descuento (%)
                                    </label>
                                    <input type="number" value={descuento}
                                        min="0" max="100" step="0.1"
                                        onChange={e => setDescuento(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-200
                                                   rounded-lg focus:outline-none
                                                   focus:ring-1 focus:ring-neutral-900" />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Notas</label>
                                    <input type="text" value={notas}
                                        onChange={e => setNotas(e.target.value)}
                                        placeholder="Referencia..."
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-200
                                                   rounded-lg focus:outline-none
                                                   focus:ring-1 focus:ring-neutral-900" />
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs text-red-600">{error}</p>
                            )}

                            <button type="submit"
                                disabled={loading || lineas.length === 0}
                                className="w-full py-2.5 bg-neutral-900 text-white text-sm
                                           font-medium rounded-lg hover:bg-neutral-700
                                           disabled:opacity-50 transition-colors">
                                {loading
                                    ? "Registrando..."
                                    : `Registrar venta · ${formatearMoneda(total)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}