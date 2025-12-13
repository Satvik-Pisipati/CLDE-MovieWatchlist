import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const RatingsContext = createContext(null);

export function useRatings() {
  return useContext(RatingsContext);
}

// Normalize item → backend payload
/* function toRatingPayload(item, rating) {
  return {
    itemId: String(item.id ?? item.itemId),
    rating,
  };
} */

function toRatingPayload(item, rating) {
  return {
    itemId: String(item.id ?? item.itemId),
    id: item.id,
    media_type: item.media_type,
    title: item.title || item.name,
    poster_path: item.poster_path,
    release_date: item.release_date || item.first_air_date,
    vote_average: item.vote_average,
    rating,
  };
}

export function RatingsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refreshRatings() {
    try {
      const res = await apiFetch("/ratings");
      setItems(res.items || []);
    } catch (err) {
      console.error("Failed to load ratings:", err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshRatings();
  }, []);

  function getRating(itemId) {
    const id = String(itemId);
    const found = items.find((r) => r.itemId === id);
    return found ? found.rating : null;
  }

  // ✅ FIX: receives FULL ITEM
  async function rate(item, rating) {
    const payload = toRatingPayload(item, rating);

    await apiFetch("/ratings", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await refreshRatings();
  }

  async function unrate(itemId) {
    const id = String(itemId);

    await apiFetch(`/ratings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    await refreshRatings();
  }

  return (
    <RatingsContext.Provider
      value={{
        ratings: items,
        loading,
        getRating,
        rate,
        unrate,
      }}
    >
      {children}
    </RatingsContext.Provider>
  );
}
