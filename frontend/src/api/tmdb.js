import { apiFetch } from "./client";

export async function trendingTMDB() {
  const endpoint = "trending/all/week?language=de-DE";
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.results || [];
}

export async function getGenres() {
  const endpoint = "genre/movie/list?language=de-DE";
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.genres || [];
}

export async function recommendationsFromWatchlist(items) {
  if (!items.length) return [];

  const first = items[0];
  const endpoint = `${first.media_type}/${first.id}/recommendations?language=de-DE`;

  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.results || [];
}
