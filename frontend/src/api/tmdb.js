// src/api/tmdb.js
import { apiFetch } from "./client";

export function posterUrl(path, size = "w500") {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Generic TMDB proxy call through your backend: GET /tmdb?endpoint=...
export async function fetchTMDB(endpoint) {
  const data = await apiFetch(`/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
  return data?.data || {};
}

export async function trendingTMDB() {
  const json = await fetchTMDB("trending/all/week?language=de-DE");
  return json?.results || [];
}

export async function getGenres() {
  const json = await fetchTMDB("genre/movie/list?language=de-DE");
  return json?.genres || [];
}

export async function searchTMDB(query) {
  if (!query?.trim()) return [];
  const q = encodeURIComponent(query.trim());
  const json = await fetchTMDB(`search/multi?query=${q}&language=de-DE`);
  // Filter out "person" so MediaCard doesn’t break
  return (json?.results || []).filter((r) => r.media_type !== "person");
}

export async function recommendationsFromWatchlist(items) {
  if (!items?.length) return [];
  const first = items[0];
  const mediaType = first.media_type || "movie";
  const tmdbId = first.id || first.tmdbId;
  if (!tmdbId) return [];

  const json = await fetchTMDB(
    `${mediaType}/${tmdbId}/recommendations?language=de-DE`
  );
  return json?.results || [];
}
