import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Layout from "./components/Layout.jsx";
import MainPage from "./pages/MainPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import LoginPage from "./components/Login.jsx";
import { WatchlistProvider } from "./state/WatchlistContext.jsx";
<<<<<<< HEAD
import { RatingsProvider } from "./state/RatingsContext.jsx";
=======
import { AuthProvider, useAuth } from "./state/AuthContext.jsx";
import "./css/theme.css";
>>>>>>> d5e100757772b7dcaa8e8e67aeb1feaf8d810fad

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
<<<<<<< HEAD
    <RatingsProvider>
          <App />
            </RatingsProvider>
  </WatchlistProvider>
      </BrowserRouter>
=======
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<RootRedirect />} />

                {/* Public (only page visible when logged out) */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected pages */}
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

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </WatchlistProvider>
      </AuthProvider>
>>>>>>> d5e100757772b7dcaa8e8e67aeb1feaf8d810fad
    </GoogleOAuthProvider>
  </React.StrictMode>
);
