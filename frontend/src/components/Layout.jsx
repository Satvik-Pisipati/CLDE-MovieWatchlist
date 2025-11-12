import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "dark"
  );

  const navigate = useNavigate();
  const location = useLocation();

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
    navigate(path);
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // --- NEW: simple sign-out handler ---
  const handleSignOut = () => {
    try {
      localStorage.removeItem("user");
    } catch {}
    navigate("/home", { replace: true });
  };

  return (
    <>
      {/* === TOP NAVBAR (one line: hamburger + sign out) === */}
      <nav className="navbar" role="navigation" aria-label="Top">
        <div className="navbar-inner">
          <button
            className="hamburger btn ghost"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span style={{ fontSize: "1.2rem" }}>☰</span>
          </button>

          {/* keep layout; push sign out to the right */}
          <div style={{ flex: 1 }} />

          {/* NEW: Sign out button (top-right) */}
          <button className="btn ghost" onClick={handleSignOut}>
            Sign out
          </button>
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
