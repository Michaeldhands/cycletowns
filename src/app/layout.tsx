import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cycletowns.com"),
  title: { default: "Cycletowns — Find your next great ride", template: "%s · Cycletowns" },
  description: "The world’s best cycling towns, ranked by the riders who rode them. Routes, café stops, bike shops, groups and trip planning.",
  openGraph: { siteName: "Cycletowns", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout applies to every page */}
        <link
          href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="lp">{children}</body>
    </html>
  );
}
