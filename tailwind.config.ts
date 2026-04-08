import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0a0d14",
        navy: "#111827",
        steel: "#2b3240",
        parchment: "#f4f2ea",
        gold: "#b89c5c",
        crimson: "#8b1f2b"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0, 0, 0, 0.35)",
        glow: "0 0 0 1px rgba(184,156,92,0.4), 0 12px 40px rgba(0,0,0,0.45)"
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(ellipse at top, rgba(184,156,92,0.16), transparent 65%), linear-gradient(180deg, #0a0d14 0%, #0c111a 100%)"
      }
    }
  },
  plugins: []
};

export default config;
