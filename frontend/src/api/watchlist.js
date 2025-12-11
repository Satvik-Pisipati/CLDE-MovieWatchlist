import { apiFetch } from "./client";

export async function loadWatchlist() {
  const data = await apiFetch("/watchlist");
  return data.items || [];
}

export async function saveWatchlistItem(item) {
  return apiFetch("/watchlist", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function deleteWatchlistItem(itemId) {
  return apiFetch(`/watchlist/${itemId}`, {
    method: "DELETE",
  });
}
