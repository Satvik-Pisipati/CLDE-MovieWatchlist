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
  );
}
