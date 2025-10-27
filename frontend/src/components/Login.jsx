import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Login({ onLogin }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${backendUrl}/auth/google`, {
        credential: credentialResponse.credential,
      });
      if (res.data.success) {
        console.log("✅ Login erfolgreich:", res.data.user);
        onLogin(res.data.user);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleError = () => {
    console.error("Google Login failed");
  };

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "sans-serif",
        marginTop: "5rem",
      }}
    >
      <h1>🎬 Movie Watchlist – Google Login</h1>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap />
    </div>
  );
}

export default Login;
