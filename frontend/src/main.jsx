import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import MainPage from "./pages/MainPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import MyRatingsPage from "./pages/MyRatingsPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";

import { WatchlistProvider } from "./state/WatchlistContext.jsx";
import { RatingsProvider } from "./state/RatingsContext.jsx";

import "./css/theme.css";

function RootRedirect() {
  return <Navigate to="/home" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WatchlistProvider>
      <RatingsProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/home" element={<MainPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/ratings" element={<MyRatingsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </RatingsProvider>
    </WatchlistProvider>
  </React.StrictMode>
);
