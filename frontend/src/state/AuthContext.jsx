// src/state/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "google_id_token";

const AuthContext = createContext(null);

export function getStoredGoogleIdToken() {
  return localStorage.getItem(STORAGE_KEY);
}

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return {
      sub: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredGoogleIdToken());
  const [user, setUser] = useState(() => (token ? decodeJwt(token) : null));

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      setUser(decodeJwt(token));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      loginWithGoogle: (idToken) => setToken(idToken),
      logout: () => setToken(null),
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
