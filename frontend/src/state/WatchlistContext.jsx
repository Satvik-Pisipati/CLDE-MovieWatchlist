// src/state/WatchlistContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "./AuthContext.jsx";

const WatchlistContext = createContext(null);

const makeItemId = (media_type, id) => `${media_type}_${id}`;

const normalize = (item) => {
  const media_type = item.media_type;
  const id = item.id;

  return {
    ...item,
    media_type,
    id,
    itemId: item.itemId || makeItemId(media_type, id),
    title: item.title || item.name || "",
  };
};

export function WatchlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  async function refresh() {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    const res = await apiFetch("/watchlist");
    setItems(res.items || []);
  }

  useEffect(() => {
    refresh();
    const sync = () => refresh();
    window.addEventListener("mw:sync", sync);
    return () => window.removeEventListener("mw:sync", sync);
  }, [isAuthenticated]);

  function isInList(media_type, id) {
    const itemId = makeItemId(media_type, id);
    return items.some((i) => i.itemId === itemId);
  }

  async function add(item) {
    const payload = normalize(item);

    await apiFetch("/watchlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setItems((prev) =>
      prev.some((i) => i.itemId === payload.itemId)
        ? prev
        : [payload, ...prev]
    );

    window.dispatchEvent(new Event("mw:sync"));
  }

  async function remove(media_type, id) {
    const itemId = makeItemId(media_type, id);

    await apiFetch(`/watchlist/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });

    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
    window.dispatchEvent(new Event("mw:sync"));
  }

  const value = useMemo(
    () => ({ items, add, remove, isInList }),
    [items]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
