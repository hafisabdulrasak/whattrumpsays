import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/Header";
import { BackToTopButton } from "@/components/BackToTopButton";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { Footer } from "@/components/Footer";
import { absoluteUrl, jsonLd, siteConfig } from "@/lib/seo";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "What Trump Says | Latest Trump Truth Social Posts Timeline",
    template: "%s | What Trump Says"
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: absoluteUrl("/")
  },
  category: "news",
  keywords: ["Trump posts", "Trump Truth Social posts", "Donald Trump timeline", "Trump social media archive"],
  openGraph: {
    title: "What Trump Says | Latest Trump Truth Social Posts Timeline",
    description: siteConfig.description,
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: "What Trump Says timeline preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "What Trump Says | Latest Trump Truth Social Posts Timeline",
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)]
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "black-translucent"
  },
  icons: {
    apple: "/apple-icon",
    icon: [{ url: "/icon", sizes: "512x512", type: "image/png" }],
    shortcut: ["/icon"]
  }
};

export const viewport: Viewport = {
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

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: absoluteUrl("/"),
  description: siteConfig.description,
  inLanguage: "en-US"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${display.variable}`}>
      <body className="font-sans text-[var(--text-primary)] antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(webSiteSchema)} />
        <ServiceWorkerRegistrar />
        <Header />
        {children}
        <Footer />
        <BackToTopButton />
      </body>
    </html>
  );
}
