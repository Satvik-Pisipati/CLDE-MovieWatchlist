import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const WatchlistContext = createContext(null);

export function useWatchlist() {
  return useContext(WatchlistContext);
}

// Normalize TMDB item → backend format
function toWatchlistItem(item) {
  return {
    itemId: String(item.id), // REQUIRED by backend
    id: item.id,
    media_type: item.media_type || (item.title ? "movie" : "tv"),
    title: item.title || item.name,
    poster_path: item.poster_path,
    release_date: item.release_date || item.first_air_date,
    vote_average: item.vote_average,
  };
}

export function WatchlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from DynamoDB
  async function refreshWatchlist() {
    try {
      const res = await apiFetch("/watchlist");
      setItems(res.items || []);
    } catch (err) {
      console.error("Failed to load watchlist:", err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshWatchlist();
  }, []);

  function isInList(itemId) {
    return items.some((i) => i.itemId === itemId);
  }

  async function add(itemId) {
    const payload = toWatchlistItem(itemId);

    await apiFetch("/watchlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await refreshWatchlist();
  }

  async function remove(itemId) {
    await apiFetch(`/watchlist/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });

    await refreshWatchlist();
  }

  return (
    <WatchlistContext.Provider
      value={{
        items,
        loading,
        add,
        remove,
        isInList,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}
