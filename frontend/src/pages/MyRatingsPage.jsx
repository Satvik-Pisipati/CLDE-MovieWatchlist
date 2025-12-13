import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRatings } from "../state/RatingsContext.jsx";
import { useWatchlist } from "../state/WatchlistContext.jsx";
import MediaCard from "../components/MediaCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import RatingModal from "../components/RatingModal.jsx";

export default function MyRatingsPage() {
  const { ratings } = useRatings();
  const { add, remove, isInList } = useWatchlist();
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const onOpen = (e) => setOpen(e.detail);
    window.addEventListener("detail-open", onOpen);
    return () => window.removeEventListener("detail-open", onOpen);
  }, []);

  const inList = open ? isInList(open.id) : false;

  const toggle = () => {
    if (!open) return;
    if (inList) {
      remove(open.id);
    } else {
      add(open);
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
            marginBottom: 12,
          }}
        >
          <h1 className="section-title" style={{ fontSize: "1.6rem", margin: 0 }}>
            Meine Bewertungen
          </h1>
          <Link to="/" className="btn ghost">
            Zur Suche
          </Link>
        </div>

        {ratings.length === 0 ? (
          <div className="card empty-state" style={{ padding: "1rem" }}>
            Du hast noch nichts bewertet.
          </div>
        ) : (
          <div className="media-grid">
            {/* {ratings.map((r) => {
              // 🔧 Rebuild a MediaCard-compatible item
              const item = {
                id: Number(r.itemId),
                itemId: r.itemId,
                media_type: "movie", // default (TMDB id space overlaps safely)
                title: r.title ?? `Film ${r.itemId}`,
                poster_path: r.poster_path ?? null,
              };

              return <MediaCard key={r.itemId} item={item} />;
            })} */}
            {ratings.map((item) => (
              <MediaCard key={item.itemId} item={item} />
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
