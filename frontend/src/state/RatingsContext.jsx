import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/api";

const RatingsContext = createContext(null);

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState([]); 
  // Format backend returns: [{ id, media_type, rating }]

  // Load ratings from backend on mount
  useEffect(() => {
    async function load() {
      try {
        const items = await apiFetch("/user/ratings", { method: "GET" });
        if (Array.isArray(items)) {
          setRatings(items);
        }
      } catch (err) {
        console.error("Failed to load ratings from backend:", err);
      }
    }
    load();
  }, []);

  // Save/update rating in backend
  async function rate(item, rating) {
    try {
      const safeRating = Math.max(1, Math.min(5, rating)); // backend accepts numeric rating
      const payload = {
        id: item.id,
        media_type: item.media_type,
        rating: safeRating,
      };

      const res = await apiFetch("/user/rate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res?.rating) {
        setRatings((prev) => {
          const idx = prev.findIndex(
            (r) => r.id === payload.id && r.media_type === payload.media_type
          );
          if (idx === -1) return [...prev, res.rating];

          const updated = [...prev];
          updated[idx] = res.rating;
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to save rating:", err);
    }
  }

  // Remove rating from backend
  async function unrate(media_type, id) {
    try {
      await apiFetch(`/user/rate/${id}`, { method: "DELETE" });

      setRatings((prev) =>
        prev.filter((r) => !(r.id === id && r.media_type === media_type))
      );
    } catch (err) {
      console.error("Failed to remove rating:", err);
    }
  }

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