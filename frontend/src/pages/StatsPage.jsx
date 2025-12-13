import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRatings } from "../state/RatingsContext.jsx";
import { fetchTMDB } from "../api/tmdb";

export default function StatsPage() {
  const { ratings } = useRatings() || { ratings: [] };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [moviesWithRuntime, setMoviesWithRuntime] = useState([]);

  // --------------------------------------------------
  // Load runtimes for rated titles
  // --------------------------------------------------
  useEffect(() => {
    if (!ratings.length) {
      setMoviesWithRuntime([]);
      return;
    }

    let cancelled = false;

    async function loadRuntimes() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          ratings.map(async (r) => {
            const id = r.id;
            const mediaType = r.media_type || "movie";
            if (!id) return null;

            try {
              const endpoint =
                mediaType === "tv"
                  ? `tv/${id}?language=de-DE`
                  : `movie/${id}?language=de-DE`;

              const data = await fetchTMDB(endpoint);

              let minutes = 0;

              if (mediaType === "movie") {
                minutes = data.runtime || 0;
              } else if (mediaType === "tv") {
                const perEpisode = Array.isArray(data.episode_run_time)
                  ? data.episode_run_time[0]
                  : data.episode_run_time;

                if (perEpisode && data.number_of_episodes) {
                  minutes = perEpisode * data.number_of_episodes;
                }
              }

              return {
                id,
                itemId: r.itemId,
                title: r.title || r.name || "Unbenannt",
                media_type: mediaType,
                rating: r.rating,
                minutes,
              };
            } catch (e) {
              console.error("Runtime fetch failed:", r, e);
              return {
                id,
                itemId: r.itemId,
                title: r.title || r.name || "Unbenannt",
                media_type: mediaType,
                rating: r.rating,
                minutes: 0,
              };
            }
          })
        );

        if (!cancelled) {
          setMoviesWithRuntime(results.filter(Boolean));
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("Die Statistik konnte nicht geladen werden.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRuntimes();
    return () => {
      cancelled = true;
    };
  }, [ratings]);

  // --------------------------------------------------
  // Aggregations
  // --------------------------------------------------

  const totalMinutes = useMemo(
    () => moviesWithRuntime.reduce((s, m) => s + (m.minutes || 0), 0),
    [moviesWithRuntime]
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutesRest = totalMinutes % 60;
  const roundedHours = Math.round((totalMinutes / 60) * 10) / 10;

  const avgRating = useMemo(() => {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((s, r) => s + (r.rating || 0), 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }, [ratings]);

  const ratingDistribution = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      if (r.rating) map[r.rating] += 1;
    });
    return map;
  }, [ratings]);

  const runtimeSplit = useMemo(() => {
    const split = { movie: 0, tv: 0 };
    moviesWithRuntime.forEach((m) => {
      split[m.media_type === "tv" ? "tv" : "movie"] += m.minutes || 0;
    });
    return split;
  }, [moviesWithRuntime]);

  const topLongest = useMemo(() => {
    return [...moviesWithRuntime]
      .sort((a, b) => (b.minutes || 0) - (a.minutes || 0))
      .slice(0, 5);
  }, [moviesWithRuntime]);

  const missingRuntimeCount = useMemo(
    () => moviesWithRuntime.filter((m) => !m.minutes).length,
    [moviesWithRuntime]
  );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="main-page">
      <div className="container">
        <section className="card page-wrap" style={{ marginTop: "1rem" }}>
          <h1 className="section-title">Meine Statistik</h1>

          {ratings.length === 0 && (
            <p>
              Du hast noch keine Titel bewertet.{" "}
              <Link to="/home">Jetzt entdecken</Link>
            </p>
          )}

          {ratings.length > 0 && (
            <>
              <p>Basierend auf deinen Bewertungen:</p>

              <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {roundedHours} Stunden
              </p>

              <p>
                ({hours} h {minutesRest} min, {ratings.length} Titel)
              </p>

              <hr />

              <p>
                <strong>Durchschnittliche Bewertung:</strong> {avgRating} / 5 ⭐
              </p>

              <p>
                <strong>Bewertungsverteilung:</strong>{" "}
                {[5, 4, 3, 2, 1].map((s) => (
                  <span key={s} style={{ marginRight: 8 }}>
                    {s}⭐: {ratingDistribution[s]}
                  </span>
                ))}
              </p>

              <p>
                <strong>Filme:</strong>{" "}
                {Math.round(runtimeSplit.movie / 60)} h &nbsp;|&nbsp;
                <strong>Serien:</strong>{" "}
                {Math.round(runtimeSplit.tv / 60)} h
              </p>
            </>
          )}

          {loading && <p>Laufzeiten werden geladen…</p>}
          {error && <p style={{ color: "var(--danger-color)" }}>{error}</p>}
        </section>

        {topLongest.length > 0 && (
          <section className="card page-wrap" style={{ marginTop: "1rem" }}>
            <h2 className="section-title">Top 5 längste Titel</h2>
            <ol>
              {topLongest.map((m) => (
                <li key={m.itemId}>
                  {m.title} – {Math.round(m.minutes / 60)} h
                </li>
              ))}
            </ol>
          </section>
        )}

        {moviesWithRuntime.length > 0 && (
          <section className="card page-wrap" style={{ marginTop: "1rem" }}>
            <h2 className="section-title">Details pro Titel</h2>

            <table style={{ width: "100%", marginTop: "0.75rem" }}>
              <thead>
                <tr>
                  <th align="left">Titel</th>
                  <th align="left">Typ</th>
                  <th align="right">Minuten</th>
                </tr>
              </thead>
              <tbody>
                {moviesWithRuntime.map((m) => (
                  <tr key={m.itemId}>
                    <td>{m.title}</td>
                    <td>{m.media_type}</td>
                    <td align="right">{m.minutes || "?"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {missingRuntimeCount > 0 && (
              <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                Hinweis: {missingRuntimeCount} Titel haben keine vollständigen
                Laufzeitdaten.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
