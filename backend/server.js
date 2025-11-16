// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/google
// Body: { credential: "<Google ID token from frontend>" }
app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ error: "Missing credential" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // { sub, email, name, picture, ... }
    if (!payload?.sub || !payload?.email) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    // Create our own short JWT so the frontend can stay logged in
    const sessionToken = jwt.sign(
      {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      token: sessionToken,
    });
  } catch (err) {
    console.error("Google auth failed:", err);
    return res.status(401).json({ error: "Auth failed" });
  }
});

// (Optional) Auth check middleware for future protected APIs
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Example protected proxy to TMDB (only if you later need it)
app.get("/api/tmdb/*", requireAuth, async (req, res) => {
  try {
    const url = `https://api.themoviedb.org/3/${req.params[0]}${req.url.split("?")[1] ? "?" + req.url.split("?")[1] : ""}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.TMDB_BEARER}` },
    });
    const data = await r.json();
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    console.error("TMDB fetch failed:", e);
    res.status(500).json({ error: "TMDB proxy failed" });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));
