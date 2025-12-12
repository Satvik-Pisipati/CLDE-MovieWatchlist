// src/pages/LoginPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../state/AuthContext.jsx";

export default function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  return (
    <div className="login-page">
      <h1>Sign In</h1>
      <p>Please login with Google to continue</p>

      <GoogleLogin
        onSuccess={(response) => {
          if (!response?.credential) return;
          loginWithGoogle(response.credential);
          navigate("/", { replace: true });
        }}
        onError={() => console.error("Google Login failed")}
      />
    </div>
  );
}
