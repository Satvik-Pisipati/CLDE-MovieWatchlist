// backend/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { OAuth2Client } from "google-auth-library";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

dotenv.config();

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// ---------- Google Auth Setup ----------
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

app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: "Missing credential" });
    }

    const user = await verifyGoogleIdToken(credential);

    // Wir geben das ursprüngliche Google-Token zurück, der Client nutzt es als Bearer-Token
    return res.json({
      user,
      token: credential,
    });
  } catch (err) {
    console.error("Google auth failed:", err);
    return res.status(401).json({ error: "Auth failed" });
  }
});

// ---------- Auth Middleware ----------
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

// ---------- DynamoDB Setup ----------
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const WATCHLIST_TABLE = process.env.WATCHLIST_TABLE || "MovieWatchlist";
const RATINGS_TABLE = process.env.RATINGS_TABLE || "MovieRatings";

// ---------- (Optional) TMDB-Proxy über Backend ----------
app.get("/api/tmdb/*", requireAuth, async (req, res) => {
  try {
    const path = req.params[0];
    const query = req.url.includes("?") ? "?" + req.url.split("?")[1] : "";
    const url = `https://api.themoviedb.org/3/${path}${query}`;

    const r = await fetch(url, {
      // .env: TMDB_BEARER = "Bearer <token>"
      headers: { Authorization: process.env.TMDB_BEARER },
    });

    const data = await r.json();
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    console.error("TMDB fetch failed:", e);
    res.status(500).json({ error: "TMDB proxy failed" });
  }
});

// ======================================================
//                 WATCHLIST ROUTES
// ======================================================

// GET /api/watchlist -> alle Einträge des Users
app.get("/api/watchlist", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const cmd = new QueryCommand({
      TableName: WATCHLIST_TABLE,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userId },
    });

    const result = await ddb.send(cmd);
    res.json({ items: result.Items || [] });
  } catch (err) {
    console.error("Get watchlist failed:", err);
    res.status(500).json({ error: "Failed to load watchlist" });
  }
});

// POST /api/watchlist  { item: {...tmdbItem} }
app.post("/api/watchlist", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { item } = req.body || {};

    if (!item || !item.id || !item.media_type) {
      return res.status(400).json({ error: "Missing item data" });
    }

    const sortKey = `${item.media_type}#${item.id}`;

    const cmd = new PutCommand({
      TableName: WATCHLIST_TABLE,
      Item: {
        userId,
        sortKey,
        ...item,
      },
    });

    await ddb.send(cmd);
    res.json({ ok: true });
  } catch (err) {
    console.error("Add watchlist failed:", err);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

// DELETE /api/watchlist/:media_type/:id
app.delete("/api/watchlist/:media_type/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_type, id } = req.params;
    const sortKey = `${media_type}#${id}`;

    const cmd = new DeleteCommand({
      TableName: WATCHLIST_TABLE,
      Key: { userId, sortKey },
    });

    await ddb.send(cmd);
    res.json({ ok: true });
  } catch (err) {
    console.error("Remove watchlist failed:", err);
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

// ======================================================
//                 RATINGS ROUTES
// ======================================================

// GET /api/ratings -> alle Bewertungen des Users
app.get("/api/ratings", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const cmd = new QueryCommand({
      TableName: RATINGS_TABLE,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userId },
    });

    const result = await ddb.send(cmd);
    res.json({ items: result.Items || [] });
  } catch (err) {
    console.error("Get ratings failed:", err);
    res.status(500).json({ error: "Failed to load ratings" });
  }
});

// POST /api/ratings  { item: {...tmdbItem}, rating: number }
app.post("/api/ratings", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { item, rating } = req.body || {};

    if (!item || !item.id || !item.media_type) {
      return res.status(400).json({ error: "Missing item data" });
    }

    const safeRating = Math.max(0, Math.min(10, Number(rating) || 0));
    const sortKey = `${item.media_type}#${item.id}`;

    const cmd = new PutCommand({
      TableName: RATINGS_TABLE,
      Item: {
        userId,
        sortKey,
        rating: safeRating,
        ...item,
      },
    });

    await ddb.send(cmd);
    res.json({ ok: true });
  } catch (err) {
    console.error("Save rating failed:", err);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

// DELETE /api/ratings/:media_type/:id
app.delete("/api/ratings/:media_type/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_type, id } = req.params;
    const sortKey = `${media_type}#${id}`;

    const cmd = new DeleteCommand({
      TableName: RATINGS_TABLE,
      Key: { userId, sortKey },
    });

    await ddb.send(cmd);
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete rating failed:", err);
    res.status(500).json({ error: "Failed to delete rating" });
  }
});

export default app;
