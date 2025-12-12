import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext";
import {
  loadWatchlist,
  saveWatchlistItem,
  deleteWatchlistItem,
} from "../api/watchlist";
 
const WatchlistContext = createContext();
 
export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
 
  async function refreshWatchlist() {
    if (!user) {
      setItems([]);
      setLoaded(true);
      return;
    }
 
    try {
      const list = await loadWatchlist();
      setItems(list);
    } catch (err) {
      console.warn("Watchlist refresh failed:", err);
    } finally {
      setLoaded(true);
    }
  }
 
  useEffect(() => {
    // refetch whenever user changes (login / logout)
    refreshWatchlist();
  }, [user?.sub]);
 
  async function toggleWatchlist(item) {
    if (!user) return;
 
    const itemId = `${item.media_type}-${item.id}`;
    const exists = items.some((i) => i.itemId === itemId);
 
    if (exists) {
      await deleteWatchlistItem(itemId);
    } else {
      await saveWatchlistItem({
        ...item,
        itemId,
      });
    }
 
    await refreshWatchlist();
  }
 
  function isInWatchlist(media_type, id) {
    const itemId = `${media_type}-${id}`;
    return items.some((i) => i.itemId === itemId);
  }
 
  return (
<WatchlistContext.Provider
      value={{ items, toggleWatchlist, isInWatchlist, refreshWatchlist, loaded }}
>
      {children}
</WatchlistContext.Provider>
  );
}
 
export function useWatchlist() {
  return useContext(WatchlistContext);
}
