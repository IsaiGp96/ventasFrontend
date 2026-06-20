import { apiGet, apiFetch } from "./client.js";

export async function fetchPerfil() {
    const res = await apiGet("/api/usuarios/perfil");
    if (!res.ok) throw new Error("Error al cargar perfil");
    return res.json();
}

export async function cambiarPassword(data) {
    const res = await apiFetch("/api/usuarios/perfil/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al cambiar contraseña");
    }
}

export async function fetchUsuarios() {
    const res = await apiGet("/api/usuarios");
    if (!res.ok) throw new Error("Error al cargar usuarios");
    return res.json();
}

export async function crearUsuario(data) {
    const res = await apiFetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al crear usuario");
    }
    return res.json();
}

export async function toggleEstatusUsuario(id) {
    const res = await apiFetch(`/api/usuarios/${id}/estatus`, { method: "PATCH" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al cambiar estatus");
    }
    return res.json();
}

export async function fetchPermisos(id) {
    const res = await apiGet(`/api/usuarios/${id}/permisos`);
    if (!res.ok) throw new Error("Error al cargar permisos");
    return res.json();
}

export async function actualizarPermisos(id, permisos) {
    const res = await apiFetch(`/api/usuarios/${id}/permisos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...permisos]),
    });
    if (!res.ok) throw new Error("Error al actualizar permisos");
}