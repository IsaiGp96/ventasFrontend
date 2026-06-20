import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";

export async function fetchClientes(tipo = null) {
    const query = tipo ? `?tipo=${tipo}` : "";
    const res = await apiGet(`/api/clientes${query}`);
    if (!res.ok) throw new Error("Error al cargar clientes");
    return res.json();
}

export async function fetchCliente(id) {
    const res = await apiGet(`/api/clientes/${id}`);
    if (!res.ok) throw new Error("Cliente no encontrado");
    return res.json();
}

export async function crearCliente(data) {
    const res = await apiPost("/api/clientes", data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al crear cliente");
    }
    return res.json();
}

export async function actualizarCliente(id, data) {
    const res = await apiPut(`/api/clientes/${id}`, data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al actualizar cliente");
    }
    return res.json();
}

export async function desactivarCliente(id) {
    const res = await apiDelete(`/api/clientes/${id}`);
    if (!res.ok) throw new Error("Error al desactivar cliente");
}