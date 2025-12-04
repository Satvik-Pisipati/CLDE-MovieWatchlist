// src/state/RatingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const RatingsContext = createContext(null);

// Neuer Haupt-Key
const STORAGE_KEY = "moviewatchlist:ratings";
// Alte Keys aus früheren Versionen
const LEGACY_KEYS = ["ratings_v1", "ratings"];

function loadInitialRatings() {
  try {
    // 1) Neuer Key zuerst
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        console.log("[Ratings] loaded from", STORAGE_KEY, parsed);
        return parsed;
      }
      if (parsed && typeof parsed === "object") {
        const arr = Object.values(parsed);
        console.log("[Ratings] loaded map from", STORAGE_KEY, arr);
        return arr;
      }
    }

    // 2) Fallback: alte Keys durchprobieren
    for (const key of LEGACY_KEYS) {
      raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      
      if (Array.isArray(parsed)) {
        console.log("[Ratings] loaded from legacy key", key, parsed);
        return parsed;
      }
      if (parsed && typeof parsed === "object") {
        const arr = Object.values(parsed);
        console.log("[Ratings] loaded map from legacy key", key, arr);
        return arr;
      }
    }
  } catch (err) {
    console.error("[Ratings] failed to load from localStorage:", err);
  }

  return [];
}

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState(loadInitialRatings);

  // Bei jeder Änderung in alle relevanten Keys schreiben
  useEffect(() => {
    try {
      const json = JSON.stringify(ratings);
      window.localStorage.setItem(STORAGE_KEY, json);
      for (const key of LEGACY_KEYS) {
        window.localStorage.setItem(key, json);
      }
      console.log("[Ratings] saved to localStorage:", ratings);
    } catch (err) {
      console.error("[Ratings] failed to save:", err);
    }
  }, [ratings]);

  // item: TMDB-Objekt (movie/tv), value: Zahl (z. B. 1–5)
  const rate = (item, value) => {
    if (!item || !item.id || !item.media_type) return;
    setRatings((prev) => {
      const filtered = prev.filter(
        (r) => !(r.media_type === item.media_type && r.id === item.id)
      );
      const nextEntry = {
        ...item,
        title: item.title || item.name,
        rating: value,
        ratedAt: new Date().toISOString(),
      };
      const next = [...filtered, nextEntry];
      console.log("[Ratings] rate", nextEntry, "->", next);
      return next;
    });
  };

  const removeRating = (media_type, id) => {
    setRatings((prev) => {
      const next = prev.filter(
        (r) => !(r.media_type === media_type && r.id === id)
      );
      console.log("[Ratings] remove", media_type, id, "->", next);
      return next;
    });
  };

  const getRatingForItem = (media_type, id) => {
    const entry = ratings.find(
      (r) => r.media_type === media_type && r.id === id
    );
    return entry ? entry.rating : null;
  };

  return (
    <RatingsContext.Provider
      value={{ ratings, rate, removeRating, getRatingForItem }}
    >
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) {
    throw new Error("useRatings must be used inside RatingsProvider");
  }
  return ctx;
}
