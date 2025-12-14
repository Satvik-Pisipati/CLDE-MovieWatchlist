import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const { currentUser, isAuthenticated, logout } = useAuth();

  const closeDrawer = () => setDrawerOpen(false);

  // sync theme to <html data-theme="">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Top navbar */}
      <header className="navbar">
        <div className="navbar-inner">
          <button
            className="hamburger btn ghost"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>

          <strong style={{ marginLeft: 8, fontSize: "1.1rem" }}>
            MovieWatchlist 🎬
          </strong>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {isAuthenticated && currentUser && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {currentUser.picture && (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name || currentUser.email}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <span style={{ fontSize: "0.9rem" }}>
                  {currentUser.name || currentUser.email}
                </span>
              </div>
            )}
            {isAuthenticated && (
              <button className="btn ghost" onClick={logout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Side drawer */}
      <aside className={`drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <span style={{ fontWeight: 600 }}>Navigation</span>
          <button className="btn ghost" onClick={closeDrawer}>
            ✕
          </button>
        </div>

        <div className="drawer-links">
          <NavLink
            to="/home"
            className="drawer-link"
            onClick={closeDrawer}
          >
            Home
          </NavLink>

          <NavLink
            to="/watchlist"
            className="drawer-link"
            onClick={closeDrawer}
          >
            Watchlist
          </NavLink>

          <NavLink
            to="/ratings"
            className="drawer-link"
            onClick={closeDrawer}
          >
            Meine Bewertungen
          </NavLink>

          <NavLink
            to="/stats"
            className="drawer-link"
            onClick={closeDrawer}
          >
            Statistik
          </NavLink>

        </div>

        {/* Bottom of drawer: ONLY theme toggle */}
        <div
          className="drawer-footer"
          style={{
            marginTop: "auto",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <button className="btn ghost" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
      </aside>

      {drawerOpen && (
        <div className="drawer-backdrop" onClick={closeDrawer} />
      )}

      <main style={{ paddingTop: "64px" }}>
        <Outlet />
      </main>
    </div>
  );
}
