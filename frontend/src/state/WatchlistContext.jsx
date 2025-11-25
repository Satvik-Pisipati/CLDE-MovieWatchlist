<<<<<<< HEAD
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
=======
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
>>>>>>> 417d2b785d6bb036be53d128afa970f124a95db2
