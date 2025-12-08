// index.mjs - Backend without Cognito

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import fetch from "node-fetch";

const TABLE_NAME = process.env.TABLE_NAME || "MovieWatchlist";
const TMDB_KEY = process.env.TMDB_KEY;

// DynamoDB client
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Using a fixed user ID (no Cognito)
const USER_ID = "demo-user";

function json(status, body) {
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

export const handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  const method = event.requestContext?.http?.method;
  const rawPath = event.rawPath || event.requestContext?.http?.path;

  try {
    // GET /watchlist
    if (method === "GET" && rawPath === "/watchlist") {
      const data = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": USER_ID },
        })
      );
      return json(200, data.Items || []);
    }

    // POST /watchlist
    if (method === "POST" && rawPath === "/watchlist") {
      const body = JSON.parse(event.body || "{}");

      if (!body.itemId) return json(400, { error: "itemId required" });

      const item = {
        userId: USER_ID,
        itemId: body.itemId,
        title: body.title,
        mediaType: body.mediaType,
        status: body.status,
        rating: body.rating,
        updatedAt: new Date().toISOString(),
      };

      await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      return json(200, item);
    }

    // DELETE /watchlist/{itemId}
    if (method === "DELETE" && rawPath.startsWith("/watchlist/")) {
      const itemId = decodeURIComponent(rawPath.split("/")[2]);
      await ddb.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { userId: USER_ID, itemId },
        })
      );
      return json(204, {});
    }

    return json(404, { message: "Not found" });

  } catch (err) {
    console.error("ERROR:", err);
    return json(500, { message: "Internal Server Error", error: err.message });
  }
};
