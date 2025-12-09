// src/components/WatchlistPanel.jsx

import { useState, useEffect } from "react";
import { posterUrl } from "../api/tmdb";

import {
  getWatchlist,
  addToWatchlist,
  deleteFromWatchlist,
} from "../api/watchlist";

export default function WatchlistPanel({ watchlist, refreshWatchlist }) {
  const [loading, setLoading] = useState(false);

  // Load watchlist from backend
  async function load() {
    setLoading(true);

    try {
      const items = await getWatchlist();

      // Save for MainPage
      refreshWatchlist(items);

      // Also cache locally
      localStorage.setItem("watchlist", JSON.stringify(items));
    } catch (err) {
      console.error("Failed to load watchlist:", err);
    }

    setLoading(false);
  }

  // Load once on mount
  useEffect(() => {
    load();
  }, []);

  // Remove an item
  async function handleDelete(item) {
    try {
      await deleteFromWatchlist(item.itemId);
      await load();
    } catch (err) {
      console.error("Failed to delete watchlist item:", err);
    }
  }

  return (
    <div className="watchlist-panel">
      <h2>Your Watchlist</h2>

      {loading && <p>Loading...</p>}

      {!loading && watchlist.length === 0 && (
        <p>No items yet. Add something!</p>
      )}

      <div className="watchlist-grid">
        {watchlist.map((item) => (
          <div key={item.itemId} className="watchlist-card">
            <img
              src={posterUrl(item.poster_path)}
              alt={item.title}
            />

            <div className="info">
              <h3>{item.title}</h3>
              <p>{item.mediaType}</p>

              <button onClick={() => handleDelete(item)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
