import React from "react";
import { posterUrl } from "../api/tmdb";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import { useRatings } from "../state/RatingsContext.jsx";
import RateModal from "./RateModal.jsx";

export default function MediaCard({ item, showRate = false }) {
  const { add, remove, isInList } = useWatchlist();
  const { get } = useRatings();
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
    release_date: item.release_date,
    overview: item.overview,
  };

  const [open, setOpen] = React.useState(false);
  const rated = get(media_type, id);
  const stars = rated ? "★".repeat(rated.rating) + "☆".repeat(5 - rated.rating) : null;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
        background: "white",
        display: "flex",
        gap: 12,
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 90,
          height: 135,
          background: "#f3f4f6",
          borderRadius: 8,
          overflow: "hidden",
          flex: "0 0 auto",
        }}
      >
        {poster ? (
          <img
            src={poster}
            alt="Poster"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ color: "#6b7280", fontSize: 14, marginTop: 2 }}>
          {media_type === "movie" ? "Movie" : "Serie"}{" "}
          {date ? `· ${date.slice(0, 4)}` : ""}
        </div>

        {stars && <div style={{ marginTop: 8, fontSize: 18 }}>{stars}</div>}

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => (inList ? remove(media_type, id) : add(entry))}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: inList ? "#fee2e2" : "#ecfeff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {inList ? "Aus Watchlist entfernen" : "Zur Watchlist"}
          </button>

          {inList && showRate && (
            <button
              onClick={() => setOpen(true)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#ecfeff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Titel bewerten
            </button>
          )}
        </div>
      </div>

      {showRate && (
        <RateModal
          open={open}
          onClose={() => setOpen(false)}
          media={{ ...entry, name: title, title }}
        />
      )}
    </div>
  );
}
