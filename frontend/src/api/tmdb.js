import { apiFetch } from "./client";

// Build poster URL
export function posterUrl(path) {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/w500${path}`;
}

// Generic TMDB fetch (StatsPage needs this)
export async function fetchTMDB(endpoint) {
  if (!endpoint) return null;

  const encoded = encodeURIComponent(endpoint);
  const data = await apiFetch(`/tmdb?endpoint=${encoded}`);

  return data.data || null;
}

// Search TMDB
export async function searchTMDB(query) {
  if (!query) return [];

  const endpoint = `search/multi?query=${encodeURIComponent(query)}&language=de-DE`;
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);

  return data.data?.results || [];
}

// Trending lists
export async function trendingTMDB() {
  const endpoint = "trending/all/week?language=de-DE";
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.results || [];
}

// Genre list
export async function getGenres() {
  const endpoint = "genre/movie/list?language=de-DE";
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.genres || [];
}

// Recommendations
export async function recommendationsFromWatchlist(items) {
  if (!items.length) return [];

  const first = items[0];
  const endpoint = `${first.media_type}/${first.id}/recommendations?language=de-DE`;

  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);

  return data.data?.results || [];
}
