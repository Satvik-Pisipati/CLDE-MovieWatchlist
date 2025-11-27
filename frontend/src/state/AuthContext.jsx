import { createContext, useContext, useMemo, useState, useEffect } from "react";

const LS_KEY = "auth";

// Default-Werte, damit useAuth nie undefined-Felder hat
const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_KEY));
      if (stored && typeof stored === "object") {
        return {
          user: stored.user ?? null,
          token: stored.token ?? null,
        };
      }
    } catch {
      // ignore
    }
    return { user: null, token: null };
  });

  useEffect(() => {
    // Nur speichern, wenn wirklich etwas da ist
    if (auth && (auth.user || auth.token)) {
      localStorage.setItem(LS_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [auth]);

  const login = (user, token) => setAuth({ user, token });
  const logout = () => setAuth({ user: null, token: null });

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
