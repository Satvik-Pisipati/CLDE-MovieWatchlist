<<<<<<< HEAD
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import MainPage from "./pages/MainPage";
import WatchlistPage from "./pages/WatchlistPage";
import MyRatingsPage from "./pages/MyRatingsPage";
=======
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
>>>>>>> d5e100757772b7dcaa8e8e67aeb1feaf8d810fad

import Layout from "./components/Layout.jsx";
import MainPage from "./pages/MainPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import GoogleLogin from "./components/GoogleLogin.jsx";

/**
 * App.jsx
 * - Handles Google Sign-In and Sign-Out
 * - Stores user info in localStorage
 * - Passes user to Layout and pages
 */
export default function App() {
  const navigate = useNavigate();

  // Load stored user if available
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Persist user changes
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Handle Google login success
  const handleLogin = (u) => {
    setUser(u);
    navigate("/home", { replace: true });
  };

  // Handle sign out
  const handleSignOut = () => {
    try {
      window.google?.accounts.id.disableAutoSelect();
    } catch {}
    localStorage.removeItem("user");
    setUser(null);
    navigate("/home", { replace: true });
  };

  return (
<<<<<<< HEAD
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      <Route path="/home" element={<MainPage user={user} />} />
      <Route path="/watchlist" element={<WatchlistPage user={user} />} />
      <Route path="/ratings" element={<MyRatingsPage user={user} />} />
    </Routes>
=======
    <Layout>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Home page */}
        <Route
          path="/home"
          element={
            user ? (
              <MainPage user={user} />
            ) : (
              <div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>
                <h1>Welcome to MovieWatchlist 🎬</h1>
                <p style={{ color: "var(--muted)" }}>Sign in with Google to start managing your watchlist.</p>
                <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                  <GoogleLogin onSuccess={handleLogin} />
                </div>
              </div>
            )
          }
        />

        {/* Watchlist page (requires login) */}
        <Route
          path="/watchlist"
          element={
            user ? (
              <WatchlistPage user={user} />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Layout>
>>>>>>> d5e100757772b7dcaa8e8e67aeb1feaf8d810fad
  );
}
