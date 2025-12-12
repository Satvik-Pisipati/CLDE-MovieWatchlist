// src/api/api.js

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Build auth headers
 */
function buildHeaders() {
  const token = localStorage.getItem("google_id_token");

  return {
    "Content-Type": "application/json",
    ...(token ? { "X-Google-ID-Token": token } : {}),
  };
}

/* -----------------------------------------
   WATCHLIST API
------------------------------------------ */

export async function fetchWatchlist() {
  const res = await fetch(`${VITE_BACKEND_URL}/watchlist`, {
    method: "GET",
    headers: buildHeaders(),
  });

  const json = await res.json();
  if (!json.ok) {
    console.error("Fetch watchlist failed:", json);
    throw new Error(json.error);
  }

  return json.items || [];
}

export async function addToWatchlist(item) {
  const res = await fetch(`${VITE_BACKEND_URL}/watchlist`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(item),
  });

  const json = await res.json();
  if (!json.ok) {
    console.error("Add watchlist failed:", json);
    throw new Error(json.error);
  }

  return json.item;
}

export async function removeFromWatchlist(itemId) {
  const res = await fetch(`${VITE_BACKEND_URL}/watchlist/${encodeURIComponent(
    itemId
  )}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  const json = await res.json();
  if (!json.ok) {
    console.error("Delete watchlist failed:", json);
    throw new Error(json.error);
  }

  return json.deleted;
}
