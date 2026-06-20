import { formatearMoneda } from "../../../utils/formato.js";

export default function OrdenProveedorPanel({
    proveedores, idProveedor, onProveedorChange,
    esLote, onEsLoteChange,
    costoLote, onCostoLote,
    piezasLote, onPiezasLote,
    flete, onFlete,
    costoPorPieza, difPiezas,
    productosFiltrados,
}) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-5">

            {/* Proveedor */}
            <div>
                <h2 className="text-sm font-medium text-neutral-900 mb-3">Proveedor</h2>
                <select value={idProveedor}
                    onChange={e => onProveedorChange(e.target.value)}
                    required
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
                {idProveedor && productosFiltrados.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-400">
                        {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""} disponible{productosFiltrados.length !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            {/* Tipo de compra */}
            {idProveedor && productosFiltrados.length > 0 && (
                <div>
                    <h2 className="text-sm font-medium text-neutral-900 mb-3">Tipo de compra</h2>
                    <div className="flex gap-3 mb-4">
                        {[
                            { value: false, label: "Normal", desc: "Precio por pieza definido" },
                            { value: true, label: "Lote / Paca", desc: "Costo distribuido por cantidad" },
                        ].map(op => (
                            <button key={String(op.value)} type="button"
                                onClick={() => onEsLoteChange(op.value)}
                                className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg border
                            transition-all text-left ${esLote === op.value
                                        ? "bg-neutral-900 text-white border-neutral-900"
                                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                                    }`}>
                                {op.label}
                                <p className={`text-xs mt-0.5 font-normal ${esLote === op.value ? "text-neutral-400" : "text-neutral-400"
                                    }`}>{op.desc}</p>
                            </button>
                        ))}
                    </div>

                    {/* Campos de lote */}
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
                                        <input type="number" value={costoLote} required
                                            min="0" step="0.01" placeholder="3000.00"
                                            onChange={e => onCostoLote(e.target.value)}
                                            className="w-full pl-7 pr-3 py-2.5 text-sm border border-neutral-300
                                 rounded-lg focus:outline-none focus:ring-2
                                 focus:ring-neutral-900" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1.5">Flete</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2
                                     text-sm text-neutral-400">$</span>
                                        <input type="number" value={flete} min="0" step="0.01"
                                            placeholder="0.00"
                                            onChange={e => onFlete(e.target.value)}
                                            className="w-full pl-7 pr-3 py-2.5 text-sm border border-neutral-300
                                 rounded-lg focus:outline-none focus:ring-2
                                 focus:ring-neutral-900" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1.5">
                                        Total de piezas *
                                    </label>
                                    <input type="number" value={piezasLote} required
                                        min="1" step="1" placeholder="300"
                                        onChange={e => onPiezasLote(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm border border-neutral-300
                               rounded-lg focus:outline-none focus:ring-2
                               focus:ring-neutral-900" />
                                </div>
                            </div>

                            {costoPorPieza != null && (
                                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50
                                border border-neutral-200 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-xs text-neutral-400">Costo por pieza</p>
                                        <p className="text-lg font-semibold text-neutral-900">
                                            ${costoPorPieza.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-neutral-400 mt-0.5">
                                            ({formatearMoneda(costoLote)} + {formatearMoneda(flete)} flete) ÷ {piezasLote} pzs
                                        </p>
                                    </div>
                                    <p className="text-xs text-neutral-400 text-right max-w-[140px]">
                                        Se aplica automáticamente a todas las líneas
                                    </p>
                                </div>
                            )}

                            {difPiezas !== null && difPiezas !== 0 && (
                                <div className={`px-4 py-2.5 rounded-lg text-xs border ${difPiezas > 0
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                    }`}>
                                    {difPiezas > 0
                                        ? `Faltan ${difPiezas} piezas por distribuir entre las variantes`
                                        : `Hay ${Math.abs(difPiezas)} piezas de más — revisa las cantidades`
                                    }
                                </div>
                            )}
                        </div>
                    )}

                    {/* Flete en modo normal */}
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
                                    onChange={e => onFlete(e.target.value)}
                                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-neutral-300
                             rounded-lg focus:outline-none focus:ring-2
                             focus:ring-neutral-900" />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}