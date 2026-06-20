import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCliente, crearCliente, actualizarCliente } from "../../api/clientes.js";

export default function ClienteFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const esEdicion = Boolean(id);

    const [form, setForm] = useState({
        nombre: "", tipo: "general", telefono: "", correo: "",
        direccion: "", rfc: "", limiteCredito: "0",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(esEdicion);
    const [error, setError] = useState("");

    useEffect(() => {
        if (esEdicion) {
            fetchCliente(id)
                .then(c => setForm({
                    nombre: c.nombre,
                    tipo: c.tipo,
                    telefono: c.telefono ?? "",
                    correo: c.correo ?? "",
                    direccion: c.direccion ?? "",
                    rfc: c.rfc ?? "",
                    limiteCredito: String(c.limiteCredito ?? "0"),
                }))
                .catch(() => setError("No se pudo cargar el cliente"))
                .finally(() => setLoadingData(false));
        }
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
                tipo: form.tipo,
                telefono: form.telefono || null,
                correo: form.correo || null,
                direccion: form.direccion || null,
                rfc: form.rfc || null,
                limiteCredito: Number(form.limiteCredito) || 0,
            };
            if (esEdicion) {
                await actualizarCliente(id, payload);
            } else {
                await crearCliente(payload);
            }
            navigate("/clientes");
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

            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate("/clientes")}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700
                     hover:bg-neutral-100 rounded-md transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">
                        {esEdicion ? "Editar cliente" : "Nuevo cliente"}
                    </h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        {esEdicion ? "Modifica los datos del cliente" : "Registra un nuevo cliente"}
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
                        placeholder="Nombre del cliente o empresa"
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>

                {/* Tipo */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Tipo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                        {[
                            { value: "general", label: "General", desc: "Venta al público" },
                            { value: "mayoreo", label: "Mayoreo", desc: "Tiendas y distribuidores" },
                        ].map(op => (
                            <label key={op.value}
                                className={`flex-1 flex items-start gap-3 p-3 rounded-lg border
                            cursor-pointer transition-all ${form.tipo === op.value
                                        ? "border-neutral-900 bg-neutral-50"
                                        : "border-neutral-200 hover:border-neutral-300"
                                    }`}>
                                <input type="radio" name="tipo" value={op.value}
                                    checked={form.tipo === op.value}
                                    onChange={handleChange}
                                    className="mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-neutral-900">{op.label}</p>
                                    <p className="text-xs text-neutral-400">{op.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Teléfono y Correo */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Teléfono
                        </label>
                        <input type="text" name="telefono" value={form.telefono}
                            onChange={handleChange} placeholder="614-123-4567"
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Correo
                        </label>
                        <input type="email" name="correo" value={form.correo}
                            onChange={handleChange} placeholder="correo@empresa.com"
                            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                </div>

                {/* RFC */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        RFC
                    </label>
                    <input type="text" name="rfc" value={form.rfc}
                        onChange={handleChange} placeholder="XAXX010101000"
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>

                {/* Dirección */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Dirección
                    </label>
                    <textarea name="direccion" value={form.direccion}
                        onChange={handleChange} rows={2}
                        placeholder="Dirección del cliente..."
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
                </div>

                {/* Límite de crédito */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Límite de crédito
                        <span className="ml-1 text-neutral-400 font-normal">
                            (0 = solo contado)
                        </span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2
                             text-sm text-neutral-400">$</span>
                        <input type="number" name="limiteCredito" value={form.limiteCredito}
                            onChange={handleChange} min="0" step="0.01"
                            className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-neutral-300
                         rounded-lg focus:outline-none focus:ring-2
                         focus:ring-neutral-900" />
                    </div>
                    {Number(form.limiteCredito) > 0 && (
                        <p className="mt-1.5 text-xs text-green-600">
                            Este cliente podrá comprar a crédito hasta este monto
                        </p>
                    )}
                </div>

                {error && (
                    <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg
                          text-sm text-red-600">{error}</div>
                )}

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate("/clientes")}
                        className="flex-1 px-4 py-2.5 border border-neutral-200 text-sm font-medium
                       rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium
                       rounded-lg hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                        {loading ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear cliente"}
                    </button>
                </div>
            </form>
        </div>
    );
}