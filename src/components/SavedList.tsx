"use client";
import Link from "next/link";
import { useSaved } from "./SaveButton";
import { TownCard } from "./Cards";
import { getLiteTown, getTown } from "@/lib/towns";

export function SavedList() {
  const ids = useSaved();
  if (!ids.length)
    return (
      <p style={{ textAlign: "center", color: "var(--grey-d)" }}>
        Nothing saved yet. Tap <b>♡ Save</b> on any town guide. <Link href="/towns">Explore towns ›</Link>
      </p>
    );
  const full = ids.map(getTown).filter(Boolean);
  const lite = ids.map(getLiteTown).filter(Boolean);
  return (
    <>
      <div className="wgrid">{full.map((t) => t && <TownCard key={t.id} t={t} />)}</div>
      {lite.length > 0 && (
        <div className="litegrid" style={{ marginTop: 16 }}>
          {lite.map((t) => t && (
            <Link key={t.slug} href={`/towns/${t.slug}`} className="litechip"><span>{t.flag}</span><b>{t.name}</b><small>{t.region} · {t.country}</small></Link>
          ))}
        </div>
      )}
    </>
  );
}
