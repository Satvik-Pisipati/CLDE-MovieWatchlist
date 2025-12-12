// src/api/tmdb.js
import { apiFetch } from "./client";

/**
 * Helper used by UI components to build TMDB poster URLs.
 * Works even when poster_path is missing.
 */
export function posterUrl(posterPath, size = "w500") {
  if (!posterPath) return "";
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

/**
 * Generic TMDB proxy call (useful for StatsPage or any custom endpoint)
 */
export async function fetchTMDB(endpoint) {
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data || null;
}

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

export async function searchTMDB(query) {
  const q = (query || "").trim();
  if (!q) return [];

  const endpoint = `search/multi?query=${encodeURIComponent(q)}&language=de-DE`;
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.results || [];
}

export async function recommendationsFromWatchlist(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const first = items[0];

  // we store original TMDB id + media_type in DynamoDB
  const mediaType = first.media_type;
  const id = first.id;

  if (!mediaType || !id) return [];

  const endpoint = `${mediaType}/${id}/recommendations?language=de-DE`;
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data.data?.results || [];
}
