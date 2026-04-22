import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "What Trump Says",
    short_name: "WTS",
    description: "Premium reverse-chronological archive interface for Donald Trump public posts.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F59E0B",
    theme_color: "#2D2AA6",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png"
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png"
      },
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
