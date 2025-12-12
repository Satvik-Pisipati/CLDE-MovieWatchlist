// src/state/WatchlistContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function refreshWatchlist() {
    try {
      const res = await apiFetch("/watchlist");
      setItems(res.items || []);
    } catch (e) {
      console.warn("Watchlist refresh failed:", e?.message || e);
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    refreshWatchlist();
  }, []);

  function makeItemId(media_type, id) {
    return `${media_type}_${id}`;
  }

  function isInWatchlist(media_type, id) {
    return items.some((x) => x?.media_type === media_type && String(x?.id) === String(id));
  }

  async function addToWatchlist(tmdbItem) {
    const media_type = tmdbItem.media_type;
    const id = tmdbItem.id;

    if (!media_type || !id) throw new Error("Missing media_type or id");

    const item = {
      itemId: makeItemId(media_type, id), // REQUIRED by backend
      id,
      media_type,
      title: tmdbItem.title || tmdbItem.name || "",
      poster_path: tmdbItem.poster_path || "",
      backdrop_path: tmdbItem.backdrop_path || "",
      vote_average: tmdbItem.vote_average ?? null,
      release_date: tmdbItem.release_date || tmdbItem.first_air_date || "",
    };

    await apiFetch("/watchlist", {
      method: "POST",
      body: JSON.stringify(item),
    });

    await refreshWatchlist();
  }

  async function removeFromWatchlist(media_type, id) {
    const itemId = makeItemId(media_type, id);
    await apiFetch(`/watchlist/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });
    await refreshWatchlist();
  }

  async function toggleWatchlist(tmdbItem) {
    const media_type = tmdbItem?.media_type;
    const id = tmdbItem?.id;

    if (!media_type || !id) return;

    if (isInWatchlist(media_type, id)) {
      await removeFromWatchlist(media_type, id);
    } else {
      await addToWatchlist(tmdbItem);
    }
  }

  const value = useMemo(
    () => ({
      items,
      loaded,
      refreshWatchlist,
      toggleWatchlist,
      isInWatchlist,
    }),
    [items, loaded]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used inside WatchlistProvider");
  return ctx;
}
