import { createContext, useContext, useEffect, useState } from "react";

// API Helper — same as WatchlistContext
async function api(method, url, body) {
  const token = localStorage.getItem("googleToken");
  if (!token) throw new Error("Missing Google token");

  const res = await fetch(import.meta.env.VITE_API_URL + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-google-id-token": token
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "API error");
  return json;
}

const RatingsContext = createContext();
export const useRatings = () => useContext(RatingsContext);

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ----------------------------------------------------------
  // Load ratings from backend
  // ----------------------------------------------------------
  async function refresh() {
    try {
      const data = await api("GET", "/ratings");
      setRatings(data.items || []);
    } catch (err) {
      console.error("Ratings refresh failed:", err);
    }
    setLoaded(true);
  }

  // ----------------------------------------------------------
  // Rate or update rating
  // ----------------------------------------------------------
  async function rate(item, ratingValue) {
    const itemId = `${item.media_type}-${item.id}`;

    try {
      await api("POST", "/ratings", {
        itemId,
        rating: Number(ratingValue),
        media_type: item.media_type
      });
      await refresh();
    } catch (err) {
      console.error("Rating failed:", err);
    }
  }

  // ----------------------------------------------------------
  // Delete rating (un-rate)
  // ----------------------------------------------------------
  async function unrate(media_type, id) {
    const itemId = `${media_type}-${id}`;

    try {
      await api("DELETE", `/ratings/${itemId}`);
      await refresh();
    } catch (err) {
      console.error("Unrate failed:", err);
    }
  }

  // ----------------------------------------------------------
  // Get rating for a single movie/show
  // ----------------------------------------------------------
  function getRating(media_type, id) {
    const itemId = `${media_type}-${id}`;
    return ratings.find((r) => r.itemId === itemId)?.rating || null;
  }

  // Load on first mount
  useEffect(() => {
    refresh();
  }, []);

  return (
    <RatingsContext.Provider
      value={{
        ratings,
        rate,       // used by RatingModal.jsx
        unrate,     // also used by RatingModal.jsx
        getRating,
        refresh,
        loaded
      }}
    >
      {children}
    </RatingsContext.Provider>
  );
}
