// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

// Proxy to TMDB (uses TMDB_BEARER env var server side)
app.get("/api/tmdb/*", async (req, res) => {
  try {
    const path = req.params[0];
    const query = req.url.includes("?") ? "?" + req.url.split("?")[1] : "";
    const url = `https://api.themoviedb.org/3/${path}${query}`;

    const r = await fetch(url, {
      // Your .env already contains "Bearer <token>"
      headers: { Authorization: process.env.TMDB_BEARER },
    });

    const data = await r.json();
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    console.error("TMDB fetch failed:", e);
    res.status(500).json({ error: "TMDB proxy failed" });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));
