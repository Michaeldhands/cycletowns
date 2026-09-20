import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";
import { DEFAULT_LOCALE, HTML_LANG } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Cycletowns — Find your next great ride", template: "%s · Cycletowns" },
  description: "The world’s best cycling towns, ranked by the riders who rode them. Routes, café stops, bike shops, groups and trip planning.",
  openGraph: { siteName: "Cycletowns", type: "website", locale: HTML_LANG[DEFAULT_LOCALE].replace("-", "_") },
  // Every page inherits a canonical of its own path unless it sets one. Without this, a page
  // reached with a tracking or state query string looks to a crawler like a separate URL.
  alternates: { canonical: "./" },
  appleWebApp: { capable: true, title: "Cycletowns", statusBarStyle: "default" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={HTML_LANG[DEFAULT_LOCALE]}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout applies to every page */}
        <link
          href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="lp">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
