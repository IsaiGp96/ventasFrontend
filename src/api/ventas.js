import { apiGet, apiPost, apiFetch } from "./client.js";

export async function fetchVentas() {
    const res = await apiGet("/api/ventas");
    if (!res.ok) throw new Error("Error al cargar ventas");
    return res.json();
}

export async function fetchVenta(id) {
    const res = await apiGet(`/api/ventas/${id}`);
    if (!res.ok) throw new Error("Venta no encontrada");
    return res.json();
}

export async function crearVenta(data) {
    const res = await apiPost("/api/ventas", data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al crear venta");
    }
    return res.json();
}

export async function cancelarVenta(id) {
    const res = await apiFetch(`/api/ventas/${id}/cancelar`, { method: "PATCH" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al cancelar venta");
    }
    return res.json();
}

export async function fetchCxcPendientes() {
    const res = await apiGet("/api/ventas/cxc");
    if (!res.ok) throw new Error("Error al cargar CXC");
    return res.json();
}

export async function registrarPagoCxc(idCuenta, data) {
    const res = await apiPost(`/api/ventas/cxc/${idCuenta}/pago`, data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al registrar pago");
    }
    return res.json();
}

export async function fetchComisiones(periodo = null) {
    const q = periodo ? `?periodo=${periodo}` : "";
    const res = await apiGet(`/api/ventas/comisiones${q}`);
    if (!res.ok) throw new Error("Error al cargar comisiones");
    return res.json();
}

export async function fetchMisComisiones(periodo = null) {
    const q = periodo ? `?periodo=${periodo}` : "";
    const res = await apiGet(`/api/ventas/comisiones/mias${q}`);
    if (!res.ok) throw new Error("Error al cargar comisiones");
    return res.json();
}

export async function pagarComision(id) {
    const res = await apiFetch(`/api/ventas/comisiones/${id}/pagar`, {
        method: "PATCH"
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al registrar pago");
    }
}