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
      className="focus-ring fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-50 min-h-11 rounded-full border border-[var(--border-strong)] bg-[color-mix(in_oklab,var(--bg)_90%,transparent)] px-4 py-2 text-xs font-semibold text-[var(--accent)] shadow-[var(--shadow-gold)] sm:right-6"
    >
      Back to top
    </button>
  );
}
