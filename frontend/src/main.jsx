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
import { AuthProvider, useAuth } from "./state/AuthContext.jsx";
import "./css/theme.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function RequireLogin({ children }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth?.user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RootRedirect() {
  const auth = useAuth();
  return <Navigate to={auth?.user ? "/home" : "/login"} replace />;
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/home"
          element={
            <RequireLogin>
              <MainPage />
            </RequireLogin>
          }
        />

        <Route
          path="/watchlist"
          element={
            <RequireLogin>
              <WatchlistPage />
            </RequireLogin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <WatchlistProvider>
          <RatingsProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </RatingsProvider>
        </WatchlistProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
