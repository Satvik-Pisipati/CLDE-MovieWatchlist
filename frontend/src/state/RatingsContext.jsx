// src/state/RatingsContext.jsx
import { createContext, useContext } from "react";
import { useWatchlist } from "./WatchlistContext";

const RatingsContext = createContext();

export function RatingsProvider({ children }) {
  const { items } = useWatchlist();

  const ratings = items.filter(i => i.rating != null);

  function rateItem(item, rating) {
    // delegate to watchlist toggle logic
    // rating is stored on watchlist item
    return item;
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
