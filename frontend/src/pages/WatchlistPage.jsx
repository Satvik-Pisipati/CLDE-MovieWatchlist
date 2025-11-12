import { Link } from "react-router-dom";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import MediaCard from "../components/MediaCard.jsx";

export default function WatchlistPage() {
  // Support both shapes: { items } and { list }
  const ctx = useWatchlist();
  const entries = Array.isArray(ctx?.items) && ctx.items.length > 0
    ? ctx.items
    : Array.isArray(ctx?.list)
      ? ctx.list
      : [];

  return (
    <div className="container page-wrap" style={{ paddingTop: "1rem" }}>
      <section className="results">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12
        }}>
          <h1 className="section-title" style={{ fontSize: "1.6rem", margin: 0 }}>
            Your Watchlist
          </h1>
          <Link to="/home" className="btn ghost">Zur Suche</Link>
        </div>

        {entries.length === 0 ? (
          <div className="card empty-state" style={{ padding: "1rem" }}>
            Deine Watchlist ist leer. Füge Titel über die Suche hinzu.
            <div style={{ marginTop: 12 }}>
              <Link to="/home" className="btn primary">Jetzt suchen</Link>
            </div>
          </div>
        ) : (
          <div className="media-grid">
            {entries.map((it) => (
              <MediaCard
                key={`${it.media_type}-${it.id}`}
                item={{
                  id: it.id,
                  media_type: it.media_type,
                  title: it.title,          // movie
                  name: it.title || it.name, // tv fallback
                  poster_path: it.poster_path,
                  release_date: it.release_date,
                  first_air_date: it.first_air_date,
                  overview: it.overview,
                  popularity: it.popularity,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
