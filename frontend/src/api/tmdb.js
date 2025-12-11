import { apiFetch } from "./client";

// Image helper — REQUIRED
export function posterUrl(path) {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/w500${path}`;
}

// TMDB: Trending Movies
export async function trendingTMDB() {
  const endpoint = "trending/all/week?language=de-DE";
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.results || [];
}

// TMDB: Genres
export async function getGenres() {
  const endpoint = "genre/movie/list?language=de-DE";
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.genres || [];
}

// TMDB: Recommendations
export async function recommendationsFromWatchlist(items) {
  if (!items.length) return [];

  const first = items[0];
  const endpoint = `${first.media_type}/${first.id}/recommendations?language=de-DE`;

  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.results || [];
}
