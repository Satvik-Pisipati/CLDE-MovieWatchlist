import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { OAuth2Client } from "google-auth-library";
import serverless from "serverless-http";

dotenv.config();

const app = express();

/* -------------------------------------------------------
   CORS
   CORS_ORIGIN z. B.
   http://localhost:5173,
   http://movie-watchlist-frontend-nathalie.s3-website-us-east-1.amazonaws.com
   oder einfach *
------------------------------------------------------- */
const ORIGIN = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: ORIGIN,
    credentials: false,
  })
);
app.use(express.json());

/* -------------------------------------------------------
   Google OAuth
------------------------------------------------------- */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload?.email) {
    throw new Error("Invalid Google token payload");
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

/* -------------------------------------------------------
   Auth Route
------------------------------------------------------- */
app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: "Missing credential" });
    }

    const user = await verifyGoogleIdToken(credential);

    return res.json({
      user,
      token: credential, // Google ID Token, wird im Frontend gespeichert
    });
  } catch (err) {
    console.error("Google auth failed:", err);
    return res.status(401).json({ error: "Auth failed" });
  }
});

/* -------------------------------------------------------
   Auth Middleware
------------------------------------------------------- */
async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const user = await verifyGoogleIdToken(token);
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* -------------------------------------------------------
   TMDB Proxy
   Erwartet: TMDB_BEARER = "Bearer <dein_token>"
------------------------------------------------------- */
app.get("/api/tmdb/*", requireAuth, async (req, res) => {
  try {
    const path = req.params[0];
    const query = req.url.includes("?") ? "?" + req.url.split("?")[1] : "";
    const url = `https://api.themoviedb.org/3/${path}${query}`;

    const r = await fetch(url, {
      headers: { Authorization: process.env.TMDB_BEARER },
    });

    const data = await r.json();
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    console.error("TMDB fetch failed:", e);
    res.status(500).json({ error: "TMDB proxy failed" });
  }
});

/* -------------------------------------------------------
   Einfache In-Memory Watchlist pro User (Demo)
   Achtung: wird in Lambda nicht dauerhaft gespeichert,
   eignet sich für Demo / Prototyp, nicht für Produktion.
------------------------------------------------------- */

const userStore = new Map(); // key: user.id, value: { watchlist: [], ratings: [] }

function getUserState(userId) {
  if (!userStore.has(userId)) {
    userStore.set(userId, { watchlist: [], ratings: [] });
  }
  return userStore.get(userId);
}

/* Watchlist holen */
app.get("/user/watchlist", requireAuth, (req, res) => {
  const state = getUserState(req.user.id);
  res.json(state.watchlist);
});

/* Watchlist-Eintrag hinzufügen oder aktualisieren */
app.post("/user/watchlist", requireAuth, (req, res) => {
  const state = getUserState(req.user.id);
  const item = req.body || {};

  if (!item.id || !item.media_type) {
    return res.status(400).json({ error: "Missing id or media_type" });
  }

  const normalized = {
    id: item.id,
    media_type: item.media_type,
    title: item.title || item.name || "",
    poster_path: item.poster_path || null,
  };

  const existingIndex = state.watchlist.findIndex((i) => i.id === normalized.id);
  if (existingIndex >= 0) {
    state.watchlist[existingIndex] = normalized;
  } else {
    state.watchlist.push(normalized);
  }

  res.json({ ok: true, item: normalized });
});

/* Watchlist-Eintrag entfernen */
app.delete("/user/watchlist/:id", requireAuth, (req, res) => {
  const state = getUserState(req.user.id);
  const id = req.params.id;

  state.watchlist = state.watchlist.filter((i) => String(i.id) !== String(id));
  res.json({ ok: true });
});

/* -------------------------------------------------------
   Ratings (einfache In-Memory Speicherung)
------------------------------------------------------- */

/* Alle Ratings holen (optional) */
app.get("/user/ratings", requireAuth, (req, res) => {
  const state = getUserState(req.user.id);
  res.json(state.ratings || []);
});

/* Rating setzen oder aktualisieren */
app.post("/user/rate", requireAuth, (req, res) => {
  const state = getUserState(req.user.id);
  const { id, rating, media_type } = req.body || {};

  if (!id || !rating) {
    return res.status(400).json({ error: "Missing id or rating" });
  }

  const normalized = {
    id,
    media_type: media_type || null,
    rating: Number(rating),
  };

  const existingIndex = state.ratings.findIndex((r) => String(r.id) === String(id));
  if (existingIndex >= 0) {
    state.ratings[existingIndex] = normalized;
  } else {
    state.ratings.push(normalized);
  }

  res.json({ ok: true, rating: normalized });
});

/* Rating löschen */
app.delete("/user/rate/:id", requireAuth, (req, res) => {
  const state = getUserState(req.user.id);
  const id = req.params.id;

  state.ratings = state.ratings.filter((r) => String(r.id) !== String(id));
  res.json({ ok: true });
});

/* -------------------------------------------------------
   Lambda Handler
------------------------------------------------------- */
export const handler = serverless(app);