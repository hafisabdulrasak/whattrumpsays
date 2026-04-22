import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        campaign: {
          orange: "#F59E0B",
          blue: "#2D2AA6",
          red: "#E11D48",
          offwhite: "#F5F5F5",
          dark: "#1F2937",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Anton", "Impact", "sans-serif"],
        heading: ["var(--font-heading)", "Oswald", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      boxShadow: {
        panel: "0 4px 20px rgba(45,42,166,0.10)",
        glow:  "0 0 0 2px rgba(245,158,11,0.5), 0 8px 24px rgba(45,42,166,0.15)"
      },
      backgroundImage: {
        "hero-gradient": "none",
        "orange-stripe": "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 4px, transparent 4px, transparent 14px)"
      }
    }
  },
  plugins: []
};

export default config;
