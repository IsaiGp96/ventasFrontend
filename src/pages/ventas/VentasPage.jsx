import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchVentas } from "../../api/ventas.js";
import VentasLista from "./VentasLista.jsx";
import ComisionesTab from "./ComisionesTab.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function VentasPage() {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("ventas");
    const { tienePermiso } = useAuth();

    useEffect(() => {
        fetchVentas()
            .then(setVentas)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 lg:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Ventas</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        Registro de ventas y comisiones
                    </p>
                </div>
                {tab === "ventas" && tienePermiso("ventas:crear") && (
                    <button onClick={() => navigate("/ventas/nueva")}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900
                                   text-white text-sm font-medium rounded-lg
                                   hover:bg-neutral-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva venta
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex bg-neutral-100 rounded-lg p-1 gap-1 w-fit mb-6">
                {[
                    { key: "ventas", label: "Ventas" },
                    { key: "comisiones", label: "Comisiones" },
                ].map(t => (
                    <button key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md
                                    transition-all ${tab === t.key
                                ? "bg-white text-neutral-900 shadow-sm"
                                : "text-neutral-500 hover:text-neutral-700"
                            }`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200
                                rounded-lg text-sm text-red-600">{error}</div>
            )}

            {tab === "ventas" && (
                <VentasLista
                    ventas={ventas}
                    loading={loading}
                    onNueva={tienePermiso("ventas:crear") ? () => navigate("/ventas/nueva") : null}
                    onVer={id => navigate(`/ventas/${id}`)}
                />
            )}

            {tab === "comisiones" && <ComisionesTab />}
        </div>
    );
}