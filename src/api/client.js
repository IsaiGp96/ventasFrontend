const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

let isRefreshing = false;
let failedQueue = [];

// Procesa la cola de requests que esperaban el refresh
function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
}

// Renovación del access token
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No hay refresh token");

    const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh token inválido o expirado");

    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
}

// Cliente principal con interceptor de 401
export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("accessToken");

    const headers = {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // No fuerza Content-Type en multipart (FormData lo pone automáticamente)
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    let res = await fetch(`${API_URL}${path}`, { ...options, headers });

    // Si no es 401, devuelve la respuesta directamente
    if (res.status !== 401) return res;

    // Es 401 — intentar refresh
    if (isRefreshing) {
        // Otro request ya está haciendo refresh, encolar este
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).then((newToken) => {
            const retryHeaders = {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
            };
            if (!(options.body instanceof FormData)) {
                retryHeaders["Content-Type"] = "application/json";
            }
            return fetch(`${API_URL}${path}`, { ...options, headers: retryHeaders });
        });
    }

    isRefreshing = true;

    try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);

        // Reintenta la petición original con el nuevo token
        const retryHeaders = {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
        };
        if (!(options.body instanceof FormData)) {
            retryHeaders["Content-Type"] = "application/json";
        }
        return fetch(`${API_URL}${path}`, { ...options, headers: retryHeaders });

    } catch (error) {
        processQueue(error, null);
        // Refresh falló — limpiar sesión y disparar evento para cerrar sesión
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("session-expired"));
        throw error;
    } finally {
        isRefreshing = false;
    }
}

// Helpers para usar en los módulos
export function apiGet(path) {
    return apiFetch(path);
}

export function apiPost(path, body) {
    return apiFetch(path, {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
    });
}

export function apiPut(path, body) {
    return apiFetch(path, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export function apiDelete(path) {
    return apiFetch(path, { method: "DELETE" });
}

export function apiPostFile(path, file) {
    const form = new FormData();
    form.append("file", file);
    return apiFetch(path, { method: "POST", body: form });
}

export function apiPatch(url, body) {
    return apiFetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}