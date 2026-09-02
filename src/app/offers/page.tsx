import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { currentUser, isMember, supabaseServer } from "@/lib/supabase/server";
import { getTown } from "@/lib/towns";

export const metadata: Metadata = { title: "Member offers" };
export const dynamic = "force-dynamic";

type Offer = { id: string; partner: string; title: string; description: string; code: string | null; url: string | null; town_id: string | null; members_only: boolean };

export default async function Offers() {
  const me = await currentUser();
  const member = isMember(me?.profile);
  const sb = await supabaseServer();
  const { data } = await sb.from("offers").select("*").eq("active", true).order("sort");
  const offers = (data as Offer[]) || [];
  return (
    <ProsePage kick="Member offers" title="Riders-only deals." lead="Offers from partners who want Cycletowns riders through the door. Codes are shown to Insiders." wide>
      {offers.length === 0 && <div className="unlocknote" style={{ fontSize: 14, padding: 16, maxWidth: 640, margin: "0 auto" }}>No offers listed yet — the first partners are being signed up now. {!member && <><Link href="/membership#insider">Go Insider</Link> to be first in line.</>}</div>}
      <div className="wgrid g3">
        {offers.map((o) => {
          const t = o.town_id ? getTown(o.town_id) : null;
          const locked = o.members_only && !member;
          return (
            <div className="wcard" style={{ padding: 18 }} key={o.id}>
              <div className="wsub">{o.partner}{t ? ` · ${t.name}` : ""}</div>
              <div className="wcn" style={{ marginTop: 4, fontSize: 16 }}>{o.title}</div>
              <div className="wcd" style={{ WebkitLineClamp: 4 }}>{o.description}</div>
              {o.code && (
                <div className={"codebox" + (locked ? " locked" : "")} style={{ marginTop: 10 }}>
                  <span className={locked ? "lockcode" : ""}>{locked ? "••••••" : o.code}</span>
                  {locked ? <span className="lockpill">Insiders</span> : <span style={{ fontSize: 11, fontWeight: 800 }}>use at checkout</span>}
                </div>
              )}
              {o.url && !locked && <a className="wlink" href={o.url} target="_blank" rel="noopener">Claim the offer ↗</a>}
              {locked && <Link href="/membership#insider" className="wlink">Unlock with Insider ›</Link>}
            </div>
          );
        })}
      </div>
    </ProsePage>
  );
}
