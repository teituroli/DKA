// useConfig.js
// Loads /public/config.json at runtime.
// The portfolio reads everything from this — no hardcoded content.
//
// In development: Vite serves public/config.json directly at /config.json
// In production:  GitHub Pages serves it from the same path

import { useState, useEffect } from "react";

const FALLBACK = {
  site: {
    name: "Your Name",
    tagline: "Furniture · Space · Material",
    school: "Royal Danish Academy",
    email: "your@email.com",
    cvFile: "",
    manifesto: "Add your manifesto in the admin panel.",
    manifestoAccents: [],
  },
  photos: [],
  svgs: [],
  projects: [],
  cv: { education: [], exhibitions: [], experience: [], tools: [] },
};

export function useConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/config.json?" + Date.now())  // cache-bust so admin changes appear immediately
      .then(r => {
        if (!r.ok) throw new Error("config.json not found");
        return r.json();
      })
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(e => {
        console.warn("Could not load config.json, using fallback:", e.message);
        setConfig(FALLBACK);
        setLoading(false);
        setError(e.message);
      });
  }, []);

  return { config, loading, error };
}

// Helper: get the public URL for a file in /public/photos/ or /public/svgs/
export const photoUrl = filename => `/photos/${filename}`;
export const svgUrl   = filename => `/svgs/${filename}`;
