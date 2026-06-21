import { formatearMoneda } from "../../utils/formato.js";

export default function GastoFormModal({
    editando, form, setForm, categorias, proveedores, usuarios,
    onSubmit, onClose, loading, error,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4
                      max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-neutral-200">
                    <h2 className="font-semibold text-neutral-900">
                        {editando ? "Editar gasto" : "Nuevo gasto"}
                    </h2>
                </div>

                <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Categoría <span className="text-red-500">*</span>
                        </label>
                        <select value={form.idCategoria} required
                            onChange={e => setForm({ ...form, idCategoria: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                         rounded-lg bg-white focus:outline-none focus:ring-2
                         focus:ring-neutral-900">
                            <option value="">Selecciona una categoría</option>
                            {categorias.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.grupo} › {c.subcategoria} › {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha y Monto */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Fecha <span className="text-red-500">*</span>
                            </label>
                            <input type="date" value={form.fecha} required
                                onChange={e => setForm({ ...form, fecha: e.target.value })}
                                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                           rounded-lg focus:outline-none focus:ring-2
                           focus:ring-neutral-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Monto <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2
                                 text-sm text-neutral-400">$</span>
                                <input type="number" value={form.monto} required
                                    min="0.01" step="0.01"
                                    onChange={e => setForm({ ...form, monto: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-neutral-300
                             rounded-lg focus:outline-none focus:ring-2
                             focus:ring-neutral-900" />
                            </div>
                        </div>
                    </div>

                    {/* Proveedor */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Proveedor / Beneficiario
                        </label>
                        <select value={form.idProveedor}
                            onChange={e => setForm({ ...form, idProveedor: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                         rounded-lg bg-white focus:outline-none focus:ring-2
                         focus:ring-neutral-900">
                            <option value="">Sin proveedor asignado</option>
                            {proveedores.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Pagado por — reembolso */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Pagado por
                            <span className="ml-1 text-neutral-400 font-normal">
                                (vacío = pagó la empresa)
                            </span>
                        </label>
                        <select value={form.idPagadoPor}
                            onChange={e => setForm({ ...form, idPagadoPor: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                         rounded-lg bg-white focus:outline-none focus:ring-2
                         focus:ring-neutral-900">
                            <option value="">La empresa</option>
                            {usuarios.map(u => (
                                <option key={u.id} value={u.id}>{u.nombre}</option>
                            ))}
                        </select>
                        {form.idPagadoPor && (
                            <p className="mt-1.5 text-xs text-amber-600">
                                Se generará un reembolso pendiente para este empleado
                            </p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Descripción
                        </label>
                        <textarea value={form.descripcion} rows={2}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                            placeholder="Notas adicionales..."
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                         rounded-lg focus:outline-none focus:ring-2
                         focus:ring-neutral-900 resize-none" />
                    </div>

                    {error && <p className="text-sm text-red-600 px-1">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-neutral-200 text-sm
                         font-medium rounded-lg text-neutral-700
                         hover:bg-neutral-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-neutral-900 text-white text-sm
                         font-medium rounded-lg hover:bg-neutral-700
                         disabled:opacity-50 transition-colors">
                            {loading
                                ? "Guardando..."
                                : editando ? "Guardar cambios" : "Registrar gasto"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}