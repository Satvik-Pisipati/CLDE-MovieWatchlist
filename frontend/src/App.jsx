import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import MainPage from "./pages/MainPage";
import WatchlistPage from "./pages/WatchlistPage";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/home");
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      <Route path="/home" element={<MainPage user={user} />} />
      <Route path="/watchlist" element={<WatchlistPage user={user} />} />
    </Routes>
  );
}

export default App;
