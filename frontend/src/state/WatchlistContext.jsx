import { createContext, useContext, useEffect, useState } from "react";

const WatchlistContext = createContext(null);
const STORAGE_KEY = "moviewatchlist:list";

export function WatchlistProvider({ children }) {
  const [list, setList] = useState([]);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setList(parsed);
      }
    } catch (err) {
      console.error("Failed to load watchlist:", err);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error("Failed to save watchlist:", err);
    }
  }, [list]);

  const add = (item) => {
    if (!item || !item.id || !item.media_type) return;
    setList((prev) => {
      const exists = prev.some(
        (it) => it.id === item.id && it.media_type === item.media_type
      );
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const remove = (media_type, id) => {
    setList((prev) =>
      prev.filter((it) => !(it.id === id && it.media_type === media_type))
    );
  };

  const isInList = (media_type, id) =>
    list.some((it) => it.id === id && it.media_type === media_type);

  return (
    <WatchlistContext.Provider value={{ list, add, remove, isInList }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}