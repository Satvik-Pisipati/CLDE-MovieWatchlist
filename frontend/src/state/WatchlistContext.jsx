import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const WatchlistContext = createContext(null);

export function useWatchlist() {
  return useContext(WatchlistContext);
}

// Normalize TMDB item → backend format
function toWatchlistItem(item) {
  if (!item || !item.id) {
    throw new Error("toWatchlistItem requires a media item with id");
  }
  return {
    itemId: String(item.itemId ?? item.id), // canonical ID (string)
    id: item.id,
    media_type: item.media_type || (item.title ? "movie" : "tv"),
    title: item.title || item.name,
    poster_path: item.poster_path ?? null,
    release_date: item.release_date || item.first_air_date || null,
    vote_average: item.vote_average ?? null,
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
    const key = String(itemId);
    return items.some((i) => i.itemId === key);
  }

  async function add(item) {
    if (!item || !item.id) {
      throw new Error("watch.add() requires a full media item with id");
    }

    const payload = toWatchlistItem(item);

    await apiFetch("/watchlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await refreshWatchlist();
  }

  /**
   * Remove an item from the watchlist by itemId.
   */
  async function remove(itemId) {
    const key = String(itemId);

    await apiFetch(`/watchlist/${encodeURIComponent(key)}`, {
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