import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import MainPage from "./pages/MainPage";
import WatchlistPage from "./pages/WatchlistPage";
import MyRatingsPage from "./pages/MyRatingsPage";

function App() {
  const [user, setUser] = useState(null);
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
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      <Route path="/home" element={<MainPage user={user} />} />
      <Route path="/watchlist" element={<WatchlistPage user={user} />} />
      <Route path="/ratings" element={<MyRatingsPage user={user} />} />
    </Routes>
  );
}
