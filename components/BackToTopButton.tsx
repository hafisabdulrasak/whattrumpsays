"use client";

import { useEffect, useState } from "react";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="focus-ring fixed bottom-6 right-6 z-50 rounded-full border border-gold/40 bg-obsidian/90 px-4 py-2 text-xs font-semibold text-gold shadow-glow"
    >
      Back to top
    </button>
  );
}
