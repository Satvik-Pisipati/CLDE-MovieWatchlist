import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import { useRatings } from "../state/RatingsContext.jsx";
import MediaCard from "../components/MediaCard.jsx";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { items, list } = useWatchlist();
  const { hasAny } = useRatings();

  // Fallback: manche Versionen benutzen items, andere list
  const entries =
    Array.isArray(items) && items.length > 0
      ? items
      : Array.isArray(list)
        ? list
        : [];

  // Redirect falls nicht eingeloggt (AuthContext übernimmt das normalerweise,
  // aber du hast im alten Code den user Prop verwendet)
  useEffect(() => {
    // Wenn AuthContext genutzt wird: dort prüfen, nicht hier
    // Diese Zeile kann raus, falls RequireLogin bereits greift
  }, []);

  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
        color: "#111827"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline"
        }}
      >
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

      {entries.length === 0 ? (
        <div
          style={{
            marginTop: 12,
            color: "#6b7280",
            border: "1px dashed #e5e7eb",
            padding: 16,
            borderRadius: 12,
            background: "#fff"
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
            gap: 16
          }}
        >
          {entries.map((it) => (
            <MediaCard
              key={`${it.media_type}-${it.id}`}
              item={{
                id: it.id,
                media_type: it.media_type,
                title: it.title,
                name: it.title || it.name,
                poster_path: it.poster_path,
                release_date: it.release_date,
                first_air_date: it.first_air_date,
                overview: it.overview
              }}
              showRate
            />
          ))}
        </div>
      )}
    </div>
  );
}
