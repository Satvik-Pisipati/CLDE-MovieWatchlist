import { apiFetch } from "./api";

export async function getRatings() {
  return apiFetch("/user/ratings", {
    method: "GET",
  });
}

export async function rateItem(item, rating) {
  return apiFetch("/user/rate", {
    method: "POST",
    body: JSON.stringify({item, rating}) 
  });
}

export async function removeRating(id) {
  return apiFetch(`/user/rate/${id}`, {
    method: "DELETE",
  });
}
