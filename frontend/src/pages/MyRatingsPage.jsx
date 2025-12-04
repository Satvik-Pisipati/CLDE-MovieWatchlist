import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRatings } from "../state/RatingsContext.jsx";
import MediaCard from "../components/MediaCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import RatingModal from "../components/RatingModal.jsx";
import { useWatchlist } from "../state/WatchlistContext.jsx";

export default function MyRatingsPage() {
  const { ratings } = useRatings() || { ratings: [] };
  const watch = useWatchlist() || {};
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const onOpen = (e) => setOpen(e.detail);
    window.addEventListener("detail-open", onOpen);
    return () => window.removeEventListener("detail-open", onOpen);
  }, []);

  const inList =
    open && watch.isInList
      ? watch.isInList(open.media_type, open.id)
      : false;

  const toggle = () => {
    if (!open || !watch.add || !watch.remove) return;
    if (inList) watch.remove(open.media_type, open.id);
    else watch.add({ ...open, title: open.title || open.name });
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
            Meine Bewertungen
          </h1>
          <Link to="/home" className="btn ghost">
            Zur Suche
          </Link>
        </div>

        {ratings.length === 0 ? (
          <div className="card empty-state" style={{ padding: "1rem" }}>
            Du hast noch nichts bewertet.
          </div>
        ) : (
          <div className="media-grid">
            {ratings.map((it) => (
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
