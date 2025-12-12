// src/pages/MainPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  trendingTMDB,
  searchTMDB,
  recommendationsFromWatchlist,
  posterUrl,
} from "../api/tmdb";
import { useWatchlist } from "../state/WatchlistContext";

export default function MainPage() {
  const { items: watchlist, loaded, toggleWatchlist, isInWatchlist } = useWatchlist();

  const [mode, setMode] = useState("trending"); // trending | search | recs
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load trending by default
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const data = await trendingTMDB();
        if (!cancelled) {
          setResults(data.filter((x) => x && (x.media_type === "movie" || x.media_type === "tv")));
          setMode("trending");
        }
      } catch (e) {
        console.warn("Trending load failed:", e?.message || e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load recommendations whenever watchlist changes
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!loaded) return;
      if (!watchlist.length) {
        setRecs([]);
        return;
      }
      try {
        const data = await recommendationsFromWatchlist(watchlist);
        if (!cancelled) setRecs(data.filter((x) => x && (x.media_type === "movie" || x.media_type === "tv")));
      } catch (e) {
        console.warn("Recommendations failed:", e?.message || e);
        if (!cancelled) setRecs([]);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [watchlist, loaded]);

  const shown = useMemo(() => {
    if (mode === "recs") return recs;
    return results;
  }, [mode, results, recs]);

  async function onSearchSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    try {
      const data = await searchTMDB(q);
      setResults(data.filter((x) => x && (x.media_type === "movie" || x.media_type === "tv")));
      setMode("search");
    } catch (e2) {
      console.warn("Search failed:", e2?.message || e2);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <button onClick={() => setMode("trending")}>Trending</button>
        <button onClick={() => setMode("recs")} disabled={!watchlist.length}>
          Empfehlungen aus Watchlist
        </button>

        <form onSubmit={onSearchSubmit} style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies/series…"
            style={{ padding: 8, minWidth: 280 }}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {loading && <div style={{ opacity: 0.8 }}>Loading…</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {shown.map((item) => {
          const media_type = item.media_type;
          const id = item.id;
          const title = item.title || item.name || "Untitled";
          const inList = isInWatchlist(media_type, id);

          return (
            <div
              key={`${media_type}_${id}`}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ aspectRatio: "2/3", overflow: "hidden", borderRadius: 12, marginBottom: 10 }}>
                {item.poster_path ? (
                  <img
                    src={posterUrl(item.poster_path, "w500")}
                    alt={title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.06)" }} />
                )}
              </div>

              <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ opacity: 0.8, fontSize: 13, marginBottom: 10 }}>
                {media_type?.toUpperCase()} • ⭐ {item.vote_average ?? "-"}
              </div>

              <button onClick={() => toggleWatchlist(item)} style={{ width: "100%" }}>
                {inList ? "Remove from Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
