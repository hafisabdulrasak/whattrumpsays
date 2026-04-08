"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "wts-theme";

type ThemeMode = "light" | "dark";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const root = document.documentElement;
    const isLight = root.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    root.classList.remove("light", "dark");
    root.classList.add(next);
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="focus-ring rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle color theme"}
      title="Toggle theme"
    >
      {mounted && theme === "dark" ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
    </button>
  );
}
