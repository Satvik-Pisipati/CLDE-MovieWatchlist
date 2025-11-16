import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import MediaCard from "../components/MediaCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";

export default function WatchlistPage() {
  // Support both shapes: { items } and { list }
  const ctx = useWatchlist();
  const entries =
    Array.isArray(ctx?.items) && ctx.items.length > 0
      ? ctx.items
      : Array.isArray(ctx?.list)
      ? ctx.list
      : [];

  const { add, remove, isInList } = ctx || {};

  // currently opened item for the popup
  const [open, setOpen] = useState(null);

  // Listen for the same "detail-open" event that MediaCard dispatches
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
    <div className="container page-wrap" style={{ paddingTop: "1rem" }}>
      <section className="results">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <h1
            className="section-title"
            style={{ fontSize: "1.6rem", margin: 0 }}
          >
            Your Watchlist
          </h1>
          <Link to="/home" className="btn ghost">
            Zur Suche
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="card empty-state" style={{ padding: "1rem" }}>
            Deine Watchlist ist leer. Füge Titel über die Suche hinzu.
            <div style={{ marginTop: 12 }}>
              <Link to="/home" className="btn primary">
                Jetzt suchen
              </Link>
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
                  title: it.title,
                  name: it.title || it.name,
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

      {/* Popup (same component as on the main page) */}
      <DetailsModal
        item={open}
        onClose={() => setOpen(null)}
        onToggleList={toggle}
        inList={inList}
      />
    </div>
  );
}
