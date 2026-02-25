// App.jsx — root router
// Access admin at: yoursite.com/#admin  (or localhost:5173/#admin)
// The hash is never sent to the server, so it won't appear in GitHub Pages logs.

import { useState, useEffect } from "react";
import Portfolio from "./portfolio-react.jsx";
import Admin from "./admin/admin.jsx";

export default function App() {
  const [view, setView] = useState(
    window.location.hash === "#admin" ? "admin" : "portfolio"
  );

  useEffect(() => {
    const onHash = () => {
      setView(window.location.hash === "#admin" ? "admin" : "portfolio");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (view === "admin") {
    return (
      <Admin
        onExit={() => {
          window.location.hash = "";
          setView("portfolio");
        }}
      />
    );
  }

  return <Portfolio />;
}