import { useWatchlist } from "../state/WatchlistContext.jsx";
import { useRatings } from "../state/RatingsContext.jsx";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export default function MediaCard({ item }) {
  const watch = useWatchlist() || {};
  const ratings = useRatings() || {};

  if (!item) return null;

  const {
    id,
    media_type = "movie",
    title,
    name,
    poster_path,
    release_date,
    first_air_date,
    vote_average,
  } = item;

  const displayTitle = title || name || "Unbenannt";
  const date = release_date || first_air_date || "";

  // 🔑 Canonical key used everywhere
  const itemKey = String(item.itemId ?? id);

  // Watchlist state
  const inList = watch.isInList ? watch.isInList(itemKey) : false;

  // Ratings state
  const existingRating = ratings.getRating
    ? ratings.getRating(itemKey)
    : null;

  // --------------------------------------------------
  // Events
  // --------------------------------------------------

  const openDetails = () => {
    window.dispatchEvent(
      new CustomEvent("detail-open", {
        detail: {
          ...item,
          itemId: itemKey,
          id,
          media_type,
          title: displayTitle,
        },
      })
    );
  };

  const openRating = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("rating-open", {
        detail: {
          ...item,
          itemId: itemKey,
          id,
          media_type,
          title: displayTitle,
        },
      })
    );
  };

  const toggleWatchlist = (e) => {
    e.stopPropagation();
    if (!watch.add || !watch.remove) return;

    if (inList) {
      watch.remove(itemKey);
    } else {
      // Pass FULL item – context handles normalization
      watch.add({
        ...item,
        itemId: itemKey,
        id,
        media_type,
        title: displayTitle,
      });
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <article className="card media-card">
  <div className="media-click" onClick={openDetails}>
    {poster_path ? (
      <img className="poster" src={`${IMG_BASE}${poster_path}`} alt={displayTitle} />
    ) : (
      <div className="poster placeholder">Kein Bild</div>
    )}

    <div className="content">
      <h3 className="title">{displayTitle}</h3>

      <div className="meta">
        <span className="pill">{media_type === "tv" ? "SERIES" : "MOVIE"}</span>
        {date && <span>{date}</span>}
        {vote_average != null && <span>★ {vote_average.toFixed(1)}</span>}
      </div>
    </div>
  </div>

  <div className="actions">
    <button className={`btn ${inList ? "" : "primary"}`} onClick={toggleWatchlist}>
      {inList ? "Aus Watchlist entfernen" : "Zur Watchlist"}
    </button>

    <button className="btn ghost" onClick={openRating}>
      {existingRating != null ? `Bewertet: ${existingRating}/5 ⭐` : "Bewerten"}
    </button>
  </div>
</article>

  );
}
