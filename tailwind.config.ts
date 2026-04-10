import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        campaign: {
          black: "#141414",
          red: "#E8271D",
          yellow: "#FFCE00",
          cream: "#F5F0E0",
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0, 0, 0, 0.4)",
        glow: "0 0 0 1px rgba(232,39,29,0.4), 0 12px 40px rgba(0,0,0,0.5)"
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at top left, rgba(232,39,29,0.18), transparent 55%), linear-gradient(180deg, #1c1c1c 0%, #1e1e1e 100%)"
      }
    }
  },
  plugins: []
};

export default config;
