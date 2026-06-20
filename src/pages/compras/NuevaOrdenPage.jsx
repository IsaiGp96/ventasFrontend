import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { crearOrden } from "../../api/compras.js";
import { fetchProveedores } from "../../api/proveedores.js";
import { fetchProductos, fetchProducto } from "../../api/productos.js";
import { formatearMoneda } from "../../utils/formato.js";

function lineaVacia() {
    return { idProducto: "", idVariante: "", sku: "", cantidad: "", costoUnitario: "" };
}

export default function NuevaOrdenPage() {
    const navigate = useNavigate();

    // ─── Catálogos ────────────────────────────────────────────────────────────
    const [proveedores, setProveedores] = useState([]);
    const [todosProductos, setTodosProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [variantesPorProducto, setVariantesPorProducto] = useState({});
    const [loadingData, setLoadingData] = useState(true);

    // ─── Estado de la orden ───────────────────────────────────────────────────
    const [idProveedor, setIdProveedor] = useState("");
    const [esLote, setEsLote] = useState(false);
    const [costoLote, setCostoLote] = useState("");
    const [piezasLote, setPiezasLote] = useState("");
    const [flete, setFlete] = useState("0");
    const [lineas, setLineas] = useState([lineaVacia()]);

    // ─── UI ───────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([fetchProveedores(), fetchProductos()])
            .then(([p, pr]) => { setProveedores(p); setTodosProductos(pr); })
            .catch(() => setError("Error al cargar datos"))
            .finally(() => setLoadingData(false));
    }, []);

    // ─── Proveedor ────────────────────────────────────────────────────────────
    async function handleProveedorChange(nuevoId) {
        setIdProveedor(nuevoId);
        setLineas([lineaVacia()]);
        setVariantesPorProducto({});
        setProductosFiltrados([]);
        if (!nuevoId) return;

        const filtrados = todosProductos.filter(
            p => String(p.idProveedor) === String(nuevoId)
        );
        setProductosFiltrados(filtrados);

        const vars = {};
        await Promise.all(filtrados.map(async p => {
            try {
                const prod = await fetchProducto(p.id);
                vars[String(p.id)] = prod.variantes ?? [];
            } catch { }
        }));
        setVariantesPorProducto(vars);
    }

    // ─── Líneas ───────────────────────────────────────────────────────────────
    function setLinea(idx, field, value) {
        setLineas(prev => {
            const nuevas = prev.map((l, i) =>
                i === idx ? { ...l, [field]: value } : l
            );
            return nuevas;
        });
    }

    function handleProductoChange(idx, nuevoId) {
        setLineas(prev => prev.map((l, i) =>
            i === idx ? { ...l, idProducto: nuevoId, idVariante: "", sku: "" } : l
        ));
    }

    function handleVarianteChange(idx, idVariante, linea) {
        const variantes = variantesPorProducto[String(linea.idProducto)] ?? [];
        const variante = variantes.find(v => String(v.id) === String(idVariante));
        setLineas(prev => prev.map((l, i) =>
            i === idx ? { ...l, idVariante, sku: variante?.sku ?? "" } : l
        ));
    }

    function agregarLinea() { setLineas(prev => [...prev, lineaVacia()]); }
    function eliminarLinea(idx) {
        setLineas(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
    }

    // ─── Cálculos ─────────────────────────────────────────────────────────────
    const costoPorPieza = esLote && costoLote && piezasLote && Number(piezasLote) > 0
        ? (Number(costoLote) + Number(flete)) / Number(piezasLote)
        : null;

    const sumaLineas = lineas.reduce((s, l) => s + (Number(l.cantidad) || 0), 0);

    const totalOrden = esLote
        ? (Number(costoLote) || 0) + (Number(flete) || 0)
        : lineas.reduce((s, l) =>
            s + (Number(l.cantidad) || 0) * (Number(l.costoUnitario) || 0), 0
        ) + (Number(flete) || 0);

    const difPiezas = esLote && piezasLote ? Number(piezasLote) - sumaLineas : null;

    // ─── Submit ───────────────────────────────────────────────────────────────
    async function handleSubmit() {
        setLoading(true);
        setError("");
        try {
            const payload = {
                idProveedor: Number(idProveedor),
                esLote,
                costoLote: esLote ? Number(costoLote) : null,
                piezasLote: esLote ? Number(piezasLote) : null,
                flete: Number(flete) || 0,
                detalles: lineas.map(l => ({
                    idVariante: Number(l.idVariante),
                    cantidad: Number(l.cantidad),
                    costoUnitario: esLote ? null : Number(l.costoUnitario),
                })),
            };
            const orden = await crearOrden(payload);
            navigate(`/compras/${orden.id}`);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    const cls = "w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg " +
        "bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900";

    if (loadingData) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                            rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-5xl space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate("/compras")}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700
                               hover:bg-neutral-100 rounded-md transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">
                        Nueva orden de compra
                    </h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        {esLote ? "Modo lote — costo distribuido por cantidad"
                            : "Modo normal — precio por pieza definido"}
                    </p>
                </div>
            </div>

            {/* ─── Panel proveedor y tipo ─────────────────────────────────── */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-5">

                {/* Proveedor */}
                <div>
                    <h2 className="text-sm font-medium text-neutral-900 mb-3">Proveedor</h2>
                    <select
                        value={idProveedor}
                        onChange={e => handleProveedorChange(e.target.value)}
                        className="w-full max-w-sm px-3.5 py-2.5 text-sm border border-neutral-300
                                   rounded-lg bg-white focus:outline-none focus:ring-2
                                   focus:ring-neutral-900">
                        <option value="">Selecciona un proveedor</option>
                        {proveedores.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                    {idProveedor && productosFiltrados.length === 0 && (
                        <p className="mt-2 text-xs text-amber-600">
                            Este proveedor no tiene productos asignados.
                        </p>
                    )}
                </div>

                {/* Tipo de compra */}
                {idProveedor && productosFiltrados.length > 0 && (
                    <div>
                        <h2 className="text-sm font-medium text-neutral-900 mb-3">
                            Tipo de compra
                        </h2>
                        <div className="flex gap-3 mb-4">
                            {[
                                { value: false, label: "Normal", desc: "Precio por pieza" },
                                { value: true, label: "Lote / Paca", desc: "Costo por cantidad" },
                            ].map(op => (
                                <button key={String(op.value)} type="button"
                                    onClick={() => { setEsLote(op.value); setLineas([lineaVacia()]); }}
                                    className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg
                                                border transition-all text-left ${esLote === op.value
                                            ? "bg-neutral-900 text-white border-neutral-900"
                                            : "bg-white text-neutral-500 border-neutral-200"
                                        }`}>
                                    {op.label}
                                    <p className="text-xs mt-0.5 font-normal text-neutral-400">
                                        {op.desc}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Campos lote */}
                        {esLote && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1.5">
                                            Costo total del lote *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2
                                                             text-sm text-neutral-400">$</span>
                                            <input type="number" value={costoLote} min="0"
                                                step="0.01" placeholder="3000.00"
                                                onChange={e => setCostoLote(e.target.value)}
                                                className="w-full pl-7 pr-3 py-2.5 text-sm border
                                                           border-neutral-300 rounded-lg
                                                           focus:outline-none focus:ring-2
                                                           focus:ring-neutral-900" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1.5">
                                            Flete
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2
                                                             text-sm text-neutral-400">$</span>
                                            <input type="number" value={flete} min="0"
                                                step="0.01" placeholder="0.00"
                                                onChange={e => setFlete(e.target.value)}
                                                className="w-full pl-7 pr-3 py-2.5 text-sm border
                                                           border-neutral-300 rounded-lg
                                                           focus:outline-none focus:ring-2
                                                           focus:ring-neutral-900" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1.5">
                                            Total de piezas *
                                        </label>
                                        <input type="number" value={piezasLote} min="1"
                                            step="1" placeholder="300"
                                            onChange={e => setPiezasLote(e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm border
                                                       border-neutral-300 rounded-lg
                                                       focus:outline-none focus:ring-2
                                                       focus:ring-neutral-900" />
                                    </div>
                                </div>

                                {costoPorPieza != null && (
                                    <div className="px-4 py-3 bg-neutral-50 border
                                                    border-neutral-200 rounded-lg">
                                        <p className="text-xs text-neutral-400">Costo por pieza</p>
                                        <p className="text-lg font-semibold text-neutral-900">
                                            ${costoPorPieza.toFixed(2)}
                                        </p>
                                    </div>
                                )}

                                {difPiezas !== null && difPiezas !== 0 && (
                                    <div className={`px-4 py-2.5 rounded-lg text-xs border ${difPiezas > 0
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : "bg-red-50 text-red-600 border-red-200"
                                        }`}>
                                        {difPiezas > 0
                                            ? `Faltan ${difPiezas} piezas`
                                            : `${Math.abs(difPiezas)} piezas de más`}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Flete modo normal */}
                        {!esLote && (
                            <div className="max-w-xs">
                                <label className="block text-xs text-neutral-500 mb-1.5">
                                    Flete / envío
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                                                     text-sm text-neutral-400">$</span>
                                    <input type="number" value={flete} min="0" step="0.01"
                                        placeholder="0.00"
                                        onChange={e => setFlete(e.target.value)}
                                        className="w-full pl-7 pr-3 py-2.5 text-sm border
                                                   border-neutral-300 rounded-lg
                                                   focus:outline-none focus:ring-2
                                                   focus:ring-neutral-900" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Líneas de productos ────────────────────────────────────── */}
            {idProveedor && productosFiltrados.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl">

                    {/* Header tabla */}
                    <div className="flex items-center justify-between px-5 py-4
                                    border-b border-neutral-200">
                        <h2 className="text-sm font-medium text-neutral-900">Productos</h2>
                        <button type="button" onClick={agregarLinea}
                            className="flex items-center gap-1.5 px-3 py-1.5 border
                                       border-neutral-200 text-xs font-medium rounded-lg
                                       text-neutral-700 hover:bg-neutral-50 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar línea
                        </button>
                    </div>

                    {/* Filas */}
                    {lineas.map((linea, idx) => {
                        const variantesDisponibles =
                            variantesPorProducto[String(linea.idProducto)] ?? [];

                        return (
                            <div key={idx}
                                className="p-5 space-y-3 border-b border-neutral-100 last:border-b-0">

                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-neutral-400">
                                        Línea {idx + 1}
                                    </span>
                                    {lineas.length > 1 && (
                                        <button type="button" onClick={() => eliminarLinea(idx)}
                                            className="text-xs text-red-400 hover:text-red-600
                                                       transition-colors">
                                            Eliminar
                                        </button>
                                    )}
                                </div>

                                {/* Producto + Variante */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1">
                                            Producto *
                                        </label>
                                        <select
                                            value={linea.idProducto}
                                            onChange={e => handleProductoChange(idx, e.target.value)}
                                            className={cls}>
                                            <option value="">Selecciona</option>
                                            {productosFiltrados.map(p => (
                                                <option key={p.id} value={p.id}>{p.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1">
                                            Variante *
                                        </label>
                                        <select
                                            value={linea.idVariante}
                                            onChange={e => handleVarianteChange(idx, e.target.value, linea)}
                                            disabled={!linea.idProducto || variantesDisponibles.length === 0}
                                            className={`${cls} disabled:bg-neutral-50 disabled:text-neutral-400`}>
                                            <option value="">
                                                {!linea.idProducto
                                                    ? "Selecciona producto primero"
                                                    : variantesDisponibles.length === 0
                                                        ? "Sin variantes"
                                                        : "Selecciona variante"}
                                            </option>
                                            {variantesDisponibles.map(v => {
                                                const attrs = v.atributos
                                                    ? Object.entries(v.atributos)
                                                        .filter(([k]) => k !== "color_hex")
                                                        .map(([, val]) => val)
                                                        .join(" / ")
                                                    : "";
                                                return (
                                                    <option key={v.id} value={v.id}>
                                                        {attrs ? `${attrs} — ${v.sku}` : v.sku}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>

                                {/* SKU + Cantidad */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1">
                                            SKU
                                        </label>
                                        <input type="text" value={linea.sku} readOnly
                                            className="w-full px-3 py-2 text-sm font-mono
                                                       border border-neutral-200 rounded-lg
                                                       bg-neutral-50 text-neutral-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1">
                                            Cantidad *
                                        </label>
                                        <input type="number" value={linea.cantidad} min="1"
                                            placeholder="0"
                                            onChange={e => setLinea(idx, "cantidad", e.target.value)}
                                            className={cls} />
                                    </div>
                                </div>

                                {/* Costo unitario — solo modo normal */}
                                {!esLote && (
                                    <div className="max-w-xs">
                                        <label className="block text-xs text-neutral-500 mb-1">
                                            Costo unitario *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2
                                                             text-sm text-neutral-400">$</span>
                                            <input type="number" value={linea.costoUnitario}
                                                min="0" step="0.01" placeholder="0.00"
                                                onChange={e => setLinea(idx, "costoUnitario", e.target.value)}
                                                className="w-full pl-7 pr-3 py-2 text-sm border
                                                           border-neutral-300 rounded-lg
                                                           focus:outline-none focus:ring-2
                                                           focus:ring-neutral-900" />
                                        </div>
                                    </div>
                                )}

                                {/* Subtotal */}
                                {esLote && costoPorPieza != null && linea.cantidad ? (
                                    <p className="text-xs text-neutral-400 text-right">
                                        {linea.cantidad} pzs × ${costoPorPieza.toFixed(2)} ={" "}
                                        <span className="font-medium text-neutral-700">
                                            {formatearMoneda(Number(linea.cantidad) * costoPorPieza)}
                                        </span>
                                    </p>
                                ) : !esLote && linea.cantidad && linea.costoUnitario ? (
                                    <p className="text-xs text-neutral-400 text-right">
                                        Subtotal:{" "}
                                        <span className="font-medium text-neutral-700">
                                            {formatearMoneda(
                                                Number(linea.cantidad) * Number(linea.costoUnitario)
                                            )}
                                        </span>
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}

                    {/* Total */}
                    <div className="px-5 py-4 border-t border-neutral-200 bg-neutral-50
                                    rounded-b-xl flex justify-end">
                        <div className="text-right">
                            <p className="text-xs text-neutral-400">Total de la orden</p>
                            <p className="text-lg font-semibold text-neutral-900">
                                {formatearMoneda(totalOrden)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                                text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
                <button type="button" onClick={() => navigate("/compras")}
                    className="flex-1 px-4 py-2.5 border border-neutral-200 text-sm font-medium
                               rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
                    Cancelar
                </button>
                <button type="button"
                    onClick={handleSubmit}
                    disabled={loading || !idProveedor || productosFiltrados.length === 0}
                    className="flex-1 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium
                               rounded-lg hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                    {loading ? "Creando orden..." : "Crear orden de compra"}
                </button>
            </div>
        </div>
    );
}