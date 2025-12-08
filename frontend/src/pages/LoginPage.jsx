// src/pages/LoginPage.jsx

import { useAuth } from "../state/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = (response) => {
    try {
      console.log("Google Login success:", response);

      // Google returns { credential: "<JWT>" }
      if (!response || !response.credential) {
        throw new Error("Missing credential field in Google response");
      }

      loginWithGoogle(response.credential);
      navigate("/");
    } catch (err) {
      console.error("Failed to handle Google credential:", err);
    }
  };

  const handleError = () => {
    console.error("Google Login failed");
  };

  return (
    <div className="login-page">
      <h1>Login</h1>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}
