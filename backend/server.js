// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: verify Google ID token and return user info
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

// POST /auth/google
// Body: { credential: "<Google ID token from frontend>" }
app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: "Missing credential" });
    }

    const user = await verifyGoogleIdToken(credential);

    // Wir verwenden direkt das Google-ID-Token als Bearer-Token.
    return res.json({
      user,
      token: credential,
    });
  } catch (err) {
    console.error("Google auth failed:", err);
    return res.status(401).json({ error: "Auth failed" });
  }
});

// Auth check middleware for protected APIs
// Expects: Authorization: Bearer <Google ID token>
async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const user = await verifyGoogleIdToken(token);
    req.user = user; // attach for later use if needed
    next();
  } catch (err) {
    console.error("Auth failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Protected proxy to TMDB
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

app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));
