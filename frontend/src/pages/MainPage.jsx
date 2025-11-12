import { useEffect, useMemo, useState } from "react";
import MediaCard from "../components/MediaCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import {
  searchTMDB,
  trendingTMDB,
  recommendationsFromWatchlist,
  getGenres,
} from "../api/tmdb.js";
import { useWatchlist } from "../state/WatchlistContext.jsx";

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
  const { list, add, remove, isInList } = useWatchlist();

  // --- Load trending + categories initially ---
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

  // --- Generate suggestions based on watchlist ---
  useEffect(() => {
    (async () => {
      if (!list || list.length === 0) {
        setSuggestions([]);
        return;
      }
      const recs = await recommendationsFromWatchlist(list);
      setSuggestions(recs);
    })();
  }, [list]);

  // --- Live search (debounced) ---
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await searchTMDB(q);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  // --- Handle search submit ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
    }
  };

  // --- Computed lists ---
  const showingResults = results.length > 0 && query.trim().length > 0;
  const baseList = showingResults ? results : trending;

  const visible = useMemo(() => {
    let filtered = baseList;

    // Type filter
    if (type !== "all") {
      filtered = filtered.filter((i) => i.media_type === type);
    }

    // Category filter
    if (category !== "all") {
      const cid = Number(category);
      filtered = filtered.filter(
        (i) => Array.isArray(i.genre_ids) && i.genre_ids.includes(cid)
      );
    }

    // Sorting
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

  // --- Modal open handler ---
  useEffect(() => {
    const onOpen = (e) => setOpen(e.detail);
    window.addEventListener("detail-open", onOpen);
    return () => window.removeEventListener("detail-open", onOpen);
  }, []);

  const inList = open ? isInList(open.media_type, open.id) : false;
  const toggle = () => {
    if (!open) return;
    if (inList) remove(open.media_type, open.id);
    else
      add({
        id: open.id,
        media_type: open.media_type,
        title: open.title || open.name,
        poster_path: open.poster_path,
        release_date: open.release_date,
        first_air_date: open.first_air_date,
        popularity: open.popularity,
      });
  };

  return (
    <div className="main-page">
      <div className="container">
        {/* --- Hero Section --- */}
        <section className="search-hero card page-wrap" style={{ marginTop: "1rem" }}>
          <h1 className="hero-brand">MovieWatchlist 🎬</h1>
          <h2 className="hero-title">Find your next movie or show</h2>
          <p className="hero-sub">Search across movies, series, and more.</p>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              className="input"
              placeholder="Search for a title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn primary">
              Search
            </button>
          </form>
        </section>

        {/* --- Suggestions --- */}
        {!showingResults && suggestions.length > 0 && (
          <section className="results page-wrap">
            <h3 className="section-title">Suggestions from your Watchlist</h3>
            <p className="section-sub">Because you liked items in your list.</p>
            <div className="media-grid">
              {suggestions.map((item) => (
                <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* --- Filter Bar & Results --- */}
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

          {/* "Trending Now" or "Search Results" header BELOW filters */}
          <h3 className="section-title" style={{ marginTop: "12px" }}>
            {showingResults ? "Search Results" : "Trending Now"}
          </h3>

          <div className="media-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : visible.map((item) => (
                  <MediaCard
                    key={`${item.media_type}-${item.id}`}
                    item={item}
                  />
                ))}
          </div>

          {!loading && visible.length === 0 && (
            <p className="empty-state">No items to show.</p>
          )}
        </section>
      </div>

      <DetailsModal
        item={open}
        onClose={() => setOpen(null)}
        onToggleList={toggle}
        inList={inList}
      />
    </div>
  );
}
