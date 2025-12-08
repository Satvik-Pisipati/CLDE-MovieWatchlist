// src/state/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("google_id_token"));
  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem("google_id_token");
      return t ? decodeJwt(t) : null;
    } catch {
      return null;
    }
  });

  // Save JWT in localStorage and decode it
  useEffect(() => {
    if (token) {
      localStorage.setItem("google_id_token", token);
      setUser(decodeJwt(token));
    } else {
      localStorage.removeItem("google_id_token");
      setUser(null);
    }
  }, [token]);

  const loginWithGoogle = (credential) => {
    console.log("Saving Google credential:", credential);
    setToken(credential);
  };

  const logout = () => {
    localStorage.removeItem("google_id_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      sub: decoded.sub,
    };
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    return null;
  }
}
