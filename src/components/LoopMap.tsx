"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { LoopPoint } from "@/lib/loops";

/** Draws a loop on OpenStreetMap and fits the view to it. */
export function LoopMap({ coords, start, height = 380, onPick }: { coords: LoopPoint[]; start?: { lat: number; lng: number; name?: string }; height?: number; onPick?: (p: { lat: number; lng: number }) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const pick = useRef(onPick);
  useEffect(() => {
    pick.current = onPick;
  }, [onPick]);
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      const latlngs = coords.map((c) => [c[1], c[0]] as [number, number]);
      map = L.map(ref.current, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · routing © <a href="https://openrouteservice.org/">OpenRouteService</a>',
      }).addTo(map);
      if (latlngs.length) {
        L.polyline(latlngs, { color: "#01536C", weight: 5, opacity: 0.9 }).addTo(map);
        L.polyline(latlngs, { color: "#FD3D35", weight: 2, opacity: 0.9 }).addTo(map);
        map.fitBounds(L.latLngBounds(latlngs), { padding: [24, 24] });
      }
      const s = start || (latlngs.length ? { lat: latlngs[0][0], lng: latlngs[0][1] } : undefined);
      if (s) {
        const icon = L.divIcon({
          className: "",
          html: '<div style="width:30px;height:30px;border-radius:50%;background:#FD3D35;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:15px">🚴</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        L.marker([s.lat, s.lng], { icon }).addTo(map).bindPopup(s.name ? `<b>Start:</b> ${s.name}` : "Start");
      }
      if (!latlngs.length && s) map.setView([s.lat, s.lng], 12);
      if (pick.current) map.on("click", (e: import("leaflet").LeafletMouseEvent) => pick.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [coords, start]);
  return <div className="leafmap" ref={ref} style={{ height }} aria-label="Loop route map" />;
}
