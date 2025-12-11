export function getGoogleToken() {
  return localStorage.getItem("google_token");
}

export async function apiFetch(path, options = {}) {
  const token = getGoogleToken();

  if (!token) {
    console.warn("Missing Google token, user not logged in.");
  }

  const res = await fetch(import.meta.env.VITE_BACKEND_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-google-id-token": token,
      ...(options.headers || {})
    }
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("API error:", res.status, text);
    throw new Error(text || res.statusText);
  }

  return text ? JSON.parse(text) : {};
}
