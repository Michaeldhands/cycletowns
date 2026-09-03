"use client";
import { toGpx, type LoopPoint } from "@/lib/loops";
import { slugify } from "@/lib/towns";

/** Download a saved loop as GPX. */
export function LoopDownload({ name, coords, townName }: { name: string; coords: LoopPoint[]; townName: string }) {
  return (
    <button
      className="lk-ghost"
      onClick={() => {
        const blob = new Blob([toGpx(name, coords, townName)], { type: "application/gpx+xml" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${slugify(name)}.gpx`;
        a.click();
        URL.revokeObjectURL(a.href);
      }}
    >
      ⬇ GPX
    </button>
  );
}
