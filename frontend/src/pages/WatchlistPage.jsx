import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import MediaCard from "../components/MediaCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import RatingModal from "../components/RatingModal.jsx";

export default function WatchlistPage() {
  const { items, add, remove, isInList } = useWatchlist();
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const onOpen = (e) => setOpen(e.detail);
    window.addEventListener("detail-open", onOpen);
    return () => window.removeEventListener("detail-open", onOpen);
  }, []);

  const inList =
    open ? isInList(open.media_type, open.id) : false;

  const toggle = () => {
    if (!open) return;
    if (inList) {
      remove(open.media_type, open.id);
    } else {
      add({ ...open, title: open.title || open.name });
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
          <h1 className="section-title" style={{ fontSize: "1.6rem", margin: 0 }}>
            Deine Watchlist
          </h1>
          <Link to="/" className="btn ghost">
            Zur Suche
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="card empty-state" style={{ padding: "1rem" }}>
            Deine Watchlist ist leer. Füge Titel über die Suche hinzu.
            <div style={{ marginTop: 12 }}>
              <Link to="/" className="btn primary">
                Jetzt suchen
              </Link>
            </div>
          </div>
        ) : (
          <div className="media-grid">
            {items.map((it) => (
              <MediaCard key={`${it.media_type}-${it.id}`} item={it} />
            ))}
          </div>
        )}
      </section>

      {/* <DetailsModal
        item={open}
        onClose={() => setOpen(null)}
        onToggleList={toggle}
        inList={inList}
      /> */}
      <RatingModal />
    </div>
  );
}
