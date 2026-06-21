import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProveedor, crearProveedor, actualizarProveedor } from "../../api/proveedores.js";
import SelectorLada from "../../components/SelectorLada.jsx";

const LADAS_CONOCIDAS = ["+52", "+1", "+34", "+57", "+54", "+56", "+51", "+55"];

export default function ProveedorFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const esEdicion = Boolean(id);

    const [lada, setLada] = useState("+52");
    const [form, setForm] = useState({
        nombre: "", telefono: "", correo: "",
        direccion: "", rfc: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(esEdicion);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!esEdicion) return;
        fetchProveedor(id)
            .then(p => {
                // Detectar y separar lada del número existente
                const ladaEncontrada = LADAS_CONOCIDAS
                    .find(l => p.telefono?.startsWith(l));

                setForm({
                    nombre: p.nombre,
                    telefono: ladaEncontrada
                        ? p.telefono.replace(ladaEncontrada, "").trim()
                        : (p.telefono ?? ""),
                    correo: p.correo ?? "",
                    direccion: p.direccion ?? "",
                    rfc: p.rfc ?? "",
                });
                if (ladaEncontrada) setLada(ladaEncontrada);
            })
            .catch(() => setError("No se pudo cargar el proveedor"))
            .finally(() => setLoadingData(false));
    }, [id]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = {
                nombre: form.nombre,
                // Concatena lada + número solo si hay número
                telefono: form.telefono.trim()
                    ? `${lada} ${form.telefono.trim()}`
                    : null,
                correo: form.correo || null,
                direccion: form.direccion || null,
                rfc: form.rfc || null,
            };
            esEdicion
                ? await actualizarProveedor(id, payload)
                : await crearProveedor(payload);
            navigate("/proveedores");
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    if (loadingData) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent
                            rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-lg">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate("/proveedores")}
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
                        {esEdicion ? "Editar proveedor" : "Nuevo proveedor"}
                    </h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        {esEdicion
                            ? "Modifica los datos del proveedor"
                            : "Registra un nuevo proveedor"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="nombre" value={form.nombre}
                        onChange={handleChange} required
                        placeholder="Nombre del proveedor o empresa"
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                                   rounded-lg focus:outline-none focus:ring-2
                                   focus:ring-neutral-900" />
                </div>

                {/* Teléfono con lada */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Teléfono
                    </label>
                    <div className="flex gap-2">
                        <SelectorLada value={lada} onChange={setLada} />
                        <input type="tel" name="telefono" value={form.telefono}
                            onChange={handleChange}
                            placeholder="614 123 4567"
                            className="flex-1 px-3.5 py-2.5 text-sm border border-neutral-300
                                       rounded-lg focus:outline-none focus:ring-2
                                       focus:ring-neutral-900" />
                    </div>
                    {form.telefono.trim() && (
                        <p className="text-xs text-neutral-400 mt-1.5">
                            Se guardará como: {lada} {form.telefono.trim()}
                        </p>
                    )}
                </div>

                {/* Correo */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Correo
                    </label>
                    <input type="email" name="correo" value={form.correo}
                        onChange={handleChange}
                        placeholder="correo@proveedor.com"
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                                   rounded-lg focus:outline-none focus:ring-2
                                   focus:ring-neutral-900" />
                </div>

                {/* RFC */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        RFC
                    </label>
                    <input type="text" name="rfc" value={form.rfc}
                        onChange={handleChange}
                        placeholder="XAXX010101000"
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                                   rounded-lg focus:outline-none focus:ring-2
                                   focus:ring-neutral-900" />
                </div>

                {/* Dirección */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Dirección
                    </label>
                    <textarea name="direccion" value={form.direccion}
                        onChange={handleChange} rows={3}
                        placeholder="Dirección del proveedor..."
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300
                                   rounded-lg focus:outline-none focus:ring-2
                                   focus:ring-neutral-900 resize-none" />
                </div>

                {error && (
                    <div className="px-3.5 py-2.5 bg-red-50 border border-red-200
                                    rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate("/proveedores")}
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
                            : esEdicion ? "Guardar cambios" : "Crear proveedor"}
                    </button>
                </div>
            </form>
        </div>
    );
}