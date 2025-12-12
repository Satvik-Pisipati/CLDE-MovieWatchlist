async function api(method, url, body) {
  const token = localStorage.getItem("google_id_token");
  if (!token) throw new Error("Missing Google token");

  const res = await fetch(import.meta.env.VITE_API_URL + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-google-id-token": token
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "API error");
  return json;
}

export async function loadRatings() {
  const res = await api("GET", "/ratings");
  return res.items;
}

export async function saveRating(itemId, rating) {
  return api("POST", "/ratings", { itemId, rating });
}