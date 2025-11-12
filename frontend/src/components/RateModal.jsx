import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRatings } from "../state/RatingsContext.jsx";

export default function RateModal({ open, onClose, media }) {
  const { get, set } = useRatings();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (open && media) {
      const current = get(media.media_type, media.id);
      setValue(current?.rating || 0);
    }
  }, [open, media]);

  if (!open) return null;

  const handleSave = () => {
    if (value > 0) set(media, value);
    onClose?.();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          width: "min(92vw, 420px)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          color: "#111827"
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 18, fontWeight: 700 }}>
          Titel bewerten
        </h3>
        <p style={{ marginTop: 0, marginBottom: 16, color: "#6b7280" }}>
          {media?.title || media?.name}
        </p>
        <div style={{ display: "flex", gap: 8, fontSize: 28, marginBottom: 16 }}>
          {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              aria-label={`${n} Sterne`}
              onClick={() => setValue(n)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                lineHeight: 1
              }}
            >
              <span>{n <= value ? "★" : "☆"}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#f3f4f6",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#ecfeff",
              fontWeight: 700,
              cursor: "pointer"
            }}
            disabled={value === 0}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}