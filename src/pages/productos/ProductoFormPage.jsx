import { useNavigate, useParams } from "react-router-dom";
import { useProductoForm } from "./hooks/useProductoForm.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function ProductoFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const {
        tipos, proveedores, categorias, form, handleChange,
        imagenPreview, handleImagen,
        loading, loadingData, error,
        esEdicion, handleSubmit,
    } = useProductoForm(id);

    if (loadingData) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                      rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-2xl">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate("/productos")}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700
                     hover:bg-neutral-100 rounded-md transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">
                        {esEdicion ? "Editar producto" : "Nuevo producto"}
                    </h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        {esEdicion
                            ? "Modifica los datos del producto"
                            : "Completa la información del producto base"}
                    </p>
                </div>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSubmit(navigate); }}
                className="space-y-5">

                {/* Imagen */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Imagen del producto
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100
                            border-2 border-dashed border-neutral-300 flex-shrink-0
                            flex items-center justify-center">
                            {imagenPreview ? (
                                <img src={imagenPreview} alt="Preview"
                                    className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-8 h-8 text-neutral-300" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16
                       m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
                       m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6
                       a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2
                                border border-neutral-300 rounded-lg text-sm text-neutral-700
                                hover:bg-neutral-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1
                       m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {imagenPreview ? "Cambiar imagen" : "Subir imagen"}
                                <input type="file" accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImagen} className="hidden" />
                            </label>
                            <p className="text-xs text-neutral-400 mt-1.5">JPG, PNG o WEBP · Máx. 5MB</p>
                        </div>
                    </div>
                </div>

                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="nombre" value={form.nombre}
                        onChange={handleChange} required
                        placeholder="Ej. Calcetines, Playera Básica..."
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Descripción
                    </label>
                    <textarea name="descripcion" value={form.descripcion}
                        onChange={handleChange} rows={2}
                        placeholder="Descripción opcional..."
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                </div>

                {/* Tipo y Proveedor */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Tipo <span className="text-red-500">*</span>
                        </label>
                        <select name="idTipoProducto" value={form.idTipoProducto}
                            onChange={handleChange} required
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                         bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900">
                            <option value="">Selecciona</option>
                            {tipos.map(t => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Proveedor
                        </label>
                        <select name="idProveedor" value={form.idProveedor}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                         bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900">
                            <option value="">Sin proveedor</option>
                            {proveedores.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>
                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Categoría
                        </label>
                        <select name="idCategoria" value={form.idCategoria ?? ""}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                   bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900">
                            <option value="">Sin categoría</option>
                            {categorias.map(cat => (
                                <optgroup key={cat.id} label={cat.nombre}>
                                    {(cat.hijos ?? []).map(sub =>
                                        (sub.hijos ?? []).length > 0
                                            ? (sub.hijos ?? []).map(leaf => (
                                                <option key={leaf.id} value={leaf.id}>
                                                    {sub.nombre} › {leaf.nombre}
                                                </option>
                                            ))
                                            : <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                                    )}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Precio venta — precio_compra viene de la OC */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Precio de venta
                        <span className="ml-1 text-neutral-400 font-normal text-xs">
                            (opcional — se puede definir después)
                        </span>
                    </label>
                    <div className="relative max-w-xs">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2
                             text-sm text-neutral-400">$</span>
                        <input type="number" name="precioVenta" value={form.precioVenta}
                            onChange={handleChange} min="0" step="0.01"
                            placeholder="0.00"
                            className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-neutral-300
                         rounded-lg focus:outline-none focus:ring-2
                         focus:ring-neutral-900" />

                    </div>
                    <p className="text-xs text-neutral-400 mt-1.5">
                        El costo de compra se actualiza automáticamente al recibir una OC
                    </p>
                </div>

                {/* Margen de utilidad */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Margen de utilidad
                        <span className="ml-1 text-neutral-400 font-normal text-xs">
                            (% sobre precio de venta — default 30%)
                        </span>
                    </label>
                </div>

                {error && (
                    <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg
                          text-sm text-red-600">{error}</div>
                )}

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate("/productos")}
                        className="flex-1 px-4 py-2.5 border border-neutral-200 text-sm font-medium
                       rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium
                       rounded-lg hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                        {loading
                            ? "Guardando..."
                            : esEdicion ? "Guardar cambios" : "Crear producto"}
                    </button>
                </div>
            </form>
        </div>
    );
}