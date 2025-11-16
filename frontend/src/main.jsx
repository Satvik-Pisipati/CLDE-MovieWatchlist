import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Layout from "./components/Layout.jsx";
import MainPage from "./pages/MainPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import LoginPage from "./components/Login.jsx";
import { WatchlistProvider } from "./state/WatchlistContext.jsx";
import { RatingsProvider } from "./state/RatingsContext.jsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Guard: only render children if logged in, otherwise go to /login
function RequireLogin({ children }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth?.user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Root redirect: / -> /home if signed in, else /login
function RootRedirect() {
  const auth = useAuth();
  return <Navigate to={auth?.user ? "/home" : "/login"} replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <WatchlistProvider>
    <RatingsProvider>
          <App />
            </RatingsProvider>
  </WatchlistProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
