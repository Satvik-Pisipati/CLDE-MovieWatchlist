import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <h1>Sign In</h1>

      <GoogleLogin
        onSuccess={(res) => {
          if (!res?.credential) return;
          loginWithGoogle(res.credential);
          navigate("/", { replace: true });
        }}
        onError={() => console.error("Google Login failed")}
      />
    </div>
  );
}
