const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Build auth headers with Google ID token (if present).
 */
function buildHeaders() {
  const token = localStorage.getItem("google_id_token");

  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["X-Google-ID-Token"] = token;
  }

  return headers;
}

/**
 * Generic TMDB proxy call via backend
 */
export async function fetchTMDB(endpoint) {
  const url = `${BACKEND_URL}/tmdb?endpoint=${encodeURIComponent(endpoint)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
  });

  const json = await res.json();

  if (!json.ok) {
    console.error("TMDB proxy backend error:", json);
    throw new Error(json.error || "TMDB proxy failed");
  }

  return json.data;
}

/* ---------------------------------------------
   Search
--------------------------------------------- */
export async function searchTMDB(query, language = "de-DE") {
  if (!query) return [];
  const data = await fetchTMDB(
    `search/multi?query=${encodeURIComponent(query)}&language=${language}`
  );
  return data.results?.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  ) || [];
}

/* ---------------------------------------------
   Trending
--------------------------------------------- */
export async function trendingTMDB(language = "de-DE", timeWindow = "week") {
  const data = await fetchTMDB(
    `trending/all/${timeWindow}?language=${language}`
  );
  return data.results || [];
}

/* ---------------------------------------------
   Details
--------------------------------------------- */
export async function getDetails(media_type, id, language = "de-DE") {
  const data = await fetchTMDB(`${media_type}/${id}?language=${language}`);
  return data;
}

/* ---------------------------------------------
   Recommendations
--------------------------------------------- */
export async function getRecommendations(media_type, id, language = "de-DE") {
  const data = await fetchTMDB(
    `${media_type}/${id}/recommendations?language=${language}`
  );
  return data.results || [];
}

/* ---------------------------------------------
   Watchlist → aggregated recommendations
--------------------------------------------- */
export async function recommendationsFromWatchlist(list, language = "de-DE") {
  if (!Array.isArray(list) || list.length === 0) return [];

  const all = [];

  for (const item of list) {
    try {
      const recs = await getRecommendations(item.media_type, item.id, language);
      all.push(...recs);
    } catch (err) {
      console.warn("Recommendation fetch failed:", err);
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

/* ---------------------------------------------
   Genres
--------------------------------------------- */
export async function getGenres(language = "de-DE") {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchTMDB(`genre/movie/list?language=${language}`),
    fetchTMDB(`genre/tv/list?language=${language}`),
  ]);

  const map = new Map();

  (movieGenres.genres || []).forEach((g) => map.set(g.id, g));
  (tvGenres.genres || []).forEach((g) => map.set(g.id, g));

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/* ---------------------------------------------
   Poster helper
--------------------------------------------- */
export function posterUrl(path, size = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
