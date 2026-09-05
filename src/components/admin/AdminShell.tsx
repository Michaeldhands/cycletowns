import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { currentUser } from "@/lib/supabase/server";

const SECTIONS: [string, string][] = [
  ["/admin", "Overview"],
  ["/admin/towns", "Towns"],
  ["/admin/articles", "News"],
  ["/admin/events", "Events"],
  ["/admin/offers", "Offers"],
  ["/admin/partners", "Partners"],
  ["/admin?s=riders", "Riders"],
  ["/admin?s=reviews", "Reviews"],
  ["/admin?s=groups", "Groups"],
  ["/admin?s=posts", "Posts"],
];

/** Admin chrome: checks the admin flag, renders the sidebar. */
export async function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  const me = await currentUser();
  if (!me) redirect("/login?next=/admin");
  if (!me.profile?.is_admin)
    return (
      <div className="sec2"><div className="in" style={{ maxWidth: 640, textAlign: "center" }}><div className="kick">Admin</div><div className="h2">Admins only.</div><p style={{ color: "var(--grey-d)" }}>Your account isn’t an admin. <Link href="/account">Back to your account ›</Link></p></div></div>
    );
  return (
    <div className="admin-wrap">
      <aside className="adsidebar">
        <div className="brand"><Link href="/"><Logo h={26} /></Link></div>
        {SECTIONS.map(([href, label]) => (
          <Link key={href} href={href} className={"navi" + (active === label ? " on" : "")} style={{ textDecoration: "none" }}><span>{label}</span></Link>
        ))}
        <Link href="/account" className="navi" style={{ textDecoration: "none" }}><span>← Site</span></Link>
        <div className="role">Signed in as<br /><b style={{ color: "#fff" }}>{me.profile?.display_name || me.email}</b></div>
      </aside>
      <main className="admain">{children}</main>
    </div>
  );
}
