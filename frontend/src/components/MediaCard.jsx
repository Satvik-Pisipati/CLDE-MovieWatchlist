<<<<<<< HEAD
import { posterUrl } from "../api/tmdb";
import { useWatchlist } from "../state/WatchlistContext.jsx";

export default function MediaCard({ item }) {
  const { add, remove, isInList } = useWatchlist();
  const media_type = item.media_type; // "movie" | "tv"
  const id = item.id;
  const title = media_type === "movie" ? item.title : item.name;
  const date = item.release_date || item.first_air_date || "";
  const poster = posterUrl(item.poster_path, "w342");
  const inList = isInList(media_type, id);

  const entry = {
    id,
    media_type,
    title,
    poster_path: item.poster_path,
    release_date: date,
    overview: item.overview,
  };

  return (
    <div style={{
      width: 220,
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: "#fff"
    }}>
      <div style={{ width: "100%", height: 330, background: "#f3f4f6" }}>
        {poster ? (
          <img src={poster} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ padding: 16, color: "#6b7280" }}>Kein Poster</div>
        )}
      </div>
      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: "18px" }} title={title}>{title}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 11,
            background: "#eef2ff",
            color: "#3730a3",
            borderRadius: 999,
            padding: "2px 8px",
            textTransform: "uppercase"
          }}>{media_type}</span>
          {date ? <span style={{ fontSize: 12, color: "#6b7280" }}>{date}</span> : null}
        </div>
        <button
          onClick={() => (inList ? remove(media_type, id) : add(entry))}
          style={{
            marginTop: 4,
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: inList ? "#fee2e2" : "#ecfeff",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          {inList ? "Aus Watchlist entfernen" : "Zur Watchlist"}
        </button>
      </div>
    </div>
=======
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
>>>>>>> 417d2b785d6bb036be53d128afa970f124a95db2
  );
}
