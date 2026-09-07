"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ImageUpload } from "./Upload";
import { SLOTS, bannerSrc, type Banner, type BannerMap } from "@/lib/banners";

/** Replace the stock photography on the landing, membership and partner pages. */
export function BannersEditor({ banners: initial }: { banners: BannerMap }) {
  const [banners, setBanners] = useState<BannerMap>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const save = async (slot: string, patch: Partial<Banner>) => {
    setBusy(slot);
    const prev: Banner = banners[slot] || { slot, img: null, alt: null, credit: null };
    const row: Banner = { ...prev, ...patch, slot };
    const { error } = await supabaseBrowser().from("banners").upsert(row, { onConflict: "slot" });
    setBusy(null);
    if (error) return alert(error.message);
    setBanners({ ...banners, [slot]: row });
  };

  const reset = async (slot: string) => {
    if (!confirm("Put the stock photo back in this slot?")) return;
    setBusy(slot);
    const { error } = await supabaseBrowser().from("banners").delete().eq("slot", slot);
    setBusy(null);
    if (error) return alert(error.message);
    const next = { ...banners };
    delete next[slot];
    setBanners(next);
  };

  return (
    <div className="acard">
      <h3>Banner images</h3>
      <div className="csub">
        The decorative photography across the site. Upload your own and it replaces the stock image everywhere that slot
        appears. These are riding shots, not photos of a named place — a photo shown under the name of a town or business
        has to genuinely be that place, and those are edited on the town and event pages instead.
      </div>

      <div className="bngrid">
        {SLOTS.map((d) => {
          const b = banners[d.slot];
          const custom = Boolean(b?.img);
          return (
            <div className="bncard" key={d.slot}>
              <div className={"bnimg " + d.ratio}>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                <img src={bannerSrc(banners, d.slot, 480)} alt="" />
                <span className={"bnbadge" + (custom ? " on" : "")}>{custom ? "Yours" : "Stock"}</span>
              </div>
              <div className="bnb">
                <div className="bnl">{d.label}</div>
                <div className="bnw">{d.where}</div>
                <div className="wbar" style={{ marginTop: 8, gap: 6 }}>
                  <ImageUpload folder={`banners/${d.slot}`} onDone={(url) => save(d.slot, { img: url })} label={custom ? "Replace" : "Upload"} />
                  <button className="lk-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setOpen(open === d.slot ? null : d.slot)}>
                    Details
                  </button>
                  {custom && (
                    <button className="lk-ghost" style={{ fontSize: 12, padding: "5px 10px", borderColor: "var(--coral)", color: "var(--coral-700)" }} onClick={() => reset(d.slot)}>
                      {busy === d.slot ? "…" : "Reset"}
                    </button>
                  )}
                </div>
                {open === d.slot && (
                  <div style={{ marginTop: 10 }}>
                    <div className="field">
                      <label>What the photo shows</label>
                      <input
                        defaultValue={b?.alt || ""}
                        placeholder="Riders climbing above Bright at dawn"
                        onBlur={(e) => save(d.slot, { alt: e.target.value || null })}
                      />
                      <small style={{ color: "var(--grey-m)", fontSize: 11.5 }}>Read aloud by screen readers. Leave blank if purely decorative.</small>
                    </div>
                    <div className="field">
                      <label>Credit</label>
                      <input
                        defaultValue={b?.credit || ""}
                        placeholder="Photographer or source"
                        onBlur={(e) => save(d.slot, { credit: e.target.value || null })}
                      />
                      <small style={{ color: "var(--grey-m)", fontSize: 11.5 }}>Shown on the image credits page when set. Add it if the licence requires attribution.</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
