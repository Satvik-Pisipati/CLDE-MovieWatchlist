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

  const inList = watch.isInList
    ? watch.isInList(media_type, id)
    : false;

  const existingRating = ratings.getRating
    ? ratings.getRating(media_type, id)
    : null;

  // --- OPEN DETAILS ---
  const openDetails = () => {
    window.dispatchEvent(
      new CustomEvent("detail-open", {
        detail: {
          ...item,
          media_type,
          title: displayTitle,
        },
      })
    );
  };

  // --- OPEN RATING POPUP ---
  const openRating = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("rating-open", {
        detail: {
          ...item,
          media_type,
          title: displayTitle,
        },
      })
    );
  };

  // --- ADD / REMOVE WATCHLIST ---
  const toggleWatchlist = (e) => {
    e.stopPropagation();
    if (!watch.add || !watch.remove) return;

    if (inList) {
      watch.remove(media_type, id);
    } else {
      watch.add({
        ...item,
        media_type,
        title: displayTitle,
      });
    }
  };

  return (
    <article className="card media-card" onClick={openDetails}>
      {/* IMAGE */}
      {poster_path ? (
        <img
          className="poster"
          src={`${IMG_BASE}${poster_path}`}
          alt={displayTitle}
          loading="lazy"
        />
      ) : (
        <div className="poster placeholder">Kein Bild</div>
      )}

      {/* CONTENT */}
      <div className="content">
        <h3 className="title" title={displayTitle}>
          {displayTitle}
        </h3>

        {/* META INFORMATION */}
        <div className="meta">
          <span className="pill">
            {media_type === "tv" ? "SERIES" : "MOVIE"}
          </span>

          {date && <span>{date}</span>}

          {vote_average != null && (
            <span>★ {vote_average.toFixed(1)}</span>
          )}
        </div>

        {/* ACTIONS → vertical stacked buttons */}
        <div
          className="actions"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 8,
          }}
        >
          {/* WATCHLIST BUTTON */}
          <button
            className={`btn ${inList ? "" : "primary"}`}
            onClick={toggleWatchlist}
            style={{ width: "100%" }}
          >
            {inList ? "Aus Watchlist entfernen" : "Zur Watchlist"}
          </button>

          {/* RATING BUTTON */}
          <button
            className="btn ghost"
            onClick={openRating}
            style={{ width: "100%" }}
          >
            {existingRating != null
              ? `Bewertet: ${existingRating}/5 ⭐`
              : "Bewerten"}
          </button>
        </div>
      </div>
    </article>
  );
}
