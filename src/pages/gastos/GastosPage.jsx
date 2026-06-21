import { useState, useEffect, useCallback } from "react";
import {
    fetchGastos, fetchCategorias, fetchResumen,
    crearGasto, actualizarGasto, eliminarGasto,
    subirComprobante, marcarReembolsado,
} from "../../api/gastos.js";
import { fetchProveedores } from "../../api/proveedores.js";
import { apiGet, apiFetch } from "../../api/client.js";
import { formatearMoneda } from "../../utils/formato.js";
import GastosLista from "./GastosLista.jsx";
import GastosResumen from "./GastosResumen.jsx";
import GastoFormModal from "./GastoFormModal.jsx";

function periodoDefecto() {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const fmt = d => d.toISOString().split("T")[0];
    return { inicio: fmt(inicio), fin: fmt(fin) };
}

const formVacio = () => ({
    idCategoria: "", fecha: new Date().toISOString().split("T")[0],
    monto: "", descripcion: "", idProveedor: "", idPagadoPor: "",
});

export default function GastosPage() {
    const [vista, setVista] = useState("lista");
    const [gastos, setGastos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [periodo, setPeriodo] = useState(periodoDefecto());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(formVacio());
    const [loadingForm, setLoadingForm] = useState(false);
    const [errorForm, setErrorForm] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        Promise.all([fetchGastos(), fetchCategorias(), fetchProveedores()])
            .then(([g, c, p]) => { setGastos(g); setCategorias(c); setProveedores(p); })
            .catch(() => setError("Error al cargar datos"))
            .finally(() => setLoading(false));
        apiGet("/api/usuarios/activos").then(r => r.json()).then(setUsuarios).catch(() => { });
    }, []);

    const cargarResumen = useCallback(async () => {
        try {
            setResumen(await fetchResumen(periodo.inicio, periodo.fin));
        } catch (e) {
            setError(e.message);
        }
    }, [periodo]);

    useEffect(() => {
        if (vista === "resumen") cargarResumen();
    }, [vista, cargarResumen]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    function abrirFormNuevo() {
        setEditando(null);
        setForm(formVacio());
        setErrorForm("");
        setShowForm(true);
    }

    function abrirFormEditar(g) {
        setEditando(g);
        setForm({
            idCategoria: String(g.idCategoria),
            fecha: g.fecha,
            monto: String(g.monto),
            descripcion: g.descripcion ?? "",
            idProveedor: g.idProveedor ? String(g.idProveedor) : "",
            idPagadoPor: g.idPagadoPor ? String(g.idPagadoPor) : "",
        });
        setErrorForm("");
        setShowForm(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoadingForm(true);
        setErrorForm("");
        try {
            const payload = {
                idCategoria: Number(form.idCategoria),
                fecha: form.fecha,
                monto: Number(form.monto),
                descripcion: form.descripcion || null,
                idProveedor: form.idProveedor ? Number(form.idProveedor) : null,
                idPagadoPor: form.idPagadoPor ? Number(form.idPagadoPor) : null,
            };
            if (editando) {
                const actualizado = await actualizarGasto(editando.id, payload);
                setGastos(g => g.map(x => x.id === editando.id ? actualizado : x));
            } else {
                const nuevo = await crearGasto(payload);
                setGastos(g => [nuevo, ...g]);
            }
            setShowForm(false);
        } catch (e) {
            setErrorForm(e.message);
        } finally {
            setLoadingForm(false);
        }
    }

    async function handleEliminar(id) {
        try {
            await eliminarGasto(id);
            setGastos(g => g.filter(x => x.id !== id));
            setConfirmDelete(null);
        } catch (e) {
            setError(e.message);
        }
    }

    async function handleComprobante(id, file) {
        try {
            const actualizado = await subirComprobante(id, file);
            setGastos(g => g.map(x => x.id === id ? actualizado : x));
        } catch (e) {
            setError(e.message);
        }
    }

    async function handleReembolsar(id) {
        try {
            const actualizado = await marcarReembolsado(id);
            setGastos(g => g.map(x => x.id === id ? actualizado : x));
        } catch (e) {
            setError(e.message);
        }
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="p-6 lg:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Gastos</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        Registro y seguimiento de gastos operativos
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-neutral-100 rounded-lg p-1 gap-1">
                        {[{ key: "lista", label: "Lista" }, { key: "resumen", label: "Resumen" }]
                            .map(tab => (
                                <button key={tab.key}
                                    onClick={() => { setVista(tab.key); setError(""); }}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${vista === tab.key
                                        ? "bg-white text-neutral-900 shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-700"
                                        }`}>
                                    {tab.label}
                                </button>
                            ))}
                    </div>
                    <button onClick={abrirFormNuevo}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white
                       text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo gasto
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
                        text-sm text-red-600">{error}</div>
            )}

            {vista === "lista" && (
                <GastosLista
                    gastos={gastos}
                    loading={loading}
                    onNuevo={abrirFormNuevo}
                    onEditar={abrirFormEditar}
                    onEliminar={setConfirmDelete}
                    onComprobante={handleComprobante}
                    onReembolsar={handleReembolsar}
                />
            )}

            {vista === "resumen" && (
                <GastosResumen
                    resumen={resumen}
                    periodo={periodo}
                    setPeriodo={setPeriodo}
                    onConsultar={cargarResumen}
                />
            )}

            {/* Form Modal */}
            {showForm && (
                <GastoFormModal
                    editando={editando}
                    form={form}
                    setForm={setForm}
                    categorias={categorias}
                    proveedores={proveedores}
                    usuarios={usuarios}
                    onSubmit={handleSubmit}
                    onClose={() => setShowForm(false)}
                    loading={loadingForm}
                    error={errorForm}
                />
            )}

            {/* Modal confirmar eliminar */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h3 className="font-semibold text-neutral-900 mb-1">¿Eliminar gasto?</h3>
                        <p className="text-sm text-neutral-500 mb-5">
                            Se eliminará el gasto de{" "}
                            <span className="font-medium text-neutral-700">
                                {formatearMoneda(confirmDelete.monto)}
                            </span>{" "}
                            registrado el{" "}
                            {new Date(confirmDelete.fecha + "T00:00:00").toLocaleDateString("es-MX")}.
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-4 py-2 border border-neutral-200 text-sm font-medium
                           rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={() => handleEliminar(confirmDelete.id)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium
                           rounded-lg hover:bg-red-700 transition-colors">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}