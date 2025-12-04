import { Link, useLocation } from "react-router-dom";

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  // Always start with Home -> /home
  // Skip a duplicate "home" segment after the first crumb
  const tail = parts[0] === "home" ? parts.slice(1) : parts;

  const crumbs = [
    { name: "Home", to: "/home" },
    ...tail.map((p, i) => {
      const to = "/" + (parts[0] === "home"
        ? ["home", ...tail.slice(0, i + 1)].join("/")
        : parts.slice(0, i + 1).join("/"));
      const label = p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { name: label, to };
    }),
  ];

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs inline">
      {crumbs.map((c, i) => (
        <span key={i} className="crumb">
          {i < crumbs.length - 1 ? <Link to={c.to}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
          {i < crumbs.length - 1 && <span className="sep">/</span>}
        </span>
      ))}
    </nav>
  );
}
