const API_URL = import.meta.env.VITE_API_URL ?? "http:/localhost:8080";
import { apiGet, apiPost, apiPut, apiDelete, apiPostFile } from "./client.js";

export function authHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

export function authHeaderMultipart() {
    const token = localStorage.getItem("accessToken");
    return { "Authorization": `Bearer ${token}` };
}

// ─── Catálogos ────────────────────────────────────────────────────────────────

export async function fetchTipos() {
    const res = await apiGet("/api/productos/tipos");
    if (!res.ok) throw new Error("Error al cargar tipos");
    return res.json();
}

// ─── Categorias ────────────────────────────────────────────────────────────────

export async function fetchCategorias() {
    const res = await apiGet("/api/productos/categorias");
    if (!res.ok) throw new Error("Error al cargar categorías");
    return res.json();
}

// ─── Productos ────────────────────────────────────────────────────────────────

export async function fetchProductos() {
    const res = await apiGet("/api/productos");
    if (!res.ok) throw new Error("Error al cargar productos");
    return res.json();
}

export async function fetchProducto(id) {
    const res = await apiGet(`/api/productos/${id}`);
    if (!res.ok) throw new Error("Producto no encontrado");
    return res.json();
}

export async function crearProducto(data) {
    const res = await apiPost("/api/productos", data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al crear producto");
    }
    return res.json();
}

export async function actualizarProducto(id, data) {
    const res = await apiPut(`/api/productos/${id}`, data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al actualizar producto");
    }
    return res.json();
}

export async function desactivarProducto(id) {
    const res = await apiDelete(`/api/productos/${id}`);
    if (!res.ok) throw new Error("Error al desactivar producto");
}

// ─── Imágenes ─────────────────────────────────────────────────────────────────

export async function subirImagenProducto(id, file) {
    const res = await apiPostFile(`/api/productos/${id}/imagen`, file);
    if (!res.ok) throw new Error("Error al subir imagen");
    return res.json();
}

export async function subirImagenVariante(id, file) {
    console.log("subirImagenVariante id:", id, "file:", file, "file name:", file?.name);
    const res = await apiPostFile(`/api/productos/variantes/${id}/imagen`, file);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al subir imagen");
    }
    return res.json();
}

// ─── Variantes ────────────────────────────────────────────────────────────────

export async function desactivarVariante(id) {
    const res = await apiDelete(`/api/productos/variantes/${id}`);
    if (!res.ok) throw new Error("Error al desactivar variante");
}

export async function agregarVariante(idProducto, data) {
    const res = await apiPost(`/api/productos/${idProducto}/variantes`, data);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al crear variante");
    }
    return res.json();
}