import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProducto, agregarVariante, desactivarVariante, subirImagenVariante } from "../../api/productos.js";
import ProductoVariantesTabla from "./components/ProductoVariantesTabla.jsx";
import { formatearMoneda } from "../../utils/formato.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// ─── Editor de atributos clave-valor ──────────────────────────────────────────
function AtributosEditor({ atributos, onChange }) {
    function add() { onChange([...atributos, { nombre: "", valor: "" }]); }
    function remove(idx) { onChange(atributos.filter((_, i) => i !== idx)); }
    function update(idx, field, value) {
        const nuevos = [...atributos];
        nuevos[idx] = { ...nuevos[idx], [field]: value };
        onChange(nuevos);
    }
    const clsInput = "flex-1 px-2.5 py-1.5 text-xs border border-neutral-300 " +
        "rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900";

    return (
        <div className="space-y-2">
            {atributos.map((a, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                    <input value={a.nombre} onChange={e => update(idx, "nombre", e.target.value)}
                        placeholder="tipo, talla..." className={clsInput} />
                    <input value={a.valor} onChange={e => update(idx, "valor", e.target.value)}
                        placeholder="Básico, M, Negro..." className={clsInput} />
                    <button type="button" onClick={() => remove(idx)}
                        className="flex-shrink-0 text-neutral-300 hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
            <button type="button" onClick={add}
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

// ─── Formulario de nueva variante ─────────────────────────────────────────────
function NuevaVariantePanel({ idProducto, onCreada, onCancelar }) {
    const [atributos, setAtributos]         = useState([{ nombre: "", valor: "" }]);
    const [sku, setSku]                     = useState("");
    const [imagenFile, setImagenFile]       = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState("");

    function handleAtributosChange(nuevos) {
        setAtributos(nuevos);
        const sugerido = nuevos
            .filter(a => a.nombre.trim() || a.valor.trim())
            .map(a => {
                const n = a.nombre.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4);
                const v = a.valor.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4);
                if (n === "") return `${v}`;
                if (v === "") return `${n}`;
                return `${n}-${v}`;
            })
            .join("-");
        setSku(sugerido);
    }

    function handleImagen(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const atributosValidos = atributos.filter(a => a.nombre.trim() || a.valor.trim());
        if (atributosValidos.length === 0) {
            setError("Agrega al menos un atributo");
            return;
        }
        if (!sku.trim()) {
            setError("El SKU es obligatorio");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const variante = await agregarVariante(idProducto, {
                sku: sku.trim(),
                atributos: Object.fromEntries(
                    atributosValidos.map(a => [
                        a.nombre.trim().toLowerCase(),
                        a.valor.trim()
                    ])
                ),
            });
            if (imagenFile && variante?.id) {
                await subirImagenVariante(variante.id, imagenFile);
            }
            onCreada();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="border-t border-neutral-200 p-5 bg-neutral-50">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">
                Nueva variante
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Atributos */}
                <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-2">
                        Atributos *
                        <span className="ml-1 font-normal text-neutral-400">
                            (tipo, talla, color, diseño, etc.)
                        </span>
                    </label>
                    <AtributosEditor
                        atributos={atributos}
                        onChange={handleAtributosChange}
                    />
                </div>

                {/* SKU */}
                <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                        SKU *
                        <span className="ml-1 font-normal text-neutral-400">
                            (auto-generado, editable)
                        </span>
                    </label>
                    <input type="text" value={sku}
                        onChange={e => setSku(e.target.value)}
                        placeholder="BAS-UNI"
                        className="w-full px-3 py-2 text-sm font-mono border border-neutral-300
                                   rounded-lg focus:outline-none focus:ring-2
                                   focus:ring-neutral-900" />
                </div>

                {/* Imagen */}
                <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                        Imagen
                        <span className="ml-1 font-normal text-neutral-400">(opcional)</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100
                                        border-2 border-dashed border-neutral-300 flex-shrink-0
                                        flex items-center justify-center">
                            {imagenPreview ? (
                                <img src={imagenPreview} alt="Preview"
                                    className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-5 h-5 text-neutral-300" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16
                                           m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
                                           m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0
                                           00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>
                        <label className="cursor-pointer inline-flex items-center gap-2
                                          px-3 py-1.5 border border-neutral-300 rounded-lg
                                          text-xs text-neutral-700 hover:bg-neutral-50
                                          transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1
                                       m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {imagenPreview ? "Cambiar" : "Subir imagen"}
                            <input type="file" accept="image/jpeg,image/png,image/webp"
                                onChange={handleImagen} className="hidden" />
                        </label>
                    </div>
                </div>

                {error && (
                    <p className="text-xs text-red-600">{error}</p>
                )}

                <div className="flex gap-2">
                    <button type="button" onClick={onCancelar}
                        className="px-4 py-2 text-xs font-medium border border-neutral-200
                                   rounded-lg text-neutral-600 hover:bg-white transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading}
                        className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white
                                   rounded-lg hover:bg-neutral-700 disabled:opacity-50
                                   transition-colors">
                        {loading ? "Guardando..." : "Crear variante"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ProductoDetallePage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [producto, setProducto]   = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);

    const cargar = useCallback(async () => {
        try {
            setLoading(true);
            setProducto(await fetchProducto(id));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { cargar(); }, [cargar]);

    function handleVarianteCreada() {
        setMostrarForm(false);
        cargar();
    }

    async function handleSubirImagenVariante(idVariante, file) {
        try {
            await subirImagenVariante(idVariante, file);
            cargar();
        } catch (e) {
            setError(e.message);
        }
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                            rounded-full animate-spin" />
        </div>
    );
    if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

    return (
        <div className="p-6 lg:p-8 max-w-4xl">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/productos")}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700
                                   hover:bg-neutral-100 rounded-md transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-neutral-900">
                            {producto.nombre}
                        </h1>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            {producto.tipoProducto}
                        </p>
                    </div>
                </div>
                <button onClick={() => navigate(`/productos/${id}/editar`)}
                    className="flex items-center gap-2 px-3 py-2 border border-neutral-200
                               text-sm font-medium rounded-lg text-neutral-700
                               hover:bg-neutral-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                               m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                </button>
            </div>

            {/* Info general */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 flex gap-5">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-neutral-100
                                border border-neutral-200 flex-shrink-0
                                flex items-center justify-center">
                    {producto.imagenUrl ? (
                        <img src={`${API_URL}${producto.imagenUrl}`} alt={producto.nombre}
                            className="w-full h-full object-cover" />
                    ) : (
                        <svg className="w-8 h-8 text-neutral-300" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16
                                   m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {producto.descripcion && (
                        <p className="text-sm text-neutral-600 mb-3">{producto.descripcion}</p>
                    )}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                            <span className="text-neutral-400 text-xs">Precio de venta</span>
                            <p className="font-semibold text-neutral-900">
                                {formatearMoneda(producto.precioVenta)}
                            </p>
                        </div>
                        {producto.precioCompra && (
                            <div>
                                <span className="text-neutral-400 text-xs">
                                    Último costo (desde OC)
                                </span>
                                <p className="font-medium text-neutral-900">
                                    {formatearMoneda(producto.precioCompra)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Variantes */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4
                                border-b border-neutral-200">
                    <div>
                        <h2 className="font-medium text-neutral-900">Variantes</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {producto.variantes?.length ?? 0} variante
                            {(producto.variantes?.length ?? 0) !== 1 ? "s" : ""} registradas
                        </p>
                    </div>
                    {!mostrarForm && (
                        <button onClick={() => setMostrarForm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border
                                       border-neutral-200 text-xs font-medium rounded-lg
                                       text-neutral-700 hover:bg-neutral-50 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva variante
                        </button>
                    )}
                </div>

                <ProductoVariantesTabla
                    variantes={producto.variantes}
                    onNuevaVariante={() => setMostrarForm(true)}
                    onSubirImagen={handleSubirImagenVariante}
                />

                {mostrarForm && (
                    <NuevaVariantePanel
                        idProducto={id}
                        onCreada={handleVarianteCreada}
                        onCancelar={() => setMostrarForm(false)}
                    />
                )}
            </div>
        </div>
    );
}