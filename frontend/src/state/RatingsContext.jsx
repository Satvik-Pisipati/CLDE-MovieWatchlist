import { createContext, useContext, useEffect, useMemo, useState } from "react";

const RatingsContext = createContext(null);
const LS_KEY = "ratings_v1";

function keyOf(media_type, id) {
  return `${media_type}-${id}`;
}

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(ratings));
    } catch {}
  }, [ratings]);

  const get = (media_type, id) => ratings[keyOf(media_type, id)] || null;

  const set = (media, value) => {
    const now = new Date().toISOString();
    const { media_type, id, title, name, poster_path, release_date, first_air_date, overview } = media;
    setRatings((prev) => ({
      ...prev,
      [keyOf(media_type, id)]: { rating: value, date: now, media_type, id, title, name, poster_path, release_date, first_air_date, overview },
    }));
  };

  const hasAny = Object.keys(ratings).length > 0;

  const value = useMemo(() => ({ ratings, get, set, hasAny }), [ratings, hasAny]);

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error("useRatings must be used within RatingsProvider");
  return ctx;
}