import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const [form, setForm] = useState({ email: "", pwd: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(form.email, form.pwd);
      saveSession(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Gestión de Ventas
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                           bg-white text-neutral-900 placeholder-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
                           transition-all"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                name="pwd"
                value={form.pwd}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                           bg-white text-neutral-900 placeholder-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
                           transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-neutral-900 text-white text-sm font-medium
                         rounded-lg hover:bg-neutral-700 active:bg-neutral-800
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-150"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}