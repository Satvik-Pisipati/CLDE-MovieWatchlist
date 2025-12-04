import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";

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
  );
}
