import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WatchlistContext = createContext(null);
const LS_KEY = "watchlist";

export function WatchlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = (entry) => {
    // entry: {id, media_type, title, poster_path, release_date, overview}
    setItems((prev) =>
      prev.some((x) => x.media_type === entry.media_type && x.id === entry.id)
        ? prev
        : [entry, ...prev]
    );
  };

  const remove = (media_type, id) => {
    setItems((prev) => prev.filter((x) => !(x.media_type === media_type && x.id === id)));
  };

  const isInList = (media_type, id) =>
    items.some((x) => x.media_type === media_type && x.id === id);

  const value = useMemo(() => ({ items, add, remove, isInList }), [items]);

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
