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
}
