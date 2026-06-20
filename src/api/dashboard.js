import { apiGet } from "./client.js";

export async function fetchDashboard() {
    const res = await apiGet("/api/dashboard");
    if (!res.ok) throw new Error("Error al cargar el dashboard");
    return res.json();
}