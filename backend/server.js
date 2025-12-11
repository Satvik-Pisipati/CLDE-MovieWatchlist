import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { OAuth2Client } from "google-auth-library";
import serverless from "serverless-http";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

dotenv.config();

const app = express();

/* -------------------------------------------------------
   CORS CORS_ORIGIN = http://movie-watchlist-frontend-nathalie.s3-website-us-east-1.amazonaws.com
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
   DynamoDB Setup
------------------------------------------------------- */
const REGION = process.env.AWS_REGION || "us-east-1";
const WATCHLIST_TABLE = process.env.DDB_WATCHLIST_TABLE || "MovieWatchlist";
const RATINGS_TABLE = process.env.DDB_RATINGS_TABLE || "MovieRatings";

const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

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
      token: credential,
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
   Erwartet: TMDB_BEARER = "Bearer <dein_v4_read_access_token>"
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
   Watchlist mit DynamoDB
   Tabelle: MovieWatchlist (Standard)
   PK: userId (String)
   SK: itemId (String)
------------------------------------------------------- */

/* Watchlist holen */
app.get("/user/watchlist", requireAuth, async (req, res) => {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: WATCHLIST_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": req.user.id,
        },
      })
    );

    const items =
      result.Items?.map((it) => ({
        id: it.itemId,
        media_type: it.media_type,
        title: it.title || "",
        poster_path: it.poster_path || null,
      })) || [];

    res.json(items);
  } catch (err) {
    console.error("DynamoDB get watchlist error:", err);
    res.status(500).json({ error: "Watchlist fetch failed" });
  }
});

/* Watchlist-Eintrag hinzufügen oder aktualisieren */
app.post("/user/watchlist", requireAuth, async (req, res) => {
  try {
    const item = req.body || {};

    if (!item.id || !item.media_type) {
      return res.status(400).json({ error: "Missing id or media_type" });
    }

    const dbItem = {
      userId: req.user.id,
      itemId: String(item.id),
      media_type: item.media_type,
      title: item.title || item.name || "",
      poster_path: item.poster_path || null,
    };

    await ddb.send(
      new PutCommand({
        TableName: WATCHLIST_TABLE,
        Item: dbItem,
      })
    );

    const responseItem = {
      id: dbItem.itemId,
      media_type: dbItem.media_type,
      title: dbItem.title,
      poster_path: dbItem.poster_path,
    };

    res.json({ ok: true, item: responseItem });
  } catch (err) {
    console.error("DynamoDB add watchlist error:", err);
    res.status(500).json({ error: "Watchlist store failed" });
  }
});

/* Watchlist-Eintrag entfernen */
app.delete("/user/watchlist/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    await ddb.send(
      new DeleteCommand({
        TableName: WATCHLIST_TABLE,
        Key: {
          userId: req.user.id,
          itemId: String(id),
        },
      })
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("DynamoDB delete watchlist error:", err);
    res.status(500).json({ error: "Watchlist delete failed" });
  }
});

/* -------------------------------------------------------
   Ratings mit DynamoDB
   Tabelle: MovieRatings (Standard)
   PK: userId (String)
   SK: itemId (String)
------------------------------------------------------- */

/* Alle Ratings holen */
app.get("/user/ratings", requireAuth, async (req, res) => {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: RATINGS_TABLE,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": req.user.id,
        },
      })
    );

    const items =
      result.Items?.map((it) => ({
        id: it.itemId,
        media_type: it.media_type || null,
        rating: it.rating,
        title: it.title || "",
        poster_path: it.poster_path || null,
      })) || [];

    res.json(items);
  } catch (err) {
    console.error("DynamoDB get ratings error:", err);
    res.status(500).json({ error: "Ratings fetch failed" });
  }
});

/* Rating setzen oder aktualisieren */
app.post("/user/rate", requireAuth, async (req, res) => {
  try {
    const { id, rating, media_type, title, poster_path } = req.body || {};

    if (!id || rating == null) {
      return res.status(400).json({ error: "Missing id or rating" });
    }

    const dbItem = {
      userId: req.user.id,
      itemId: String(id),
      media_type: media_type || null,
      rating: Number(rating),
      title: title || "",
      poster_path: poster_path || null,
    };

    await ddb.send(
      new PutCommand({
        TableName: RATINGS_TABLE,
        Item: dbItem,
      })
    );

    const responseRating = {
      id: dbItem.itemId,
      media_type: dbItem.media_type,
      rating: dbItem.rating,
      title: dbItem.title,
      poster_path: dbItem.poster_path,
    };

    res.json({ ok: true, rating: responseRating });
  } catch (err) {
    console.error("DynamoDB rate error:", err);
    res.status(500).json({ error: "Ratings store failed" });
  }
});

/* Rating löschen */
app.delete("/user/rate/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    await ddb.send(
      new DeleteCommand({
        TableName: RATINGS_TABLE,
        Key: {
          userId: req.user.id,
          itemId: String(id),
        },
      })
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("DynamoDB delete rating error:", err);
    res.status(500).json({ error: "Ratings delete failed" });
  }
});

/* -------------------------------------------------------
   Lambda Handler
------------------------------------------------------- */
export const handler = serverless(app);