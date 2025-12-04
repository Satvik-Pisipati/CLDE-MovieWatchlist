// frontend/src/state/RatingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const RatingsContext = createContext(null);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState([]); // [{ id, media_type, rating, ...item }]
  const auth = useAuth();

  // Ratings vom Backend laden, sobald wir einen Token haben
  useEffect(() => {
    if (!auth?.token) {
      setRatings([]);
      return;
    }

    const controller = new AbortController();

    async function loadRatings() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/ratings`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          console.error("Failed to load ratings:", await res.text());
          return;
        }

        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setRatings(items);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Load ratings failed:", err);
      }
    }

    loadRatings();

    return () => controller.abort();
  }, [auth?.token]);

  const rate = async (item, rating) => {
    if (!item || !item.id || !item.media_type) return;
    const safeRating = Math.max(0, Math.min(10, Number(rating) || 0));

    // Optimistisch im UI anpassen
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

    if (!auth?.token) {
      console.warn("Not authenticated, cannot persist rating");
      return;
    }

    try {
      await fetch(`${BACKEND_URL}/api/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ item, rating: safeRating }),
      });
    } catch (err) {
      console.error("Failed to save rating:", err);
    }
  };

  const unrate = async (media_type, id) => {
    // Direkt im State entfernen
    setRatings((prev) =>
      prev.filter((r) => !(r.id === id && r.media_type === media_type))
    );

    if (!auth?.token) {
      console.warn("Not authenticated, cannot delete rating in backend");
      return;
    }

    try {
      await fetch(`${BACKEND_URL}/api/ratings/${media_type}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
    } catch (err) {
      console.error("Failed to delete rating:", err);
    }
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
