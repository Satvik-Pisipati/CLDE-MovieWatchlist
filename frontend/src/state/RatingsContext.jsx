import { createContext, useContext, useEffect, useState } from "react";

const RatingsContext = createContext(null);

const STORAGE_KEY = "moviewatchlist:ratings";
const LEGACY_KEYS = ["moviewatchlistratings", "ratings_v1", "ratings"];

function loadInitialRatings() {
  try {
    let parsed = null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      for (const key of LEGACY_KEYS) {
        const legacyRaw = localStorage.getItem(key);
        if (!legacyRaw) continue;
        try {
          const legacyParsed = JSON.parse(legacyRaw);
          if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
            parsed = legacyParsed;
            console.log(
              "[Ratings] migrated data from legacy key:",
              key,
              legacyParsed
            );
            break;
          }
        } catch (e) {
          console.error("[Ratings] Failed to parse legacy key", key, e);
        }
      }
    }

    if (Array.isArray(parsed)) {
      console.log("[Ratings] loaded from storage (init):", parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load ratings (init):", err);
  }
  return [];
}

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState(() => loadInitialRatings());

  useEffect(() => {
    try {
      console.log("[Ratings] saving ratings:", ratings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
    } catch (err) {
      console.error("Failed to save ratings:", err);
    }
  }, [ratings]);

  const rate = (item, rating) => {
    if (!item || !item.id || !item.media_type) {
      console.warn("[Ratings] rate() called with invalid item:", item);
      return;
    }
    const safeRating = Math.max(0, Math.min(5, rating));

    setRatings((prev) => {
      const idx = prev.findIndex(
        (r) => r.id === item.id && r.media_type === item.media_type
      );
      const withMeta = {
        ...item,
        media_type: item.media_type,
        title: item.title || item.name,
        rating: safeRating,
      };
      let next;
      if (idx === -1) next = [...prev, withMeta];
      else {
        next = [...prev];
        next[idx] = withMeta;
      }
      console.log("[Ratings] rate → new ratings:", next);
      return next;
    });
  };

  const unrate = (media_type, id) => {
    setRatings((prev) => {
      const next = prev.filter(
        (r) => !(r.id === id && r.media_type === media_type)
      );
      console.log("[Ratings] unrate → new ratings:", next);
      return next;
    });
  };

  const getRating = (media_type, id) => {
    const found = ratings.find(
      (r) => r.id === id && r.media_type === media_type
    );
    return found?.rating ?? null;
  };

  return (
    <RatingsContext.Provider value={{ ratings, rate, unrate, getRating }}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  return useContext(RatingsContext);
}
