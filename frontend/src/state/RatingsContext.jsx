import { createContext, useContext, useEffect, useState } from "react";

const RatingsContext = createContext(null);
const STORAGE_KEY = "moviewatchlist:ratings";

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState([]); // [{ id, media_type, rating, ...item }]

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setRatings(parsed);
    } catch (err) {
      console.error("Failed to load ratings:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
    } catch (err) {
      console.error("Failed to save ratings:", err);
    }
  }, [ratings]);

  const rate = (item, rating) => {
    if (!item || !item.id || !item.media_type) return;
    const safeRating = Math.max(0, Math.min(10, rating));
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
      if (idx === -1) return [...prev, withMeta];
      const copy = [...prev];
      copy[idx] = withMeta;
      return copy;
    });
  };

  const unrate = (media_type, id) => {
    setRatings((prev) =>
      prev.filter((r) => !(r.id === id && r.media_type === media_type))
    );
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