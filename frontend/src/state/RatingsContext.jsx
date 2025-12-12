// src/state/RatingsContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "./AuthContext.jsx";

const RatingsContext = createContext(null);
const makeItemId = (media_type, id) => `${media_type}_${id}`;

export function RatingsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [ratings, setRatings] = useState([]);

  async function refresh() {
    if (!isAuthenticated) {
      setRatings([]);
      return;
    }
    const res = await apiFetch("/watchlist");
    setRatings((res.items || []).filter((i) => i.rating != null));
  }

  useEffect(() => {
    refresh();
    const sync = () => refresh();
    window.addEventListener("mw:sync", sync);
    return () => window.removeEventListener("mw:sync", sync);
  }, [isAuthenticated]);

  function getRating(media_type, id) {
    const itemId = makeItemId(media_type, id);
    const found = ratings.find((r) => r.itemId === itemId);
    return found ? found.rating : null;
  }

  async function rate(item, rating) {
    const payload = {
      ...item,
      media_type: item.media_type,
      id: item.id,
      itemId: item.itemId || makeItemId(item.media_type, item.id),
      rating,
    };

    await apiFetch("/watchlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    window.dispatchEvent(new Event("mw:sync"));
  }

  async function unrate(media_type, id) {
    await apiFetch("/watchlist", {
      method: "POST",
      body: JSON.stringify({
        media_type,
        id,
        itemId: makeItemId(media_type, id),
        rating: null,
      }),
    });

    window.dispatchEvent(new Event("mw:sync"));
  }

  const value = useMemo(
    () => ({ ratings, getRating, rate, unrate }),
    [ratings]
  );

  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  return useContext(RatingsContext);
}
