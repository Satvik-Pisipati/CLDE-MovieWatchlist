import { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);
const LS_KEY = "auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || null;
    } catch {
      return null;
    }
  });

  // Save auth state when it changes
  useEffect(() => {
    if (auth) {
      localStorage.setItem(LS_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [auth]);

  // Login stores user + Google ID token
  const login = (user, token) => {
    setAuth({ user, token });
  };

  // Logout clears everything
  const logout = () => {
    setAuth(null);
  };

  // Provide token and user to entire app
  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      login,
      logout,
      isAuthenticated: !!auth?.token,
    }),
    [auth]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
