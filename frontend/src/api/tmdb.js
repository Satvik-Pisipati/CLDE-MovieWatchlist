import { apiFetch } from "./api";

const TMDB_BASE = "/api/tmdb";

export async function fetchTMDB(endpoint) {
  return apiFetch(`${TMDB_BASE}/${endpoint}`);
}

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

export async function trendingTMDB(language = "de-DE", timeWindow = "week") {
  const data = await fetchTMDB(`trending/all/${timeWindow}?language=${language}`);
  return data.results || [];
}

export async function getDetails(media_type, id, language = "de-DE") {
  if (!media_type || !id) return null;
  return fetchTMDB(`${media_type}/${id}?language=${language}`);
}

export async function getRecommendations(media_type, id, language = "de-DE") {
  if (!media_type || !id) return [];
  const data = await fetchTMDB(
    `${media_type}/${id}/recommendations?language=${language}`
  );
  return data.results || [];
}

export async function getGenres(language = "de-DE") {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchTMDB(`genre/movie/list?language=${language}`),
    fetchTMDB(`genre/tv/list?language=${language}`),
  ]);

  const byId = new Map();
  movieGenres.genres?.forEach((g) => byId.set(g.id, g));
  tvGenres.genres?.forEach((g) => byId.set(g.id, g));

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function recommendationsFromWatchlist(list, language = "de-DE") {
  if (!Array.isArray(list) || list.length === 0) return [];

  const all = [];

  for (const item of list) {
    if (!item.media_type || !item.id) continue;
    try {
      const recs = await getRecommendations(item.media_type, item.id, language);
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

export function posterUrl(path, size = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
