import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import { useAuth } from "../state/AuthContext.jsx";
import { Link } from "react-router-dom";

function AuthSection() {
  const { user, logout } = useAuth();
  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src={user.picture} alt="" width="28" height="28" style={{ borderRadius: "50%" }} />
        <span>{user.name}</span>
        <button className="btn ghost" onClick={logout}>Logout</button>
      </div>
    );
  }
  return <Link className="btn" to="/login">Sign in</Link>;
}

export default function NavBar() {
  // theme (persisted) stored on <html data-theme="...">
  const preferred =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [theme, setTheme] = useState(preferred);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleNavClick = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        {/* Left: hamburger */}
        <button
          className="hamburger btn ghost"
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        {/* Inline breadcrumbs right next to hamburger */}
        <Breadcrumbs />

        {/* Brand sits after breadcrumbs */}
        <div className="brand">
          <span className="dot" />
          <Link to="/home" style={{ textDecoration: "none", color: "inherit" }}>
            MovieWatchlist
          </Link>
        </div>

        {/* Right side kept empty (theme toggle moved into drawer) */}
        <div style={{ marginLeft: "auto" }} />
      </div>

      {/* Drawer */}
      <nav className={`drawer ${open ? "open" : ""}`} aria-label="Main">
        <div className="drawer-header">
          <span className="drawer-title">Navigate</span>
          <button className="btn ghost" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="drawer-links">
          <NavLink to="/home" className="drawer-link" onClick={handleNavClick}>
            Home
          </NavLink>
          <NavLink to="/watchlist" className="drawer-link" onClick={handleNavClick}>
            Watchlist
          </NavLink>
        </div>

        <div className="drawer-footer">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="btn ghost"
            aria-label="Toggle color scheme"
            title="Toggle color scheme"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </nav>

      {open && <div className="drawer-backdrop" onClick={() => setOpen(false)} />}
    </header>
  );
}
