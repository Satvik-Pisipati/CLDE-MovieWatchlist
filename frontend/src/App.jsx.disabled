import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import MainPage from "./pages/MainPage";
import WatchlistPage from "./pages/WatchlistPage";
import MyRatingsPage from "./pages/MyRatingsPage";

export default function App() {
  const navigate = useNavigate();

  // Load user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Login callback
  const handleLogin = (u) => {
    setUser(u);
    navigate("/home", { replace: true });
  };

  // Logout
  const handleSignOut = () => {
    try {
      window.google?.accounts.id.disableAutoSelect();
    } catch {}
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login onLogin={handleLogin} />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard user={user} onSignOut={handleSignOut} />} />

      {/* Main search page */}
      <Route path="/home" element={<MainPage user={user} />} />

      {/* Watchlist */}
      <Route path="/watchlist" element={<WatchlistPage user={user} />} />

      {/* Ratings */}
      <Route path="/ratings" element={<MyRatingsPage user={user} />} />
    </Routes>
  );
}
