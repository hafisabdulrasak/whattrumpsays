import type { Metadata, Viewport } from "next";
import { Inter, Anton, Oswald } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/Header";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BackToTopButton } from "@/components/BackToTopButton";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { Footer } from "@/components/Footer";
import { absoluteUrl, jsonLd, siteConfig } from "@/lib/seo";

const body    = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const heading = Oswald({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-heading" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "What Trump Says | Latest Trump Truth Social Posts Timeline",
    template: "%s | What Trump Says"
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: absoluteUrl("/"),
    types: { "application/rss+xml": absoluteUrl("/api/feed.xml") },
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#2D2AA6",
};


const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: absoluteUrl("/"),
  description: siteConfig.description,
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/timeline")}?q={search_term_string}` },
    "query-input": "required name=search_term_string"
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: absoluteUrl("/"),
  description: siteConfig.description,
  logo: { "@type": "ImageObject", url: absoluteUrl("/icon") }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${display.variable} ${heading.variable}`}>
      <body className="font-sans text-[var(--text-primary)] antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(webSiteSchema)} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationSchema)} />
        <ServiceWorkerRegistrar />
        <ReadingProgress />
        <Header />
        {children}
        <Footer />
        <BackToTopButton />
      </body>
    </html>
  );
}
