// src/api/tmdb.js

import { apiFetch } from "./client";

/* -----------------------------------------
   Helpers
------------------------------------------ */

export function posterUrl(path) {
  return path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : null;
}

/* -----------------------------------------
   TMDB: Trending
------------------------------------------ */

export async function trendingTMDB() {
  const endpoint = "trending/all/week?language=de-DE";
  const res = await apiFetch(
    `/tmdb?endpoint=${encodeURIComponent(endpoint)}`
  );

  return res.data?.results ?? [];
}

/* -----------------------------------------
   TMDB: Genres
------------------------------------------ */

export async function getGenres() {
  const endpoint = "genre/movie/list?language=de-DE";
  const res = await apiFetch(
    `/tmdb?endpoint=${encodeURIComponent(endpoint)}`
  );

  return res.data?.genres ?? [];
}

/* -----------------------------------------
   TMDB: Search
------------------------------------------ */

export async function searchTMDB(query) {
  if (!query || !query.trim()) return [];

  const endpoint =
    `search/multi?query=${encodeURIComponent(query)}&language=de-DE`;

  const res = await apiFetch(
    `/tmdb?endpoint=${encodeURIComponent(endpoint)}`
  );

  return res.data?.results ?? [];
}

/* -----------------------------------------
   TMDB: Recommendations from Watchlist
------------------------------------------ */

export async function recommendationsFromWatchlist(watchlist) {
  if (!Array.isArray(watchlist) || watchlist.length === 0) return [];

  const first = watchlist[0];

  if (!first.media_type || !first.id) return [];

  const endpoint =
    `${first.media_type}/${first.id}/recommendations?language=de-DE`;

  const res = await apiFetch(
    `/tmdb?endpoint=${encodeURIComponent(endpoint)}`
  );

  return res.data?.results ?? [];
}