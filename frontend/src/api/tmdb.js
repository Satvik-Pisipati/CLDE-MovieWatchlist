<<<<<<< HEAD
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

export async function searchMulti(query, { language = "de-DE" } = {}) {
  if (!query?.trim()) return [];
  const url = `${BASE}/search/multi?api_key=${API_KEY}&language=${language}&include_adult=false&query=${encodeURIComponent(
    query.trim()
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  const data = await res.json();
  // filter nur movie/tv (Personen raus)
  return (data.results || []).filter((r) => r.media_type === "movie" || r.media_type === "tv");
}

export function posterUrl(path, size = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
=======
const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

/* -------------------------------------------------------
   Fetch wrapper for TMDB API
------------------------------------------------------- */
export async function fetchTMDB(endpoint) {
  const url = `${BASE_URL}/${endpoint}${
    endpoint.includes("?") ? "&" : "?"
  }api_key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`TMDB fetch failed: ${url}`);
    throw new Error(`TMDB error: ${res.status}`);
  }

  return await res.json();
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
  const data = await fetchTMDB(`trending/all/${timeWindow}?language=${language}`);
  return data.results || [];
}

/* -------------------------------------------------------
   Get detailed info for a movie or TV show
------------------------------------------------------- */
export async function getDetails(media_type, id, language = "de-DE") {
  if (!media_type || !id) return null;
  const data = await fetchTMDB(`${media_type}/${id}?language=${language}`);
  return data;
}

/* -------------------------------------------------------
   Get recommendations for a given media item
------------------------------------------------------- */
export async function getRecommendations(media_type, id, language = "de-DE") {
  if (!media_type || !id) return [];
  const data = await fetchTMDB(
    `${media_type}/${id}/recommendations?language=${language}`
  );
  return data.results || [];
}

/* -------------------------------------------------------
   Build recommendations from user watchlist
   (aggregates recs for each saved item)
------------------------------------------------------- */
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

  // De-duplicate by TMDB ID
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
   NEW: Get merged list of genres (Movies + TV)
------------------------------------------------------- */
export async function getGenres(language = "de-DE") {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchTMDB(`genre/movie/list?language=${language}`),
    fetchTMDB(`genre/tv/list?language=${language}`),
  ]);

  // Merge and deduplicate by ID (TMDB reuses many)
  const byId = new Map();
  (movieGenres.genres || []).forEach((g) => byId.set(g.id, g));
  (tvGenres.genres || []).forEach((g) => byId.set(g.id, g));

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/* -------------------------------------------------------
   Utility: Build full TMDB poster URL
------------------------------------------------------- */
export function posterUrl(path, size = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
>>>>>>> 417d2b785d6bb036be53d128afa970f124a95db2
}
