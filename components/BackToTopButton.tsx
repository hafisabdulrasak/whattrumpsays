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
      className="focus-ring fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-50 min-h-11 rounded-full border-2 border-[#2D2AA6] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2D2AA6] shadow-[0_4px_16px_rgba(45,42,166,0.20)] transition hover:bg-[#2D2AA6] hover:text-[#F59E0B] sm:right-6"
    >
      Back to top
    </button>
  );
}
