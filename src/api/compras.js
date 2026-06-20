
import { apiGet, apiPost, apiDelete, apiFetch } from "./client.js";

export async function fetchOrdenes() {
    const res = await apiGet("/api/compras");
    if (!res.ok) throw new Error("Error al cargar órdenes");
    return res.json();
}

export async function fetchOrden(id) {
    const res = await apiGet(`/api/compras/${id}`);
    if (!res.ok) throw new Error("Orden no encontrada");
    return res.json();
}

export async function crearOrden(data) {
    const res = await apiPost("/api/compras", data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al crear la orden");
    }
    return res.json();
}

export async function recibirOrden(id) {
    const res = await apiFetch(`/api/compras/${id}/recibir`, { method: "PATCH" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al recibir la orden");
    }
    return res.json();
}

export async function cancelarOrden(id) {
    const res = await apiFetch(`/api/compras/${id}/cancelar`, { method: "PATCH" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al cancelar la orden");
    }
    return res.json();
}

export async function confirmarOrden(id) {
    const res = await apiFetch(`/api/compras/${id}/confirmar`, { method: "PATCH" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al confirmar la orden");
    }
    return res.json();
}

export async function eliminarOrden(id) {
    const res = await apiFetch(`/api/compras/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al eliminar la orden");
    }
}