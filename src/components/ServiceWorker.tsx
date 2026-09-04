"use client";
import { useEffect } from "react";

/** Registers the service worker so Cycletowns is installable and readable offline. */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (location.hostname === "localhost") return; // don't cache during development
    const t = setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* an unsupported or private-mode browser simply goes without */
      });
    }, 1200); // let the page finish loading first
    return () => clearTimeout(t);
  }, []);
  return null;
}
