const API_URL = import.meta.env.VITE_API_URL;

export async function login(email, pwd) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pwd }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Credenciales incorrectas");
  }

  return res.json(); // { accessToken, refreshToken, email, name, role }
}

export async function register(nombre, email, pwd) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, pwd }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Error al registrar usuario");
  }

  return res.json();
}

export async function logoutApi() {
  const token = localStorage.getItem("accessToken");
  if (!token) return;
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (_) {
    // Si falla la red, igual limpiamos localStorage en AuthContext
  }
}
// Header para requests autenticadas
export function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}