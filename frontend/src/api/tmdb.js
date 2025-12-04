// src/api/tmdb.js

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

// Proxy-Fetch über Backend (mit Google-ID-Token)
export async function fetchTMDB(endpoint, token) {
  if (!token) throw new Error("Missing auth token for TMDB request");

  const url = `${BACKEND}/api/tmdb/${endpoint}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("TMDB Proxy failed: " + res.status);
  }

  return await res.json();
}

// SEARCH
export async function searchTMDB(query, token, language = "de-DE") {
  if (!query) return [];
  const data = await fetchTMDB(
    `search/multi?query=${encodeURIComponent(query)}&language=${language}`,
    token
  );
  return (
    data.results?.filter(
      (i) => i.media_type === "movie" || i.media_type === "tv"
    ) || []
  );
}

// TRENDING
export async function trendingTMDB(token, language = "de-DE") {
  const data = await fetchTMDB(
    `trending/all/week?language=${language}`,
    token
  );
  return data.results || [];
}

// DETAILS
export async function getDetails(media_type, id, token, language = "de-DE") {
  if (!media_type || !id) return null;
  return await fetchTMDB(`${media_type}/${id}?language=${language}`, token);
}

// RECOMMENDATIONS
export async function getRecommendations(
  media_type,
  id,
  token,
  language = "de-DE"
) {
  const data = await fetchTMDB(
    `${media_type}/${id}/recommendations?language=${language}`,
    token
  );
  return data.results || [];
}

// BUILD RECOMMENDATIONS FROM WATCHLIST
export async function recommendationsFromWatchlist(list, token) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const all = [];
  for (const item of list) {
    try {
      const recs = await getRecommendations(
        item.media_type,
        item.id,
        token
      );
      all.push(...recs);
    } catch (err) {
      console.warn("Recommendation fetch failed:", err);
    }
  }

  const unique = [];
  const seen = new Set();
  for (const r of all) {
    const key = `${r.media_type}-${r.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }
  return unique;
}

// GENRES
export async function getGenres(token, language = "de-DE") {
  const [movie, tv] = await Promise.all([
    fetchTMDB(`genre/movie/list?language=${language}`, token),
    fetchTMDB(`genre/tv/list?language=${language}`, token),
  ]);
  const map = new Map();
  movie.genres?.forEach((g) => map.set(g.id, g));
  tv.genres?.forEach((g) => map.set(g.id, g));
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function posterUrl(path, size = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
