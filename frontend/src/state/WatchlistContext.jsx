// frontend/src/state/WatchlistContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const WatchlistContext = createContext(null);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function WatchlistProvider({ children }) {
  const [list, setList] = useState([]);
  const auth = useAuth();

  // Watchlist vom Backend laden, sobald wir einen Token haben
  useEffect(() => {
    if (!auth?.token) {
      setList([]);
      return;
    }

    const controller = new AbortController();

    async function loadWatchlist() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/watchlist`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          console.error("Failed to load watchlist:", await res.text());
          return;
        }

        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setList(items);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Load watchlist failed:", err);
      }
    }

    loadWatchlist();

    return () => controller.abort();
  }, [auth?.token]);

  const add = async (item) => {
    if (!item || !item.id || !item.media_type) return;

    // Optimistisch im UI hinzufügen
    setList((prev) => {
      const exists = prev.some(
        (it) => it.id === item.id && it.media_type === item.media_type
      );
      if (exists) return prev;
      return [...prev, item];
    });

    if (!auth?.token) {
      console.warn("Not authenticated, cannot persist watchlist item");
      return;
    }

    try {
      await fetch(`${BACKEND_URL}/api/watchlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ item }),
      });
    } catch (err) {
      console.error("Failed to save watchlist item:", err);
      // Optional: bei Fehler wieder entfernen
    }
  };

  const remove = async (media_type, id) => {
    // Sofort im UI entfernen
    setList((prev) =>
      prev.filter((it) => !(it.id === id && it.media_type === media_type))
    );

    if (!auth?.token) {
      console.warn("Not authenticated, cannot remove from backend");
      return;
    }

    try {
      await fetch(`${BACKEND_URL}/api/watchlist/${media_type}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
    } catch (err) {
      console.error("Failed to remove watchlist item:", err);
    }
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
