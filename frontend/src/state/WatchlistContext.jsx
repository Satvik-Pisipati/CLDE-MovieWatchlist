import { createContext, useContext, useEffect, useState } from "react";

// --- API CALL HELPERS ---
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

// --- WATCHLIST CONTEXT ---
const WatchlistContext = createContext();
export const useWatchlist = () => useContext(WatchlistContext);

export function WatchlistProvider({ children }) {
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load from backend
  async function refresh() {
    try {
      const data = await api("GET", "/watchlist");
      setList(data.items || []);
    } catch (err) {
      console.error("Watchlist refresh failed:", err);
    }
    setLoaded(true);
  }

  // Add item
  async function add(item) {
    try {
      await api("POST", "/watchlist", {
        itemId: `${item.media_type}-${item.id}`,
        title: item.title || item.name,
        media_type: item.media_type
      });
      await refresh();
    } catch (err) {
      console.error("Add to backend failed:", err);
    }
  }

  // Remove item
  async function remove(media_type, id) {
    const itemId = `${media_type}-${id}`;
    try {
      await api("DELETE", `/watchlist/${itemId}`);
      await refresh();
    } catch (err) {
      console.error("Remove failed:", err);
    }
  }

  // Check if item is in list
  function isInList(media_type, id) {
    const itemId = `${media_type}-${id}`;
    return list.some((x) => x.itemId === itemId);
  }

  // Load once on startup
  useEffect(() => {
    refresh();
  }, []);

  return (
    <WatchlistContext.Provider value={{ list, add, remove, isInList, refresh, loaded }}>
      {children}
    </WatchlistContext.Provider>
  );
}
