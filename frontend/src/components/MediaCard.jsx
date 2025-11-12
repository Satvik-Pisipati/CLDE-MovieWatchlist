import { posterUrl } from "../api/tmdb";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import "../css/theme.css";

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
    release_date: item.release_date,
    first_air_date: item.first_air_date,
  };

  const toggle = () => {
    if (inList) remove(media_type, id);
    else add(entry);
  };

  return (
    <div className="media-card card" role="group" aria-label={title}>
      <div className="poster-wrap" onClick={()=>window.dispatchEvent(new CustomEvent("detail-open",{detail:item}))} style={{cursor:"pointer"}}>
        {poster ? (
          <img src={poster} alt={title} className="poster" loading="lazy" />
        ) : (
          <div className="poster placeholder">No Image</div>
        )}
      </div>

      <div className="content">
        <h3 className="title" onClick={()=>window.dispatchEvent(new CustomEvent("detail-open",{detail:item}))} style={{cursor:"pointer"}}>{title}</h3>
        <div className="meta">
          <span className="pill">{(media_type || "").toUpperCase()}</span>
          {date && <span className="date">{date}</span>}
        </div>

        <div className="actions">
          <button
            onClick={toggle}
            className={"btn " + (inList ? "danger" : "primary")}
            aria-pressed={inList}
          >
            {inList ? "Aus Watchlist entfernen" : "Zur Watchlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
