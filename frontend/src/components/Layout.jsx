// frontend/src/components/Layout.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "dark"
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // <-- use auth context

  // Apply & persist theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  const handleNav = (path) => {
    setDrawerOpen(false);
    // If trying to open /watchlist while logged out, go to /login instead
    if (path === "/watchlist" && !user) {
      navigate("/login", { replace: true });
    } else {
      navigate(path);
    }
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Use context logout and send to /login
  const handleSignOut = () => {
    logout(); // clears localStorage["auth"] and context
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* === TOP NAVBAR (one line: hamburger + auth area) === */}
      <nav className="navbar" role="navigation" aria-label="Top">
        <div className="navbar-inner">
          <button
            className="hamburger btn ghost"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span style={{ fontSize: "1.2rem" }}>☰</span>
          </button>

          <div style={{ flex: 1 }} />

          {/* Auth area (right) */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  width="28"
                  height="28"
                  style={{ borderRadius: "50%" }}
                />
              )}
              <span>{user.name || user.email}</span>
              <button className="btn ghost" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <Link className="btn" to="/login">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* === DRAWER & BACKDROP === */}
      {drawerOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`drawer ${drawerOpen ? "open" : ""}`}
        aria-label="Main menu"
        aria-hidden={!drawerOpen}
      >
        <div className="drawer-header">
          <strong className="drawer-title">Menu</strong>
          <button
            className="btn ghost"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <span style={{ fontSize: "1.1rem" }}>✕</span>
          </button>
        </div>

        <div className="drawer-links">
          <button className="drawer-link" onClick={() => handleNav("/home")}>
            Home
          </button>
          <button
            className="drawer-link"
            onClick={() => handleNav("/watchlist")}
          >
            Watchlist
          </button>
        </div>

        <div className="drawer-footer">
          <button
            onClick={toggleTheme}
            className="btn ghost"
            style={{ width: "100%" }}
          >
            {theme === "dark" ? (
              <>
                <span>☀️</span> Light Mode
              </>
            ) : (
              <>
                <span>🌙</span> Dark Mode
              </>
            )}
          </button>
        </div>
      </aside>

      {/* === PAGE CONTENT === */}
      <main>{children}</main>
    </>
  );
}
