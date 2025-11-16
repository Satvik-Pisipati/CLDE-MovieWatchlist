import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import MediaCard from "../components/MediaCard";
import { useRatings } from "../state/RatingsContext.jsx";

export default function WatchlistPage({ user }) {
  const navigate = useNavigate();
  const { items } = useWatchlist();
  const { hasAny } = useRatings();

  useEffect(() => {
    const onOpen = (e) => setOpen(e.detail);
    window.addEventListener("detail-open", onOpen);
    return () => window.removeEventListener("detail-open", onOpen);
  }, []);

  const inList =
    open && typeof isInList === "function"
      ? isInList(open.media_type, open.id)
      : false;

  const toggle = () => {
    if (!open || !add || !remove) return;
    if (inList) {
      remove(open.media_type, open.id);
    } else {
      // store the full object so popup from watchlist has overview, etc.
      add({
        ...open,
        title: open.title || open.name,
      });
    }
  };

  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
        color: "#111827",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0 }}>Meine Watchlist</h2>
        <div style={{ display: "flex", gap: 16 }}>
          <Link to="/home" style={{ color: "#2563eb", textDecoration: "none" }}>
            Zur Suche
          </Link>
          {hasAny && (
            <Link to="/ratings" style={{ color: "#2563eb", textDecoration: "none" }}>
              Meine Bewertungen
            </Link>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            marginTop: 12,
            color: "#6b7280",
            border: "1px dashed #e5e7eb",
            padding: 16,
            borderRadius: 12,
            background: "#fff",
          }}
        >
          Deine Watchlist ist leer. Füge Titel über die Suche hinzu.
        </div>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((it) => (
            <MediaCard
              key={`${it.media_type}-${it.id}`}
              item={{
                id: it.id,
                media_type: it.media_type,
                title: it.title, // für movie compat
                name: it.title, // für tv compat
                poster_path: it.poster_path,
                release_date: it.release_date,
                overview: it.overview,
              }}
              showRate
            />
          ))}
        </div>
      )}
    </div>
  );
}
