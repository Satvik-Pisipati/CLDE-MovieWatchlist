import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);
const LS_KEY = "auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) localStorage.setItem(LS_KEY, JSON.stringify(auth));
    else localStorage.removeItem(LS_KEY);
  }, [auth]);

  // wird beim Login aufgerufen (von deinem Login-Komponent)
  const login = (user, token) => setAuth({ user, token });
  const logout = () => setAuth(null);

  const value = useMemo(
    () => ({ ...auth, login, logout }),
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
