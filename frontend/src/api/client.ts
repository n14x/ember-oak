// On Vercel: /api routes go to Python serverless functions
// Locally: vite proxy forwards /api to localhost:8000
const BASE = "/api";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("eo_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path: string, options: RequestInit = {}) {
  const authHead = authHeaders();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...authHead,
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function createReservation(data: ReservationPayload) {
  return request("/reservations", { method: "POST", body: JSON.stringify(data) });
}

export async function adminLogin(username: string, password: string) {
  const form = new URLSearchParams({ username, password });
  const res = await fetch(`${BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  localStorage.setItem("eo_token", data.access_token);
  return data;
}

export function adminLogout() {
  localStorage.removeItem("eo_token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("eo_token");
}

export async function getReservations(status?: string) {
  const q = status ? `?status=${status}` : "";
  return request(`/admin/reservations${q}`);
}

export async function updateReservation(id: number, data: { status?: string; notes?: string }) {
  return request(`/admin/reservations/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteReservation(id: number) {
  return request(`/admin/reservations/${id}`, { method: "DELETE" });
}

export async function getStats() {
  return request("/admin/stats");
}

export interface ReservationPayload {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
}

export interface Reservation extends ReservationPayload {
  id: number;
  status: string;
  created_at: string;
}