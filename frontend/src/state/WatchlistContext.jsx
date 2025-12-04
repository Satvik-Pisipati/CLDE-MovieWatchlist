import { createContext, useContext, useEffect, useState } from "react";

const WatchlistContext = createContext(null);

const STORAGE_KEY = "moviewatchlist:list";
const LEGACY_KEYS = ["moviewatchlistlist", "watchlist"];

function loadInitialWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let parsed = raw ? JSON.parse(raw) : null;

    if (!Array.isArray(parsed) || parsed.length === 0) {
      for (const key of LEGACY_KEYS) {
        const legacyRaw = localStorage.getItem(key);
        if (!legacyRaw) continue;
        try {
          const legacyParsed = JSON.parse(legacyRaw);
          if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
            parsed = legacyParsed;
            console.log(
              "[Watchlist] migrated data from legacy key:",
              key,
              legacyParsed
            );
            break;
          }
        } catch (e) {
          console.error("[Watchlist] Failed to parse legacy key", key, e);
        }
      }
    }

    if (Array.isArray(parsed)) {
      console.log("[Watchlist] loaded from storage (init):", parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load watchlist (init):", err);
  }
  return [];
}

export function WatchlistProvider({ children }) {
  const [list, setList] = useState(() => loadInitialWatchlist());

  useEffect(() => {
    try {
      console.log("[Watchlist] saving list:", list);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error("Failed to save watchlist:", err);
    }
  }, [list]);

  const add = (item) => {
    if (!item || !item.id || !item.media_type) {
      console.warn("[Watchlist] add() called with invalid item:", item);
      return;
    }
    setList((prev) => {
      const exists = prev.some(
        (it) => it.id === item.id && it.media_type === item.media_type
      );
      if (exists) return prev;
      const next = [...prev, item];
      console.log("[Watchlist] add → new list:", next);
      return next;
    });
  };

  const remove = (media_type, id) => {
    setList((prev) => {
      const next = prev.filter(
        (it) => !(it.id === id && it.media_type === media_type)
      );
      console.log("[Watchlist] remove → new list:", next);
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
  return useContext(WatchlistContext);
}
