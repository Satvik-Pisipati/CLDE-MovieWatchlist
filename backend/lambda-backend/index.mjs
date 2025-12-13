import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
 
// ENV
const TABLE_NAME = process.env.TABLE_NAME;                 // MovieWatchlist
const RATINGS_TABLE_NAME = process.env.RATINGS_TABLE_NAME; // MovieRatings
const TMDB_KEY = process.env.TMDB_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
 
// DynamoDB
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
 
// Google JWKS
const jwks = jwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
});
 
function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) callback(err);
    else callback(null, key.getPublicKey());
  });
}
 
function res(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(body),
  };
}
 
async function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ["RS256"],
        audience: GOOGLE_CLIENT_ID,
        issuer: "https://accounts.google.com",
      },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }
    );
  });
}
 
export const handler = async (event) => {
  const method = event.requestContext?.http?.method;
  const path = event.rawPath;
  const qs = event.queryStringParameters || {};
 
  const idToken =
    event.headers?.["x-google-id-token"] ||
    event.headers?.["X-Google-ID-Token"];
 
  if (!idToken) {
    return res(400, { ok: false, error: "Missing Google ID token" });
  }
 
  let decoded;
  try {
    decoded = await verifyGoogleToken(idToken);
  } catch (err) {
    console.error("Google token verification failed", err);
    return res(401, { ok: false, error: "Invalid Google ID token" });
  }
 
  const userId = decoded.sub;
 
  // --------------------------------------------------
  // TMDB PROXY
  // --------------------------------------------------
  if (method === "GET" && path === "/tmdb") {
    const endpoint = qs.endpoint;
    if (!endpoint) {
      return res(400, { ok: false, error: "Missing endpoint" });
    }
 
    const url = `https://api.themoviedb.org/3/${endpoint}${
      endpoint.includes("?") ? "&" : "?"
    }api_key=${TMDB_KEY}`;
 
    try {
      const r = await fetch(url);
      const j = await r.json();
      return res(200, { ok: true, data: j });
    } catch (err) {
      console.error("TMDB ERROR", err);
      return res(500, { ok: false, error: "TMDB proxy failed" });
    }
  }
 
  // --------------------------------------------------
  // WATCHLIST
  // --------------------------------------------------
  if (method === "GET" && path === "/watchlist") {
    try {
      const dbRes = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "userId = :u",
          ExpressionAttributeValues: {
            ":u": userId,
          },
        })
      );
 
      return res(200, { ok: true, items: dbRes.Items ?? [] });
    } catch (err) {
      console.error("WATCHLIST GET ERROR", err);
      return res(500, { ok: false, error: "Failed to load watchlist" });
    }
  }
 
  if (method === "POST" && path === "/watchlist") {
    const body = JSON.parse(event.body || "{}");
 
    if (!body.itemId) {
      return res(400, { ok: false, error: "itemId is required" });
    }
 
    const { itemId, ...rest } = body;
 
    const item = {
      userId,
      itemId,
      ...rest,
      updatedAt: new Date().toISOString(),
    };
 
    try {
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
        })
      );
 
      return res(200, { ok: true, item });
    } catch (err) {
      console.error("WATCHLIST PUT ERROR", err);
      return res(500, { ok: false, error: "Failed to save item" });
    }
  }
 
  if (method === "DELETE" && path.startsWith("/watchlist/")) {
    const itemId = decodeURIComponent(path.split("/")[2]);
 
    try {
      await ddb.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { userId, itemId },
        })
      );
 
      return res(200, { ok: true, deleted: itemId });
    } catch (err) {
      console.error("WATCHLIST DELETE ERROR", err);
      return res(500, { ok: false, error: "Failed to delete item" });
    }
  }
 
  // --------------------------------------------------
  // RATINGS
  // --------------------------------------------------
  if (method === "GET" && path === "/ratings") {
    try {
      const dbRes = await ddb.send(
        new QueryCommand({
          TableName: RATINGS_TABLE_NAME,
          KeyConditionExpression: "userId = :u",
          ExpressionAttributeValues: {
            ":u": userId,
          },
        })
      );
 
      return res(200, { ok: true, items: dbRes.Items ?? [] });
    } catch (err) {
      console.error("RATINGS GET ERROR", err);
      return res(500, { ok: false, error: "Failed to load ratings" });
    }
  }
 
  if (method === "POST" && path === "/ratings") {
    const body = JSON.parse(event.body || "{}");
 
    if (!body.itemId || body.rating == null) {
      return res(400, {
        ok: false,
        error: "itemId and rating required",
      });
    }

    const {itemId, rating, ...rest} = body; // this line was added
 
/*     const item = {
      userId,
      itemId: body.itemId,
      rating: body.rating,
      updatedAt: new Date().toISOString(),
    }; */

    const item = {
      userId,
      itemId,
      rating,
      ...rest,
      updatedAt: new Date().toISOString(),
    };
 
    try {
      await ddb.send(
        new PutCommand({
          TableName: RATINGS_TABLE_NAME,
          Item: item,
        })
      );
 
      return res(200, { ok: true, item });
    } catch (err) {
      console.error("RATINGS PUT ERROR", err);
      return res(500, { ok: false, error: "Failed to save rating" });
    }
  }
 
  if (method === "DELETE" && path.startsWith("/ratings/")) {
    const itemId = decodeURIComponent(path.split("/")[2]);
 
    try {
      await ddb.send(
        new DeleteCommand({
          TableName: RATINGS_TABLE_NAME,
          Key: { userId, itemId },
        })
      );
 
      return res(200, { ok: true, deleted: itemId });
    } catch (err) {
      console.error("RATINGS DELETE ERROR", err);
      return res(500, { ok: false, error: "Failed to delete rating" });
    }
  }
 
  // --------------------------------------------------
  // FALLBACK
  // --------------------------------------------------
  return res(404, {
    ok: false,
    error: "Route not found",
    method,
    path,
  });
};
 