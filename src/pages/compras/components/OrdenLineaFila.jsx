import { formatearMoneda } from "../../../utils/formato.js";

// ─── Editor de atributos clave-valor ──────────────────────────────────────────
function AtributosEditor({ atributos, onChange }) {
    function addAtributo() {
        onChange([...atributos, { nombre: "", valor: "" }]);
    }
    function removeAtributo(idx) {
        onChange(atributos.filter((_, i) => i !== idx));
    }
    function updateAtributo(idx, field, value) {
        const nuevos = [...atributos];
        nuevos[idx] = { ...nuevos[idx], [field]: value };
        onChange(nuevos);
    }

    return (
        <div className="space-y-2">
            {atributos.map((atr, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                    <input type="text" value={atr.nombre}
                        onChange={e => updateAtributo(idx, "nombre", e.target.value)}
                        placeholder="tipo, talla, color..."
                        className="flex-1 px-2.5 py-1.5 text-xs border border-neutral-300
                                   rounded-lg focus:outline-none focus:ring-2
                                   focus:ring-neutral-900" />
                    <input type="text" value={atr.valor}
                        onChange={e => updateAtributo(idx, "valor", e.target.value)}
                        placeholder="Básico, M, Negro..."
                        className="flex-1 px-2.5 py-1.5 text-xs border border-neutral-300
                                   rounded-lg focus:outline-none focus:ring-2
                                   focus:ring-neutral-900" />
                    <button type="button" onClick={() => removeAtributo(idx)}
                        className="flex-shrink-0 text-neutral-300 hover:text-red-500
                                   transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
            <button type="button" onClick={addAtributo}
                className="text-xs text-neutral-400 hover:text-neutral-700
                           flex items-center gap-1 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Agregar atributo
            </button>
        </div>
    );
}

// ─── Fila de línea de orden ────────────────────────────────────────────────────
export default function OrdenLineaFila({
    linea, idx,
    productos,
    variantesPorProducto,
    esLote, costoPorPieza,
    onChange, onEliminar, puedeEliminar,
}) {
    const clsInput = "w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg " +
        "bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900";

    // Atributos actuales de la línea (array de {nombre, valor})
    const variantesDisponibles = linea.idProducto
        ? (variantesPorProducto[String(linea.idProducto)] ?? [])
        : [];

    function handleProductoChange(nuevoId) {
        console.log("Producto seleccionado:", nuevoId);
        console.log("Variantes disponibles:", variantesPorProducto[String(nuevoId)]);
        onChange(idx, "idProducto", nuevoId);
        onChange(idx, "idVariante", "");  // limpiar variante al cambiar producto
        onChange(idx, "sku", "");
    }
    function handleVarianteChange(idVariante) {
        onChange(idx, "idVariante", idVariante);
        const variante = variantesDisponibles.find(
            v => String(v.id) === String(idVariante)
        );
        if (variante) onChange(idx, "sku", variante.sku);
    }
    function labelVariante(v) {
        if (!v.atributos || Object.keys(v.atributos).length === 0) return v.sku;
        const attrs = Object.entries(v.atributos)
            .filter(([k]) => k !== "color_hex")
            .map(([k, v]) => v)
            .join(" / ");
        return `${attrs} — ${v.sku}`;
    }

    return (
        <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                    Línea {idx + 1}
                </span>
                {puedeEliminar && (
                    <button type="button" onClick={onEliminar}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors">
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
                        id={`producto-${idx}`}
                        value={linea.idProducto}
                        onChange={e => {
                            console.log("CAMBIO:", e.target.value);
                            onChange(idx, "idProducto", e.target.value);
                            onChange(idx, "idVariante", "");
                            onChange(idx, "sku", "");
                        }}
                        className={clsInput}>
                        <option value="">Selecciona</option>
                        {productos.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-neutral-500 mb-1">
                        Variante *
                    </label>
                    <select value={linea.idVariante ?? ""} required
                        onChange={e => handleVarianteChange(e.target.value)}
                        disabled={!linea.idProducto || variantesDisponibles.length === 0}
                        className={`${clsInput} disabled:bg-neutral-50 disabled:text-neutral-400`}>
                        <option value="">
                            {!linea.idProducto
                                ? "Selecciona producto primero"
                                : variantesDisponibles.length === 0
                                    ? "Sin variantes — agrégalas en el producto"
                                    : "Selecciona variante"}
                        </option>
                        {variantesDisponibles.map(v => (
                            <option key={v.id} value={v.id}>
                                {labelVariante(v)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* SKU (solo lectura — viene de la variante) */}
            <div className="grid gap-3 grid-cols-2">
                <div>
                    <label className="block text-xs text-neutral-500 mb-1">SKU</label>
                    <input type="text" value={linea.sku} readOnly
                        className="w-full px-3 py-2 text-sm font-mono border border-neutral-200
                       rounded-lg bg-neutral-50 text-neutral-500" />
                </div>

                <div>
                    <label className="block text-xs text-neutral-500 mb-1">
                        Cantidad *
                    </label>
                    <input type="number" value={linea.cantidad} required min="1"
                        onChange={e => onChange(idx, "cantidad", e.target.value)}
                        placeholder="0" className={clsInput} />
                </div>
            </div>

            {/* Costo unitario — solo en modo normal */}
            {!esLote && (
                <div className="max-w-xs">
                    <label className="block text-xs text-neutral-500 mb-1">
                        Costo unitario *
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2
                             text-sm text-neutral-400">$</span>
                        <input type="number" value={linea.costoUnitario} required
                            min="0" step="0.01" placeholder="0.00"
                            onChange={e => onChange(idx, "costoUnitario", e.target.value)}
                            className="w-full pl-7 pr-3 py-2 text-sm border border-neutral-300
                         rounded-lg focus:outline-none focus:ring-2
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
                        {formatearMoneda(Number(linea.cantidad) * Number(linea.costoUnitario))}
                    </span>
                </p>
            ) : null}
        </div>
    );
}