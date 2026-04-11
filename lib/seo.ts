import type { Metadata } from "next";

const FALLBACK_URL = "https://www.whattrumpsays.com";

export const siteConfig = {
  name: "What Trump Says",
  shortName: "WhatTrumpSays",
  description:
    "Track Donald Trump's latest public Truth Social posts in a fast, editorial timeline with timestamps, source attribution, and archived history.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_URL,
  locale: "en_US",
  ogImage: "/opengraph-image"
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function buildMetadata({
  title,
  description,
  path,
  type = "website"
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: absoluteUrl(siteConfig.ogImage),
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} preview`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(siteConfig.ogImage)]
    }
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data)
  };
}
