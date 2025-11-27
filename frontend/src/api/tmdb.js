// src/api/tmdb.js

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Low-level Fetch gegen unser Backend-Proxy:
 *   GET /api/tmdb/<endpoint>
 *   z.B. endpoint = "search/multi?query=..."
 *
 * Erwartet einen gültigen Google-ID-Token im Header.
 */
async function fetchTMDB(endpoint, token) {
  if (!token) {
    throw new Error("Missing auth token for TMDB request");
  }

  const url = `${BACKEND}/api/tmdb/${endpoint}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`TMDB proxy fetch failed: ${url}`, res.status);
    throw new Error(`TMDB proxy error: ${res.status}`);
  }

  return await res.json();
}

/* -------------------------------------------------------
   Search across movies & TV
------------------------------------------------------- */
export async function searchTMDB(query, language = "de-DE", token) {
  if (!query) return [];
  const data = await fetchTMDB(
    `search/multi?query=${encodeURIComponent(query)}&language=${language}`,
    token
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
export async function trendingTMDB(language = "de-DE", timeWindow = "week", token) {
  const data = await fetchTMDB(
    `trending/all/${timeWindow}?language=${language}`,
    token
  );
  return data.results || [];
}

/* -------------------------------------------------------
   Get detailed info for a movie or TV show
------------------------------------------------------- */
export async function getDetails(media_type, id, language = "de-DE", token) {
  if (!media_type || !id) return null;
  const data = await fetchTMDB(
    `${media_type}/${id}?language=${language}`,
    token
  );
  return data;
}

/* -------------------------------------------------------
   Get recommendations for a given media item
------------------------------------------------------- */
export async function getRecommendations(
  media_type,
  id,
  language = "de-DE",
  token
) {
  if (!media_type || !id) return [];
  const data = await fetchTMDB(
    `${media_type}/${id}/recommendations?language=${language}`,
    token
  );
  return data.results || [];
}

/* -------------------------------------------------------
   Build recommendations from user watchlist
------------------------------------------------------- */
export async function recommendationsFromWatchlist(
  list,
  language = "de-DE",
  token
) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const all = [];
  for (const item of list) {
    try {
      const recs = await getRecommendations(
        item.media_type,
        item.id,
        language,
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

/* -------------------------------------------------------
   NEW: Get merged list of genres (Movies + TV)
------------------------------------------------------- */
export async function getGenres(language = "de-DE", token) {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchTMDB(`genre/movie/list?language=${language}`, token),
    fetchTMDB(`genre/tv/list?language=${language}`, token),
  ]);

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
}
