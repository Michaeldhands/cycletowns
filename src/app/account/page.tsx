import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import { ProfileForm } from "@/components/ProfileForm";
import { SignOutButton } from "@/components/SignOutButton";
import { SavedList } from "@/components/SavedList";
import { currentUser, isMember, supabaseServer } from "@/lib/supabase/server";
import { JoinMember } from "@/components/MembershipButtons";
import { hasStripe } from "@/lib/stripe/server";
import { getTown } from "@/lib/towns";
import { StravaCard } from "@/components/StravaCard";
import { StravaNotice } from "@/components/StravaNotice";
import { getRow } from "@/lib/strava-server";
import { hasStrava } from "@/lib/strava";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";


export default async function Account() {
  const me = await currentUser();
  if (!me) redirect("/login?next=/account");
  const sb = await supabaseServer();
  const { data: reviews } = await sb.from("reviews").select("town_id, cafes, routes, safety, climbs, storage, created_at").eq("user_id", me.id).order("created_at", { ascending: false });
  const strava = hasStrava() ? await getRow(me.id) : null;
  const p = me.profile;
  const name = p?.display_name || me.email?.split("@")[0] || "Rider";
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in" style={{ maxWidth: 980 }}>
          <div className="acchead">
            <Avatar name={name} url={p?.avatar_url} size={64} />
            <div>
              <div className="kick" style={{ textAlign: "left" }}>{isMember(p) ? "Member" : "Free account"}</div>
              <div className="h2" style={{ textAlign: "left", margin: "2px 0 0", fontSize: 40 }}>{name}</div>
              <div style={{ color: "var(--grey-d)", fontSize: 13.5 }}>{[p?.rider_type, p?.home_town].filter(Boolean).join(" · ") || "Tell us how you ride below."}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Link href="/account/memory" className="lk-ghost">What Ask remembers</Link>
              <Link href="/partners/dashboard" className="lk-ghost">Partner dashboard</Link>
              {p?.is_admin && <Link href="/admin" className="lk-coral">Admin backend</Link>}
              <SignOutButton />
            </div>
          </div>

          {!p?.onboarded && (
            <div className="unlocknote" style={{ fontSize: 14, padding: 14, margin: "18px 0" }}>
              👋 Welcome to the bunch. Fill in your rider profile so your reviews carry context — it takes 30 seconds.
            </div>
          )}

          <div className="twocol" style={{ marginTop: 22 }}>
            <ProfileForm profile={p} userId={me.id} />
            <div>
              <div className="wscorebox" style={{ maxWidth: "none", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Membership</h3>
                <p className="wsub" style={{ display: "block", marginBottom: 10 }}>
                  {isMember(p) ? `Member · renews ${p?.membership_until ? new Date(p.membership_until).toLocaleDateString("en-AU") : "monthly"}. Thank you for backing the work.` : "Free account. Members pay for the inspections and give riders a stronger voice."}
                </p>
                <JoinMember userId={me.id} member={isMember(p)} enabled={hasStripe()} />
              </div>
              {hasStrava() && (
                <Suspense fallback={null}>
                  <StravaNotice />
                </Suspense>
              )}
              {hasStrava() && <StravaCard connected={Boolean(strava)} athleteId={strava?.athlete_id ?? null} />}
              <div className="wscorebox" style={{ maxWidth: "none", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Your reviews</h3>
                {!reviews?.length && (
                  <p className="wsub" style={{ display: "block" }}>
                    None yet. <Link href="/towns">Find a town you’ve ridden</Link> and say how it rides.
                  </p>
                )}
                {(reviews || []).map((r) => {
                  const t = getTown(r.town_id);
                  const avg = (r.cafes + r.routes + r.safety + r.climbs + r.storage) / 5;
                  return (
                    <div className="grow" key={r.town_id}>
                      <span>
                        <Link href={`/towns/${r.town_id}#review`}>{t?.name || r.town_id}</Link>
                      </span>
                      <b>★ {avg.toFixed(1)}</b>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 36 }}>
            <div className="wh">
              <div>
                <h2 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", fontSize: 31 }}>Saved towns</h2>
              </div>
            </div>
            <SavedList userId={me.id} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
