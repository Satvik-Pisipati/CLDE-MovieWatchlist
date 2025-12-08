// index.mjs — Fully fixed Lambda backend
// - Google OAuth verification
// - DynamoDB CRUD
// - TMDB Proxy (CORS-safe, never returns 204)
// - Always returns JSON bodies with status 200 for browser compatibility

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// =====================================================
// CONFIGURATION
// =====================================================
const TABLE_NAME = process.env.TABLE_NAME || "MovieWatchlist";
const TMDB_KEY = process.env.TMDB_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

// JWKS client for Google tokens
const jwks = jwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
});

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

// =====================================================
// RESPONSE HELPERS (always include CORS)
// =====================================================
function response(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(bodyObj),
  };
}

async function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: "https://accounts.google.com",
        audience: GOOGLE_CLIENT_ID,
      },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }
    );
  });
}

// =====================================================
// MAIN HANDLER
// =====================================================
export const handler = async (event) => {
  console.log("Incoming request:", JSON.stringify(event));

  const method = event.requestContext?.http?.method;
  const path = event.rawPath || event.requestContext?.http?.path || "/";
  const qs = event.queryStringParameters || {};

  // ---------------------------
  // GOOGLE AUTH CHECK
  // ---------------------------
  const idToken =
    event.headers["x-google-id-token"] || event.headers["X-Google-ID-Token"];

  if (!idToken) {
    return response(200, {
      ok: false,
      error: "Missing Google ID token",
    });
  }

  let decoded;
  try {
    decoded = await verifyGoogleToken(idToken);
  } catch (err) {
    console.error("Google token verification failed:", err);
    return response(200, {
      ok: false,
      error: "Invalid Google ID token",
      details: err.message,
    });
  }

  const userId = decoded.sub;
  console.log("Authenticated user:", userId);

  // =====================================================
  // ROUTING
  // =====================================================
  try {
    // -----------------------------------------------------
    // TMDB PROXY: /tmdb?endpoint=<tmdb-endpoint>
    // ALWAYS returns 200 with JSON → no CORS issues
    // -----------------------------------------------------
    if (method === "GET" && path === "/tmdb") {
      const endpoint = qs.endpoint;
      if (!endpoint) {
        return response(200, {
          ok: false,
          error: "Missing 'endpoint' query parameter",
        });
      }

      const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}${
        endpoint.includes("?") ? "&" : "?"
      }api_key=${TMDB_KEY}`;

      console.log("Fetching TMDB:", tmdbUrl);

      try {
        const tmdbRes = await fetch(tmdbUrl);
        const json = await tmdbRes.json().catch(() => ({}));

        if (!tmdbRes.ok) {
          return response(200, {
            ok: false,
            error: "TMDB request failed",
            status: tmdbRes.status,
            statusText: tmdbRes.statusText,
            data: json,
          });
        }

        return response(200, {
          ok: true,
          data: json,
        });
      } catch (err) {
        return response(200, {
          ok: false,
          error: "TMDB fetch error",
          details: err.message,
        });
      }
    }

    // -----------------------------------------------------
    // GET WATCHLIST
    // -----------------------------------------------------
    if (method === "GET" && path === "/watchlist") {
      const data = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
        })
      );

      return response(200, {
        ok: true,
        items: data.Items || [],
      });
    }

    // -----------------------------------------------------
    // ADD / UPDATE WATCHLIST ITEM
    // -----------------------------------------------------
    if (method === "POST" && path === "/watchlist") {
      const body = JSON.parse(event.body || "{}");

      if (!body.itemId) {
        return response(200, {
          ok: false,
          error: "itemId is required",
        });
      }

      const item = {
        userId,
        itemId: body.itemId,
        title: body.title,
        mediaType: body.mediaType,
        status: body.status,
        rating: body.rating,
        updatedAt: new Date().toISOString(),
      };

      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
        })
      );

      return response(200, {
        ok: true,
        item,
      });
    }

    // -----------------------------------------------------
    // DELETE WATCHLIST ITEM
    // MUST RETURN 200 (NOT 204) FOR CORS
    // -----------------------------------------------------
    if (method === "DELETE" && path.startsWith("/watchlist/")) {
      const parts = path.split("/");
      const itemId = decodeURIComponent(parts[2]);

      await ddb.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { userId, itemId },
        })
      );

      return response(200, {
        ok: true,
        deleted: itemId,
      });
    }

    // -----------------------------------------------------
    // FALLBACK
    // -----------------------------------------------------
    return response(200, {
      ok: false,
      error: "Route not found",
      path,
      method,
    });
  } catch (err) {
    console.error("Internal Lambda error:", err);
    return response(200, {
      ok: false,
      error: "Internal server error",
      details: err.message,
    });
  }
};
