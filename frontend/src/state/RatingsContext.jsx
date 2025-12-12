import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const RatingsContext = createContext(null);

export function useRatings() {
  return useContext(RatingsContext);
}

// Normalize item → backend payload
function toRatingPayload(item, rating) {
  return {
    itemId: String(item.id ?? item.itemId),
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
  async function rate(itemId, rating) {
    const payload = toRatingPayload(itemId, rating);

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
