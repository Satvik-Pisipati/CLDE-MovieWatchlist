import { useEffect, useRef } from "react";
import { posterUrl } from "../api/tmdb";

export default function DetailsModal({ item, onClose, onToggleList, inList }){
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if(!item) return null;
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date || "";
  const poster = posterUrl(item.poster_path, "w342");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" ref={ref} onClick={(e)=>e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-media">
            {poster ? <img src={poster} alt={title} /> : <div className="poster placeholder">No Image</div>}
          </div>
          <div className="modal-content">
            <div className="meta-line">
              <span className="pill">{(item.media_type||"").toUpperCase()}</span>
              {date && <span className="date">{date}</span>}
              {item.vote_average ? <span className="rating">⭐ {item.vote_average.toFixed(1)}</span> : null}
            </div>
            {item.overview ? <p className="overview">{item.overview}</p> : <p className="overview muted">No overview available.</p>}
            <div className="actions-row">
              <button className={"btn " + (inList ? "danger" : "primary")} onClick={onToggleList}>
                {inList ? "Aus Watchlist entfernen" : "Zur Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
