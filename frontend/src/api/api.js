// src/api/api.js
import { useAuth } from "../state/AuthContext.jsx";
// Achtung: dieser Hook darf nicht direkt hier benutzt werden.
// Besser: einfache Funktion + token aus localStorage lesen.

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Variante ohne React Hooks, nur mit localStorage:
export async function apiFetch(path, options = {}) {
  const tokenRaw = localStorage.getItem("auth");
  let token = null;
  try {
    token = tokenRaw ? JSON.parse(tokenRaw).token : null;
  } catch {}

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    console.error("API Error:", path, res.status, data);
    throw new Error(`API request failed (${res.status}): ${text}`);
  }

  return data;
}
