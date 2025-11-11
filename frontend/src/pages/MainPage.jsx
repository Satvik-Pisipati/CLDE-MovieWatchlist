import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchMulti } from "../api/tmdb";
import MediaCard from "../components/MediaCard";

export default function MainPage({ user }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate("/"); // weiterhin Login-Gate
  }, [user, navigate]);

  const [q, setQ] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const debounceRef = useRef();

  useEffect(() => {
    if (!q.trim()) {
      setData([]);
      setErr("");
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchMulti(q);
        setData(res);
        setErr("");
      } catch (e) {
        setErr(e.message || "Fehler bei der Suche");
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [q]);

  if (!user) return null;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "24px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Suche</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Film oder Serie suchen…"
          style={{
            flex: 1,
            minWidth: 260,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            outline: "none"
          }}
        />
        <Link to="/watchlist" style={{ fontWeight: 700, textDecoration: "none" }}>
          Watchlist
        </Link>
      </header>

      {loading && <div>Suche läuft…</div>}
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16
        }}
      >
        {data.map((item) => (
          <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
        ))}
      </div>

      {!loading && !err && q.trim() && data.length === 0 && (
        <div style={{ marginTop: 24, color: "#6b7280" }}>Keine Treffer.</div>
      )}
    </div>
  );
}
