import { apiFetch } from "./api";

export async function getRatings() {
  return apiFetch("/user/ratings", {
    method: "GET",
  });
}

export async function rateItem(item, rating) {
  return apiFetch("/user/rate", {
    method: "POST",
    body: JSON.stringify({
      id: item.id,
      media_type: item.media_type,
      rating,
      title: item.title || item.name || "",
      poster_path: item.poster_path || null,
    }),
  });
}

export async function removeRating(id) {
  return apiFetch(`/user/rate/${id}`, {
    method: "DELETE",
  });
}
