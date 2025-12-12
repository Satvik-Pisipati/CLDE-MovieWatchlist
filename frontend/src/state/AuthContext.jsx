// src/state/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("google_id_token")
  );

  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("google_id_token");
    return t ? decodeJwt(t) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("google_id_token", token);
      setUser(decodeJwt(token));
    } else {
      localStorage.removeItem("google_id_token");
      setUser(null);
    }
  }, [token]);

  function loginWithGoogle(idToken) {
    setToken(idToken);
  }

  function logout() {
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}
