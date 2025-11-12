import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { WatchlistProvider } from "./state/WatchlistContext.jsx";
import { RatingsProvider } from "./state/RatingsContext.jsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <WatchlistProvider>
    <RatingsProvider>
          <App />
            </RatingsProvider>
  </WatchlistProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
