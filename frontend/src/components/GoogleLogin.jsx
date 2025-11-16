import { useEffect, useRef } from "react";
import { useAuth } from "../state/AuthContext.jsx";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function GoogleLogin() {
  const btnRef = useRef(null);
  const { login } = useAuth();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const r = await fetch(`${BACKEND}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          });
          if (!r.ok) throw new Error("Auth failed");
          const { user, token } = await r.json();
          login(user, token);
        } catch (e) {
          console.error(e);
          alert("Login fehlgeschlagen. Bitte erneut versuchen.");
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: 260,
    });

    // Optional one-tap
    window.google.accounts.id.prompt();
  }, [login]);

  return <div ref={btnRef} />;
}
