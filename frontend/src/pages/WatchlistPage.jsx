<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import MediaCard from "../components/MediaCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import RatingModal from "../components/RatingModal.jsx";

export default function WatchlistPage() {
  const ctx = useWatchlist();
  const entries = ctx?.list || [];
  const { add, remove, isInList } = ctx || {};

  const [open, setOpen] = useState(null);

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
            Deine Watchlist
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
              <MediaCard key={`${it.media_type}-${it.id}`} item={it} />
            ))}
          </div>
        )}
      </section>

      <DetailsModal
        item={open}
        onClose={() => setOpen(null)}
        onToggleList={toggle}
        inList={inList}
      />
      <RatingModal />
    </div>
  );
}
>>>>>>> 417d2b785d6bb036be53d128afa970f124a95db2
