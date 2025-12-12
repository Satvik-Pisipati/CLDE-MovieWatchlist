export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("google_id_token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(import.meta.env.VITE_BACKEND_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-google-id-token": token,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || res.statusText);
  }

  return text ? JSON.parse(text) : {};
}
