import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MainPage from "./pages/MainPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import MyRatingsPage from "./pages/MyRatingsPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

import { WatchlistProvider } from "./state/WatchlistContext.jsx";
import { RatingsProvider } from "./state/RatingsContext.jsx";
import { AuthProvider } from "./state/AuthContext.jsx";

import "./css/theme.css";

function RootRedirect() {
  return <Navigate to="/home" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <WatchlistProvider>
          <RatingsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/home" element={<MainPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="/ratings" element={<MyRatingsPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </RatingsProvider>
        </WatchlistProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
