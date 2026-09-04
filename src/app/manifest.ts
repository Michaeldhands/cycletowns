import type { MetadataRoute } from "next";

/** Makes Cycletowns installable — riders can add it to a phone home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cycletowns — find your next great ride",
    short_name: "Cycletowns",
    description: "The world's best cycling towns, ranked by the riders who rode them. Routes, café stops, bike shops and trip planning.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#01536C",
    categories: ["travel", "sports", "navigation"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Build a loop", short_name: "Loop", url: "/loop" },
      { name: "Plan a trip", short_name: "Plan", url: "/plan" },
      { name: "Saved towns", short_name: "Saved", url: "/saved" },
    ],
  };
}
