import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";

export async function fetchProveedores() {
    const res = await apiGet("/api/proveedores");
    if (!res.ok) throw new Error("Error al cargar proveedores");
    return res.json();
}

export async function fetchProveedor(id) {
    const res = await apiGet(`/api/proveedores/${id}`);
    if (!res.ok) throw new Error("Proveedor no encontrado");
    return res.json();
}

export async function crearProveedor(data) {
    const res = await apiPost("/api/proveedores", data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al crear proveedor");
    }
    return res.json();
}

export async function actualizarProveedor(id, data) {
    const res = await apiPut(`/api/proveedores/${id}`, data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al actualizar proveedor");
    }
    return res.json();
}

export async function eliminarProveedor(id) {
    const res = await apiDelete(`/api/proveedores/${id}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al eliminar proveedor");
    }
}