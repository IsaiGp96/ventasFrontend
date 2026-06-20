import OrdenLineaFila from "./OrdenLineaFila.jsx";
import { formatearMoneda } from "../../../utils/formato.js";

export default function OrdenLineas({
    lineas, productos,
    esLote, costoPorPieza, totalOrden,
    onLinea, onAgregar, onEliminar,
    variantesPorProducto,
}) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4
                    border-b border-neutral-200 rounded-t-xl">
                <h2 className="text-sm font-medium text-neutral-900">Productos</h2>
                <button type="button" onClick={onAgregar}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200
                     text-xs font-medium rounded-lg text-neutral-700
                     hover:bg-neutral-50 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar línea
                </button>
            </div>

            <div className="divide-y divide-neutral-100">
                {lineas.map((linea, idx) => (
                    <OrdenLineaFila
                        key={idx}
                        linea={linea} idx={idx}
                        variantesPorProducto={variantesPorProducto}
                        productos={productos}
                        esLote={esLote}
                        costoPorPieza={costoPorPieza}
                        onChange={onLinea}
                        onEliminar={() => onEliminar(idx)}
                        puedeEliminar={lineas.length > 1}
                    />
                ))}
            </div>

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
    );
}