import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
<<<<<<< HEAD

function App() {
  const [user, setUser] = useState(null);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        marginTop: "5rem",
      }}
    >
      <h1>🎬 Movie Watchlist – Google Login</h1>

      {user ? (
        <div>
          <p>Willkommen, {user.name}</p>
          <img
            src={user.picture}
            alt="Profil"
            width="80"
            style={{ borderRadius: "50%" }}
          />
          <p>{user.email}</p>
          <button onClick={() => setUser(null)}>Logout</button>
        </div>
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
=======
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
>>>>>>> 417d2b785d6bb036be53d128afa970f124a95db2
  );
}
