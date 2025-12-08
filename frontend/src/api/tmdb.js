// src/api/tmdb.js

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Build auth headers with Google ID token (if present).
 */
function buildHeaders() {
  let token = null;
  try {
    token = localStorage.getItem("google_id_token");
  } catch {
    token = null;
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["X-Google-ID-Token"] = token;
  } else {
    console.warn("⚠ No Google token found — backend will reject request.");
  }

  return headers;
}

/**
 * Generic TMDB proxy call via backend.
 * `endpoint` is a TMDB path like:
 *   "search/multi?query=..."
 *   "trending/all/week?language=de-DE"
 *   "movie/123?language=de-DE"
 */
export async function fetchTMDB(endpoint) {
  const url = `${BACKEND_URL}/tmdb?endpoint=${encodeURIComponent(endpoint)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error("TMDB proxy returned invalid JSON");
  }

  if (!res.ok || json.ok === false) {
    console.error("❌ TMDB proxy backend error:", json);
    throw new Error(json.error || `TMDB proxy error: ${res.status}`);
  }

  return json.data;
}

/* -------------------------------------------------------
   Search across movies & TV
------------------------------------------------------- */
export async function searchTMDB(query, language = "de-DE") {
  if (!query) return [];
  const data = await fetchTMDB(
    `search/multi?query=${encodeURIComponent(query)}&language=${language}`
  );
  return (
    data.results?.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    ) || []
  );
}

/* -------------------------------------------------------
   Get trending movies/TV
------------------------------------------------------- */
export async function trendingTMDB(language = "de-DE", timeWindow = "week") {
  const data = await fetchTMDB(
    `trending/all/${timeWindow}?language=${language}`
  );
  return data.results || [];
}

/* -------------------------------------------------------
   Get detailed info for a movie or TV show
------------------------------------------------------- */
export async function getDetails(mediaType, id, language = "de-DE") {
  if (!mediaType || !id) return null;
  return await fetchTMDB(`${mediaType}/${id}?language=${language}`);
}

/* -------------------------------------------------------
   Get recommendations for a given media item
------------------------------------------------------- */
export async function getRecommendations(mediaType, id, language = "de-DE") {
  if (!mediaType || !id) return [];
  const data = await fetchTMDB(
    `${mediaType}/${id}/recommendations?language=${language}`
  );
  return data.results || [];
}

/* -------------------------------------------------------
   Aggregate recommendations from user watchlist
------------------------------------------------------- */
export async function recommendationsFromWatchlist(list, language = "de-DE") {
  if (!Array.isArray(list) || list.length === 0) return [];

  const all = [];
  for (const item of list) {
    try {
      const recs = await getRecommendations(
        item.mediaType || item.media_type,
        item.itemId || item.id,
        language
      );
      all.push(...recs);
    } catch (err) {
      console.warn("⚠ Recommendation fetch failed:", err);
    }
  }

  // Remove duplicates
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

/* -------------------------------------------------------
   Get merged genre list (Movies + TV)
------------------------------------------------------- */
export async function getGenres(language = "de-DE") {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchTMDB(`genre/movie/list?language=${language}`),
    fetchTMDB(`genre/tv/list?language=${language}`),
  ]);

  const byId = new Map();
  (movieGenres.genres || []).forEach((g) => byId.set(g.id, g));
  (tvGenres.genres || []).forEach((g) => byId.set(g.id, g));

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/* -------------------------------------------------------
   Utility: Build TMDB poster image URL
------------------------------------------------------- */
export function posterUrl(path, size = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
