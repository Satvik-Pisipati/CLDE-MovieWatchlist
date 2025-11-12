import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../state/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If you prefer "return to where they came from", keep this:
  // const redirectTo = location.state?.from?.pathname || "/home";
  // For a strict redirect to /home after login, just use "/home".
  const redirectTo = location.state?.from?.pathname || "/home";

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${backendUrl}/auth/google`, {
        credential: credentialResponse.credential,
      });

      const { user, token } = res.data || {};
      if (!user || !token) throw new Error("Invalid auth response (missing user/token)");

      // Store in global auth context (persists to localStorage via provider)
      auth.login(user, token);

      // Send the user to the main search page
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    }
  };

  const handleError = () => {
    console.error("Google Login failed");
    alert("Google Login failed. Please try again.");
  };

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "sans-serif",
        marginTop: "5rem",
        padding: "0 1rem",
      }}
    >
      <h1>🎬 Movie Watchlist</h1>
      <p>Please sign in with Google to search movies and access your Watchlist.</p>
      <div style={{ display: "inline-block", marginTop: "1rem" }}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap />
      </div>
    </div>
  );
}
