import { useEffect, useRef } from "react";
import { posterUrl } from "../api/tmdb";

export default function DetailsModal({ item, onClose, onToggleList, inList }) {
  const ref = useRef(null);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!item) return null;

  const title = item.title || item.name || "Unbenannt";

  return (
    <div className="modal-overlay">
      <div className="modal" ref={ref}>
        {/* Close */}
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Schliessen"
        >
          ✖
        </button>

        <div className="modal-body">
          {/* Poster */}
          <div className="modal-media">
            {item.poster_path ? (
              <img
                src={posterUrl(item.poster_path)}
                alt={title}
                loading="lazy"
              />
            ) : (
              <div className="poster placeholder">Kein Bild</div>
            )}
          </div>

          {/* Content */}
          <div className="modal-content">
            <h2>{title}</h2>

            {item.overview ? (
              <p>{item.overview}</p>
            ) : (
              <p style={{ opacity: 0.7 }}>
                Keine Beschreibung verfügbar.
              </p>
            )}

            <div style={{ marginTop: "1rem" }}>
              <button className="btn primary" onClick={onToggleList}>
                {inList
                  ? "Aus Watchlist entfernen"
                  : "Zur Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
