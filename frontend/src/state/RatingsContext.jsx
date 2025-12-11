import { createContext, useContext, useState, useEffect } from "react";
import { loadWatchlist, saveWatchlistItem } from "../api/watchlist";

const RatingsContext = createContext();

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    refreshRatings();
  }, []);

  async function refreshRatings() {
    try {
      const items = await loadWatchlist();
      setRatings(items || []);
    } catch (e) {
      console.warn("Ratings refresh failed:", e.message);
    }
  }

  async function rateItem(item, rating) {
    const updated = { ...item, rating };
    await saveWatchlistItem(updated);
    refreshRatings();
  }

  return (
    <RatingsContext.Provider value={{ ratings, rateItem }}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  return useContext(RatingsContext);
}
