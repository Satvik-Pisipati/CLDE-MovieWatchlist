import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRatings } from "../state/RatingsContext.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { getDetails } from "../api/tmdb.js";

export default function StatsPage() {
  const { ratings } = useRatings() || { ratings: [] };
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [moviesWithRuntime, setMoviesWithRuntime] = useState([]); // [{id, title, media_type, minutes}]

  // Laufzeiten nachladen, sobald sich die Bewertungen ändern
  useEffect(() => {
    if (!ratings || ratings.length === 0) {
      setMoviesWithRuntime([]);
      return;
    }

    if (!token) {
      // nicht eingeloggt → keine TMDB-Calls
      setMoviesWithRuntime([]);
      return;
    }

    let cancelled = false;

    async function loadRuntimes() {
      setLoading(true);
      setError("");

      try {
        const promises = ratings.map(async (r) => {
          const mediaType = r.media_type || "movie";
          const id = r.id;
          if (!id) return null;

          try {
            // Holt movie/tv-Details über unser Backend-Proxy
            const data = await getDetails(mediaType, id, "de-DE", token);

            let minutes = 0;

            if (mediaType === "movie") {
              minutes = data.runtime || 0;
            } else if (mediaType === "tv") {
              // Vereinfachte Annahme: Episodendauer * Anzahl Episoden
              let perEpisode = 0;
              // 1) Falls episode_run_time vorhanden ist (TMDb liefert manchmal ein Array)
              if (Array.isArray(data.episode_run_time) && data.episode_run_time.length > 0) {
                perEpisode = data.episode_run_time[0];
              }

              // 2) Falls das leer war → letzte Episode prüfen
              if (!perEpisode && data.last_episode_to_air?.runtime) {
                perEpisode = data.last_episode_to_air.runtime;
              }

              // 3) Minuten berechnen, wenn möglich
              if (perEpisode && data.number_of_episodes) {
                minutes = perEpisode * data.number_of_episodes;
              } else {
                minutes = 0; // Fallback
              }
            }

            return {
              id,
              media_type: mediaType,
              title: r.title || r.name || "Unbenannt",
              minutes: minutes || 0,
            };
          } catch (e) {
            console.error("Fehler beim Laden der Laufzeit für", r, e);
            return {
              id,
              media_type: mediaType,
              title: r.title || r.name || "Unbenannt",
              minutes: 0,
            };
          }
        });

        const results = (await Promise.all(promises)).filter(Boolean);

        if (!cancelled) {
          setMoviesWithRuntime(results);
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
  }, [ratings, token]);

  const totalMinutes = useMemo(
    () => moviesWithRuntime.reduce((sum, m) => sum + (m.minutes || 0), 0),
    [moviesWithRuntime]
  );

  const totalHours = totalMinutes / 60;
  const roundedHours = Math.round(totalHours * 10) / 10;

  const hours = Math.floor(totalMinutes / 60);
  const minutesRest = totalMinutes % 60;

  return (
    <div className="main-page">
      <div className="container">
        <section
          className="card page-wrap"
          style={{ marginTop: "1rem", padding: "1.5rem" }}
        >
          <h1 className="section-title">Meine Statistik</h1>

          {ratings.length === 0 && (
            <p style={{ marginTop: "0.75rem" }}>
              Du hast noch keine Filme/Serien bewertet.{" "}
              <Link to="/home">Jetzt Titel entdecken</Link>
            </p>
          )}

          {ratings.length > 0 && (
            <>
              <p style={{ marginTop: "0.75rem" }}>
                Basierend auf deinen Bewertungen hast du ungefähr:
              </p>

              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginTop: "0.5rem",
                }}
              >
                {roundedHours} Stunden
              </p>

              <p style={{ color: "var(--muted-color)" }}>
                ({hours} h {minutesRest} min, aus {ratings.length} bewerteten
                Titeln)
              </p>
            </>
          )}

          {loading && (
            <p style={{ marginTop: "1rem" }}>
              Laufzeiten werden geladen, einen Moment…
            </p>
          )}

          {error && (
            <p style={{ marginTop: "1rem", color: "var(--danger-color)" }}>
              {error}
            </p>
          )}
        </section>

        {moviesWithRuntime.length > 0 && (
          <section className="card page-wrap" style={{ marginTop: "1rem" }}>
            <h2 className="section-title">Details pro Titel</h2>
            <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid var(--border-color)",
                        padding: "0.5rem",
                      }}
                    >
                      Titel
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid var(--border-color)",
                        padding: "0.5rem",
                      }}
                    >
                      Typ
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        borderBottom: "1px solid var(--border-color)",
                        padding: "0.5rem",
                      }}
                    >
                      Laufzeit (Minuten)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {moviesWithRuntime.map((m) => (
                    <tr key={`${m.media_type}-${m.id}`}>
                      <td
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          padding: "0.5rem",
                        }}
                      >
                        {m.title}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          padding: "0.5rem",
                          textTransform: "uppercase",
                          fontSize: "0.8rem",
                        }}
                      >
                        {m.media_type}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          padding: "0.5rem",
                          textAlign: "right",
                        }}
                      >
                        {m.minutes || "?"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.8rem",
                color: "var(--muted-color)",
              }}
            >
              Hinweis: Für Serien wird die gesamte Laufzeit aus Anzahl Episoden ×
              durchschnittlicher Episodendauer geschätzt (TMDB-Daten).
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
