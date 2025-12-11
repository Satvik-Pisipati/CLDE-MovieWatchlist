import { useEffect, useRef } from "react";
import { posterUrl } from "../api/tmdb";

export default function DetailsModal({ item, onClose, onToggleList, inList }) {
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal" ref={ref}>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        {/* Poster */}
        <img
          className="modal-poster"
          src={posterUrl(item.poster_path)}
          alt={item.title || item.name}
        />

        {/* Title */}
        <h2>{item.title || item.name}</h2>

        {/* Info */}
        <p>{item.overview}</p>

        {/* Add / Remove Watchlist */}
        <button className="btn primary" onClick={onToggleList}>
          {inList ? "Remove from Watchlist" : "Add to Watchlist"}
        </button>
      </div>
    </div>
  );
}
