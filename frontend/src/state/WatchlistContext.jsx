// src/state/WatchlistContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const WatchlistContext = createContext(null);

// Neuer „Haupt“-Key
const STORAGE_KEY = "moviewatchlist:list";
// Alter Key aus früherem Code – lesen wir zum Notfall mit
const LEGACY_KEY = "watchlist";

function loadInitialWatchlist() {
  try {
    // 1) Neuer Key
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        console.log("[Watchlist] loaded from", STORAGE_KEY, parsed);
        return parsed;
      }
    }

    // 2) Fallback: alter Key
    const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (Array.isArray(parsed)) {
        console.log("[Watchlist] loaded from legacy key", LEGACY_KEY, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.error("[Watchlist] failed to load from localStorage:", err);
  }

  return [];
}

export function WatchlistProvider({ children }) {
  const [list, setList] = useState(loadInitialWatchlist);

  // Bei jeder Änderung in beide Keys schreiben,
  // damit alter Code (falls noch irgendwo) nichts kaputt macht.
  useEffect(() => {
    try {
      const json = JSON.stringify(list);
      window.localStorage.setItem(STORAGE_KEY, json);
      window.localStorage.setItem(LEGACY_KEY, json);
      console.log("[Watchlist] saved to localStorage:", list);
    } catch (err) {
      console.error("[Watchlist] failed to save:", err);
    }
  }, [list]);

  const add = (item) => {
    if (!item || !item.id || !item.media_type) return;
    setList((prev) => {
      const exists = prev.some(
        (it) => it.id === item.id && it.media_type === item.media_type
      );
      if (exists) return prev;
      const next = [...prev, item];
      console.log("[Watchlist] add", item, "->", next);
      return next;
    });
  };

  const remove = (media_type, id) => {
    setList((prev) => {
      const next = prev.filter(
        (it) => !(it.id === id && it.media_type === media_type)
      );
      console.log("[Watchlist] remove", media_type, id, "->", next);
      return next;
    });
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
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used inside WatchlistProvider");
  return ctx;
}
