import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/Header";
import { BackToTopButton } from "@/components/BackToTopButton";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "What Trump Says",
  description: "Reverse-chronological archive interface for Donald Trump public posts."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="bg-obsidian font-sans text-parchment">
        <Header />
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}
