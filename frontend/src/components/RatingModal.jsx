import { useEffect, useState } from "react";
import { useRatings } from "../state/RatingsContext.jsx";

export default function RatingModal() {
  const { ratings, rate, unrate } = useRatings() || {};
  const [open, setOpen] = useState(null);
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    const onOpen = (e) => {
      const item = e.detail;
      if (!item) return;

      setOpen(item);

      const existing = ratings?.find(
        (r) => r.id === item.id && r.media_type === item.media_type
      );

      setValue(existing?.rating ?? 0);
    };

    window.addEventListener("rating-open", onOpen);
    return () => window.removeEventListener("rating-open", onOpen);
  }, [ratings]);

  if (!open) return null;

  const save = () => {
    if (value > 0 && rate) rate(open, value);
    setOpen(null);
  };

  const clear = () => {
    if (unrate) unrate(open.media_type, open.id);
    setOpen(null);
  };

  const Star = ({ index }) => {
    const filled = index <= (hover || value);

    return (
      <span
        onClick={() => setValue(index)}
        onMouseEnter={() => setHover(index)}
        onMouseLeave={() => setHover(0)}
        style={{
          cursor: "pointer",
          fontSize: "32px",
          color: filled ? "#facc15" : "#4b5563",
          transition: "color 0.1s",
          marginRight: 4,
        }}
      >
        ★
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={() => setOpen(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {open.title || open.name} bewerten
          </h3>
          <button className="btn ghost" onClick={() => setOpen(null)}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-media">
            {open.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${open.poster_path}`}
                alt={open.title || open.name}
              />
            ) : (
              <div className="poster placeholder">Kein Bild</div>
            )}
          </div>

          <div>
            <p className="overview">
              Wie sehr hat dir dieser Titel gefallen?
            </p>

            <div style={{ display: "flex", marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} index={i} />
              ))}
            </div>

            <p>
              Deine Bewertung:{" "}
              <strong>
                {value > 0 ? `${value} / 5` : "Noch keine Bewertung"}
              </strong>
            </p>

            <div className="actions-row" style={{ marginTop: 16 }}>
              <button
                className="btn primary"
                onClick={save}
                disabled={value === 0}
              >
                Speichern
              </button>
              <button className="btn ghost" onClick={clear}>
                Bewertung entfernen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
