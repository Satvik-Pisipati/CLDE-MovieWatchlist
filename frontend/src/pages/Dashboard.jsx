import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";

function Dashboard({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        marginTop: "5rem",
      }}
    >
      <h1>🎉 Login erfolgreich!</h1>
      <p>Willkommen, {user.name}</p>
      <img
        src={user.picture}
        alt="Profil"
        width="80"
        style={{ borderRadius: "50%" }}
      />
      <p>{user.email}</p>
      <button onClick={() => navigate("/")}>Logout</button>
    </div>
  );
}

export default Dashboard;
