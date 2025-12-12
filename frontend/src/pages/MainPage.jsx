import { useEffect, useMemo, useState } from "react";
import MediaCard from "../components/MediaCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import RatingModal from "../components/RatingModal.jsx";

import {
  searchTMDB,
  trendingTMDB,
  recommendationsFromWatchlist,
  getGenres,
} from "../api/tmdb.js";

import { useWatchlist } from "../state/WatchlistContext.jsx";
import { useRatings } from "../state/RatingsContext.jsx";

export default function MainPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState("popularity");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  const [open, setOpen] = useState(null);

  const { items: list, add, remove, isInList } = useWatchlist();
  const { ratings } = useRatings() || { ratings: [] };

  const TRENDING_LIMIT = 10;
  const SUGGEST_LIMIT = 10;

  // Load trending + genres
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [trend, gens] = await Promise.all([trendingTMDB(), getGenres()]);
        setTrending(trend);
        setCategories(gens);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Suggestions based on watchlist + ratings
  useEffect(() => {
    (async () => {
      const base = [...(list || []), ...(ratings || [])];
      if (base.length === 0 || query.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const recs = await recommendationsFromWatchlist(base);
        setSuggestions(recs || []);
      } catch {
        setSuggestions([]);
      }
    })();
  }, [list, ratings, query]);

  // Live search debounce
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchTMDB(q);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const showingResults = results.length > 0 && query.trim().length > 0;
  const baseList = showingResults ? results : trending;

  const visible = useMemo(() => {
    let filtered = baseList;

    if (type !== "all") {
      filtered = filtered.filter((i) => i.media_type === type);
    }

    if (category !== "all") {
      const cid = Number(category);
      filtered = filtered.filter(
        (i) => Array.isArray(i.genre_ids) && i.genre_ids.includes(cid)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "title")
        return (a.title || a.name || "").localeCompare(b.title || b.name || "");
      if (sort === "date")
        return (
          new Date(b.release_date || b.first_air_date || 0) -
          new Date(a.release_date || a.first_air_date || 0)
        );
      if (sort === "rating")
        return (b.vote_average || 0) - (a.vote_average || 0);
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return sorted;
  }, [baseList, sort, type, category]);

  // Details modal open (your app uses this event pattern)
  useEffect(() => {
    const onOpen = (e) => setOpen(e.detail);
    window.addEventListener("detail-open", onOpen);
    return () => window.removeEventListener("detail-open", onOpen);
  }, []);

  const inList = open ? isInList(open.media_type, open.id) : false;

  const toggle = () => {
    if (!open) return;
    if (inList) remove(open.media_type, open.id);
    else add({ ...open, title: open.title || open.name });
  };

  return (
    <div className="main-page">
      <div className="container">
        {/* Hero + Search */}
        <section className="search-hero card page-wrap" style={{ marginTop: "1rem" }}>
          <h1 className="hero-brand">MovieWatchlist 🎬</h1>
          <h2 className="hero-title">Find your next movie or show</h2>
          <p className="hero-sub">Search across movies, series, and more.</p>

          <form onSubmit={(e) => e.preventDefault()} className="search-form">
            <input
              className="input"
              placeholder="Search for a title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="btn primary">
              Search
            </button>
          </form>
        </section>

        {/* Filters + Main Grid */}
        <section className="results page-wrap">
          <FiltersBar
            sort={sort}
            setSort={setSort}
            type={type}
            setType={setType}
            category={category}
            setCategory={setCategory}
            categories={categories}
          />

          <h3 className="section-title" style={{ marginTop: "12px" }}>
            {showingResults ? "Suchergebnisse" : "Trending Now"}
          </h3>

          <div className="media-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
              : (showingResults ? visible : visible.slice(0, TRENDING_LIMIT)).map((item) => (
                  <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
                ))}
          </div>

          {!loading && showingResults && visible.length === 0 && (
            <p className="empty-state">Keine Ergebnisse.</p>
          )}
        </section>

        {/* Recommendations BELOW trending (only when not searching) */}
        {!showingResults && suggestions.length > 0 && (
          <section className="results page-wrap">
            <h3 className="section-title">Empfehlungen aus deiner Watchlist / Bewertungen</h3>
            <p className="section-sub">Basierend auf deinen Listen und Bewertungen.</p>

            <div className="media-grid">
              {suggestions.slice(0, SUGGEST_LIMIT).map((item) => (
                <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <DetailsModal item={open} onClose={() => setOpen(null)} onToggleList={toggle} inList={inList} />
      <RatingModal />
    </div>
  );
}
