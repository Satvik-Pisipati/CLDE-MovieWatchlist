import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import MediaCard from "../components/MediaCard";

export default function WatchlistPage({ user }) {
  const navigate = useNavigate();
  const { items } = useWatchlist();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Watchlist</h1>
        <Link to="/home" style={{ fontWeight: 700, textDecoration: "none" }}>
          Zur Suche
        </Link>
      </header>

      {items.length === 0 ? (
        <div style={{ color: "#6b7280" }}>
          Deine Watchlist ist leer. Füge Titel über die Suche hinzu.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16
          }}
        >
          {items.map((it) => (
            <MediaCard key={`${it.media_type}-${it.id}`} item={{
              id: it.id,
              media_type: it.media_type,
              title: it.title, // für movie compat
              name: it.title,  // für tv compat
              poster_path: it.poster_path,
              release_date: it.release_date,
              overview: it.overview
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
