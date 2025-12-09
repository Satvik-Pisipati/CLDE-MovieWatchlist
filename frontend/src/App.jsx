import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import MainPage from "./pages/MainPage";
import WatchlistPage from "./pages/WatchlistPage";
import MyRatingsPage from "./pages/MyRatingsPage";

import { AuthProvider } from "./state/AuthContext";
import { WatchlistProvider } from "./state/WatchlistContext";
import { RatingsProvider } from "./state/RatingsContext";

export default function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <RatingsProvider>
          <AppRoutes />
        </RatingsProvider>
      </WatchlistProvider>
    </AuthProvider>
  );
}

// actual routes moved into a component because provider cannot be inside <Routes>
function AppRoutes() {
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
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const handleLogin = (u) => {
    setUser(u);
    navigate("/home", { replace: true });
  };

  const handleSignOut = () => {
    window.google?.accounts.id.disableAutoSelect?.();
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/dashboard" element={<Dashboard user={user} onSignOut={handleSignOut} />} />
      <Route path="/home" element={<MainPage user={user} />} />
      <Route path="/watchlist" element={<WatchlistPage user={user} />} />
      <Route path="/ratings" element={<MyRatingsPage user={user} />} />
    </Routes>
  );
}
