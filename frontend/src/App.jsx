import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import MainPage from "./pages/MainPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import GoogleLogin from "./components/GoogleLogin.jsx";

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleLogin = (u) => {
    setUser(u);
    navigate("/home", { replace: true });
  };

  const handleSignOut = () => {
    try {
      window.google?.accounts.id.disableAutoSelect();
    } catch {}
    localStorage.removeItem("user");
    setUser(null);
    navigate("/home", { replace: true });
  };

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route
          path="/home"
          element={
            user ? (
              <MainPage user={user} />
            ) : (
              <div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>
                <h1>Willkommen bei MovieWatchlist 🎬</h1>
                <p style={{ color: "var(--muted)" }}>
                  Melde dich mit Google an, um deine Watchlist zu verwalten.
                </p>
                <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                  <GoogleLogin onSuccess={handleLogin} />
                </div>
              </div>
            )
          }
        />

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

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Layout>
  );
}
