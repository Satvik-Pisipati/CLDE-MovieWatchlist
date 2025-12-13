import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRatings } from "../state/RatingsContext.jsx";
import { fetchTMDB } from "../api/tmdb";

export default function StatsPage() {
  const { ratings } = useRatings() || { ratings: [] };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  // -----------------------------
  // Load runtimes for rated titles
  // -----------------------------
  useEffect(() => {
    if (!ratings.length) {
      setItems([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          ratings.map(async (r) => {
            if (!r.id) return null;

            const mediaType = r.media_type || "movie";
            const endpoint =
              mediaType === "tv"
                ? `tv/${r.id}?language=de-DE`
                : `movie/${r.id}?language=de-DE`;

            try {
              const data = await fetchTMDB(endpoint);

              let minutes = 0;
              if (mediaType === "movie") {
                minutes = data.runtime || 0;
              } else {
                const perEpisode = Array.isArray(data.episode_run_time)
                  ? data.episode_run_time[0]
                  : data.episode_run_time;

                if (perEpisode && data.number_of_episodes) {
                  minutes = perEpisode * data.number_of_episodes;
                }
              }

              return {
                itemId: r.itemId,
                id: r.id,
                title: r.title || r.name || "Unbenannt",
                media_type: mediaType,
                rating: r.rating,
                minutes,
              };
            } catch {
              return {
                itemId: r.itemId,
                id: r.id,
                title: r.title || r.name || "Unbenannt",
                media_type: mediaType,
                rating: r.rating,
                minutes: 0,
              };
            }
          })
        );

        if (!cancelled) setItems(results.filter(Boolean));
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Statistik konnte nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => (cancelled = true);
  }, [ratings]);

  // -----------------------------
  // Calculations
  // -----------------------------
  const totalMinutes = useMemo(
    () => items.reduce((s, i) => s + (i.minutes || 0), 0),
    [items]
  );

  const roundedHours = Math.round((totalMinutes / 60) * 10) / 10;
  const hours = Math.floor(totalMinutes / 60);
  const minutesRest = totalMinutes % 60;

  const avgRating = useMemo(() => {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((s, r) => s + (r.rating || 0), 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }, [ratings]);

  const ratingDistribution = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      if (r.rating) map[r.rating]++;
    });
    return map;
  }, [ratings]);

  const maxRatingCount = useMemo(() => {
    return Math.max(1, ...Object.values(ratingDistribution));
  }, [ratingDistribution]);

  const runtimeSplitMinutes = useMemo(() => {
    const split = { movie: 0, tv: 0 };
    items.forEach((i) => {
      if (i.media_type === "tv") split.tv += i.minutes || 0;
      else split.movie += i.minutes || 0;
    });
    return split;
  }, [items]);

  const runtimeTotal = runtimeSplitMinutes.movie + runtimeSplitMinutes.tv;
  const moviePct = runtimeTotal ? runtimeSplitMinutes.movie / runtimeTotal : 0;
  const tvPct = runtimeTotal ? runtimeSplitMinutes.tv / runtimeTotal : 0;

  const topLongest = useMemo(() => {
    return [...items]
      .sort((a, b) => (b.minutes || 0) - (a.minutes || 0))
      .slice(0, 5);
  }, [items]);

  const missingRuntimeCount = useMemo(
    () => items.filter((i) => !i.minutes).length,
    [items]
  );

  // -----------------------------
  // Render (redesign only)
  // -----------------------------
  return (
    <div className="main-page">
      <div className="container">
        {/* HEADER CARD (matches other pages / hero cards) */}
        <section className="card page-wrap" style={{ marginTop: "1rem" }}>
          <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <h1 className="section-title" style={{ margin: 0 }}>
                Meine Statistik
              </h1>
              <Link to="/home" className="btn ghost">
                Zur Suche
              </Link>
            </div>

            {ratings.length === 0 && (
              <p style={{ marginTop: "0.9rem" }}>
                Du hast noch keine Titel bewertet.{" "}
                <Link to="/home">Jetzt entdecken</Link>
              </p>
            )}

            {ratings.length > 0 && (
              <>
                {/* KPI */}
                <div style={{ marginTop: "1rem" }}>
                  <div className="stats-grid">
                    <StatCard
                      label="Gesamtzeit"
                      value={`${roundedHours} h`}
                      sub={`(${hours} h ${minutesRest} min)`}
                    />
                    <StatCard
                      label="Ø Bewertung"
                      value={`${avgRating} ⭐`}
                      sub="aus deinen Bewertungen"
                    />
                    <StatCard
                      label="Bewertete Titel"
                      value={`${ratings.length}`}
                      sub="Filme & Serien"
                    />
                  </div>
                </div>

                {/* MINI CHARTS (same width, consistent padding) */}
                <div style={{ marginTop: "1rem" }}>
                  <div className="stats-row">
                    <div className="card" style={{ padding: "1rem 1.25rem" }}>
                      <div style={panelTitleStyle}>Bewertungsverteilung</div>

                      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = ratingDistribution[star] || 0;
                          const widthPct = Math.round(
                            (count / maxRatingCount) * 100
                          );

                          return (
                            <div
                              key={star}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "44px 1fr 36px",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                                {star}⭐
                              </div>

                              <div
                                style={{
                                  height: 10,
                                  borderRadius: 999,
                                  background: "rgba(255,255,255,0.10)",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${widthPct}%`,
                                    height: "100%",
                                    borderRadius: 999,
                                    background:
                                      "linear-gradient(90deg, rgba(99,102,241,0.85), rgba(34,211,238,0.85))",
                                  }}
                                />
                              </div>

                              <div style={{ textAlign: "right", opacity: 0.9 }}>
                                {count}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          fontSize: "0.8rem",
                          opacity: 0.7,
                        }}
                      >
                        Balken = relativ zur häufigsten Bewertung.
                      </div>
                    </div>

                    <div className="card" style={{ padding: "1rem 1.25rem" }}>
                      <div style={panelTitleStyle}>Laufzeit-Split</div>

                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            opacity: 0.9,
                          }}
                        >
                          <span>Filme</span>
                          <span>{Math.round(runtimeSplitMinutes.movie / 60)} h</span>
                        </div>
                        <MiniBar pct={moviePct} />

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 14,
                            opacity: 0.9,
                          }}
                        >
                          <span>Serien</span>
                          <span>{Math.round(runtimeSplitMinutes.tv / 60)} h</span>
                        </div>
                        <MiniBar pct={tvPct} />
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          fontSize: "0.8rem",
                          opacity: 0.7,
                        }}
                      >
                        Anteil an der gesamten geschätzten Laufzeit.
                      </div>
                    </div>
                  </div>
                </div>

                {loading && (
                  <p style={{ marginTop: "1rem" }}>Statistik wird geladen…</p>
                )}
                {error && (
                  <p style={{ marginTop: "1rem", color: "var(--danger-color)" }}>
                    {error}
                  </p>
                )}
              </>
            )}

            {ratings.length === 0 && loading && (
              <p style={{ marginTop: "1rem" }}>Statistik wird geladen…</p>
            )}
            {ratings.length === 0 && error && (
              <p style={{ marginTop: "1rem", color: "var(--danger-color)" }}>
                {error}
              </p>
            )}
          </div>
        </section>

        {/* TOP LONGEST (full-width like other sections) */}
        {topLongest.length > 0 && (
          <section className="card page-wrap" style={{ marginTop: "1rem" }}>
            <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
              <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>
                Top 5 längste Titel
              </h2>

              <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {topLongest.map((m) => (
                  <li key={m.itemId ?? m.id} style={{ margin: "0.25rem 0" }}>
                    {m.title} –{" "}
                    {m.minutes ? `${Math.round(m.minutes / 60)} h` : "?"}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* TABLE (same padding / full-width card) */}
        {items.length > 0 && (
          <section className="card page-wrap" style={{ marginTop: "1rem" }}>
            <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
              <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>
                Details pro Titel
              </h2>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left" style={thStyle}>
                        Titel
                      </th>
                      <th align="left" style={thStyle}>
                        Typ
                      </th>
                      <th align="right" style={thStyle}>
                        Minuten
                      </th>
                      <th align="right" style={thStyle}>
                        Bewertung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((m) => (
                      <tr key={m.itemId ?? m.id}>
                        <td style={tdStyle}>{m.title}</td>
                        <td
                          style={{
                            ...tdStyle,
                            textTransform: "uppercase",
                            opacity: 0.85,
                          }}
                        >
                          {m.media_type}
                        </td>
                        <td align="right" style={tdStyle}>
                          {m.minutes || "?"}
                        </td>
                        <td align="right" style={tdStyle}>
                          {m.rating} ⭐
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {missingRuntimeCount > 0 && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    marginTop: "0.75rem",
                    opacity: 0.75,
                  }}
                >
                  Hinweis: {missingRuntimeCount} Titel haben keine vollständigen
                  Laufzeitdaten.
                </p>
              )}
            </div>
          </section>
        )}

        {/* bottom breathing room like other pages */}
        <div style={{ height: "1.25rem" }} />
      </div>
    </div>
  );
}

// -----------------------------
// UI helpers (unchanged logic / just presentation)
// -----------------------------
function StatCard({ label, value, sub }) {
  return (
    <div
      className="card"
      style={{
        padding: "1rem 1.25rem",
        textAlign: "center",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
      }}
    >
      <div style={{ fontSize: "0.75rem", opacity: 0.7, letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: "1.9rem", fontWeight: "bold", marginTop: 8 }}>
        {value}
      </div>
      {sub && (
        <div style={{ marginTop: 8, fontSize: "0.85rem", opacity: 0.75 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function MiniBar({ pct }) {
  const widthPct = Math.max(0, Math.min(100, Math.round((pct || 0) * 100)));
  return (
    <div
      style={{
        height: 10,
        borderRadius: 999,
        background: "rgba(255,255,255,0.10)",
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <div
        style={{
          width: `${widthPct}%`,
          height: "100%",
          borderRadius: 999,
          background:
            "linear-gradient(90deg, rgba(99,102,241,0.85), rgba(34,211,238,0.85))",
        }}
      />
    </div>
  );
}

// Inline table styles (keeps it consistent without new css files)
const thStyle = {
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  padding: "0.65rem 0.5rem",
  fontSize: "0.8rem",
  opacity: 0.85,
};

const tdStyle = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  padding: "0.65rem 0.5rem",
};

const panelTitleStyle = {
  fontWeight: 700,
  opacity: 0.9,
};
