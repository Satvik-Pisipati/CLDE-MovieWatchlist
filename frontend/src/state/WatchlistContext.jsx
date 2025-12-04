import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/api"; // wichtig: fetch wrapper mit token

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [list, setList] = useState([]);

  // Load Watchlist from Backend
  useEffect(() => {
    async function load() {
      try {
        const items = await apiFetch("/user/watchlist", { method: "GET" });
        if (Array.isArray(items)) {
          setList(items);
        }
      } catch (err) {
        console.error("Failed to load watchlist from backend:", err);
      }
    }
    load();
  }, []);

  // Add item to backend
  async function add(item) {
    try {
      const res = await apiFetch("/user/watchlist", {
        method: "POST",
        body: JSON.stringify(item),
      });
      if (res?.item) {
        setList((prev) => [...prev, res.item]);
      }
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  }

  // Remove item from backend
  async function remove(media_type, id) {
    try {
      await apiFetch(`/user/watchlist/${id}`, { method: "DELETE" });
      setList((prev) =>
        prev.filter((i) => !(i.id === id && i.media_type === media_type))
      );
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  }

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
