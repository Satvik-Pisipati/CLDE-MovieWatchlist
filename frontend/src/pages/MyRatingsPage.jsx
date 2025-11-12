import { useState } from "react";
import { Link } from "react-router-dom";
import { useRatings } from "../state/RatingsContext.jsx";
import RateModal from "../components/RateModal.jsx";

export default function MyRatingsPage() {
  const { ratings } = useRatings();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const items = Object.values(ratings).sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );

  return (
    <div
      style={{
        padding: 20,
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        color: "#111827",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Header mit Links zu Suche und Watchlist */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Meine Bewertungen</h2>
        <div style={{ display: "flex", gap: 16 }}>
          <Link to="/home" style={{ color: "#2563eb", textDecoration: "none" }}>
            Zur Suche
          </Link>
          <Link
            to="/watchlist"
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            Zur Watchlist
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p
          style={{
            color: "#6b7280",
            border: "1px dashed #e5e7eb",
            padding: 16,
            borderRadius: 12,
            background: "#fff",
          }}
        >
          Noch keine Bewertungen. Füge zuerst Titel zur Watchlist hinzu und
          bewerte sie.
        </p>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((r) => {
            const key = `${r.media_type}-${r.id}`;
            const date = r.date ? new Date(r.date).toLocaleDateString() : "";
            const title = r.title || r.name;
            return (
              <div
                key={key}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  background: "white",
                  display: "flex",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 135,
                    background: "#f3f4f6",
                    borderRadius: 8,
                    overflow: "hidden",
                    flex: "0 0 auto",
                  }}
                >
                  {r.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342/${r.poster_path}`}
                      alt="Poster"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : null}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{title}</div>
                  <div style={{ color: "#6b7280", fontSize: 14, marginTop: 2 }}>
                    {r.media_type === "movie" ? "Movie" : "Serie"} · {date}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 18 }}>
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => {
                        setActive(r);
                        setOpen(true);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        background: "#ecfeff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Bewertung ändern
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RateModal open={open} onClose={() => setOpen(false)} media={active} />
    </div>
  );
}
