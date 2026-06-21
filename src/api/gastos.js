import { apiGet, apiPost, apiPut, apiDelete, apiPostFile, apiFetch } from "./client.js";

export async function fetchCategorias() {
    const res = await apiGet("/api/gastos/categorias");
    if (!res.ok) throw new Error("Error al cargar categorías");
    return res.json();
}

export async function fetchGastos() {
    const res = await apiGet("/api/gastos");
    if (!res.ok) throw new Error("Error al cargar gastos");
    return res.json();
}

export async function fetchResumen(inicio, fin) {
    const res = await apiGet(`/api/gastos/resumen?inicio=${inicio}&fin=${fin}`);
    if (!res.ok) throw new Error("Error al cargar resumen");
    return res.json();
}

export async function crearGasto(data) {
    const res = await apiPost("/api/gastos", data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al crear gasto");
    }
    return res.json();
}

export async function actualizarGasto(id, data) {
    const res = await apiPut(`/api/gastos/${id}`, data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al actualizar gasto");
    }
    return res.json();
}

export async function eliminarGasto(id) {
    const res = await apiDelete(`/api/gastos/${id}`);
    if (!res.ok) throw new Error("Error al eliminar gasto");
}

export async function subirComprobante(id, file) {
    const res = await apiPostFile(`/api/gastos/${id}/comprobante`, file);
    if (!res.ok) throw new Error("Error al subir comprobante");
    return res.json();
}

export async function marcarReembolsado(id) {
  const res = await apiFetch(`/api/gastos/${id}/reembolsar`, { method: "PATCH" });
  if (!res.ok) throw new Error("Error al marcar reembolso");
  return res.json();
}