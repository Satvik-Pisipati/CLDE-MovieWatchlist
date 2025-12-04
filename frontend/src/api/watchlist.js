import { apiFetch } from "./api";

export async function getWatchlist() {
  return apiFetch("/user/watchlist", {
    method: "GET",
  });
}

export async function addToWatchlist(item) {
  return apiFetch("/user/watchlist", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function removeFromWatchlist(id) {
  return apiFetch(`/user/watchlist/${id}`, {
    method: "DELETE",
  });
}
