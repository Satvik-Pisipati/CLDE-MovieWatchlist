const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Google-ID-Token": localStorage.getItem("google_id_token"),
  };
}

export async function getWatchlist() {
  const res = await fetch(`${BACKEND_URL}/watchlist`, {
    method: "GET",
    headers: authHeaders(),
  });
  return (await res.json()).items || [];
}

export async function addToWatchlist(item) {
  const res = await fetch(`${BACKEND_URL}/watchlist`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(item),
  });
  return await res.json();
}

export async function deleteFromWatchlist(itemId) {
  const res = await fetch(`${BACKEND_URL}/watchlist/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return await res.json();
}