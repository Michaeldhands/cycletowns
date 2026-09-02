"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Geo } from "@/lib/towns";

/** Simple town map: OpenStreetMap tiles centred on the town with a ride-start marker.
    Venue pins arrive in phase 2 once places are geocoded. */
export function TownMap({ name, geo }: { name: string; geo: Geo }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false }).setView([geo.lat, geo.lng], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const icon = L.divIcon({
        className: "",
        html: '<div style="width:34px;height:34px;border-radius:50%;background:#FD3D35;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:17px">🚴</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker([geo.lat, geo.lng], { icon }).addTo(map).bindPopup(`<b>${name}</b><br>Routes &amp; climbs roll out from here`);
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [geo.lat, geo.lng, name]);
  return <div className="leafmap" ref={ref} aria-label={`Map of ${name}`} />;
}
