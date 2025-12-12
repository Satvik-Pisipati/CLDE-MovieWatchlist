// src/api/client.js
import { getStoredGoogleIdToken } from "../state/AuthContext.jsx";

const BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_BACKEND_URL ||
  "";

function joinUrl(base, path) {
  if (!base) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function apiFetch(path, options = {}) {
  const token = getStoredGoogleIdToken();

  // Your Lambda currently requires the token for *all* routes (even /tmdb).
  if (!token) {
    throw new Error("Missing Google ID token");
  }

  const res = await fetch(joinUrl(BASE, path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-google-id-token": token,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // keep as {}
  }

  if (!res.ok) {
    // backend often returns { ok:false, error:"..." }
    const msg = data?.error || data?.message || text || res.statusText;
    throw new Error(msg);
  }

  return data;
}
