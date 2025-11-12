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

  const doSearch = async (term) => {
    setLoading(true);
    setErr("");
    try {
      const res = await searchMulti(term);   // res ist ein Array
      setData(res || []);                    // nicht res.results
    } catch (e) {
      setErr("Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const term = e.target.value;
    setQ(term);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (term.trim()) doSearch(term);
      else setData([]);
    }, 400);
  };

  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
        color: "#111827",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0 }}>Suche</h2>
        <Link to="/watchlist" style={{ color: "#2563eb", textDecoration: "none" }}>
          Zur Watchlist
        </Link>
      </div>

      <input
        value={q}
        onChange={onChange}
        placeholder="Suchen..."
        style={{
          width: "100%",
          marginTop: 12,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          fontSize: 16,
          outline: "none",
        }}
      />

      {loading && <div style={{ marginTop: 12 }}>Laden…</div>}
      {err && <div style={{ marginTop: 12, color: "#b91c1c" }}>{err}</div>}

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {data.map((item) => (
          <MediaCard key={`${item.media_type}-${item.id}`} item={item} showRate={false} />
        ))}
      </div>

      {!loading && !err && q.trim() && data.length === 0 && (
        <div style={{ marginTop: 24, color: "#6b7280" }}>Keine Treffer.</div>
      )}
    </div>
  );
}
