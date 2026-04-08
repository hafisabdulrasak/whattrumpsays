import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/Header";
import { BackToTopButton } from "@/components/BackToTopButton";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "What Trump Says",
  description: "Reverse-chronological archive interface for Donald Trump public posts.",
  applicationName: "What Trump Says",
  appleWebApp: {
    capable: true,
    title: "What Trump Says",
    statusBarStyle: "black-translucent"
  },
  icons: {
    apple: "/apple-icon",
    icon: [
      { url: "/icon", sizes: "512x512", type: "image/png" }
    ]
  }
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0c10" },
    { media: "(prefers-color-scheme: light)", color: "#f2eee4" }
  ]
};

const themeInitScript = `
(() => {
  const key = "wts-theme";
  const root = document.documentElement;
  const stored = localStorage.getItem(key);
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const choice = stored === "light" || stored === "dark" ? stored : (systemDark ? "dark" : "light");
  root.classList.remove("light", "dark");
  root.classList.add(choice);
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${display.variable}`}>
      <body className="font-sans text-[var(--text-primary)] antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ServiceWorkerRegistrar />
        <Header />
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}
