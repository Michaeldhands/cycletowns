import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/stripe/server";
import { pushToCrm } from "@/lib/crm";
import { hasEmail, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

/** A partner enquiry. Saved first, pushed to the CRM second — the save is what must not fail. */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.website) return NextResponse.json({ ok: true }); // honeypot

  const e = {
    business: clip(b.business, 120),
    contact: clip(b.name, 80),
    email: clip(b.email, 200).toLowerCase(),
    type: clip(b.type, 40) || null,
    town_id: clip(b.town, 40) || null,
    message: clip(b.message, 2000) || null,
    source: clip(b.source, 40) || "partners",
  };

  if (!e.business || !e.contact) return NextResponse.json({ error: "We need a business name and your name." }, { status: 400 });
  if (!EMAIL.test(e.email)) return NextResponse.json({ error: "That email address doesn’t look right." }, { status: 400 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Enquiries aren’t switched on yet — email partners@cycletowns.com." }, { status: 503 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db.from("enquiries").insert(e).select("id").single<{ id: string }>();
  if (error || !data) {
    console.error("enquiry", error?.message);
    return NextResponse.json({ error: "Couldn’t save that just now. Please email partners@cycletowns.com." }, { status: 500 });
  }

  // Everything below is best-effort: the enquiry is already safe.
  const crm = await pushToCrm({ ...e, town: e.town_id });
  await db.from("enquiries").update({ crm_synced: crm.ok, crm_error: crm.ok ? null : (crm.error || "").slice(0, 300) }).eq("id", data.id);

  if (hasEmail()) {
    const to = process.env.PARTNER_ALERT_EMAIL || "partners@cycletowns.com";
    const line = `${e.business} — ${e.contact} <${e.email}>${e.type ? ` · ${e.type}` : ""}${e.town_id ? ` · ${e.town_id}` : ""}`;
    await sendEmail(
      to,
      `Partner enquiry: ${e.business}`,
      `<p style="font-family:system-ui;font-size:15px">New partner enquiry.</p><p style="font-family:system-ui;font-size:15px"><b>${line}</b></p>${e.message ? `<p style="font-family:system-ui;font-size:15px">${e.message}</p>` : ""}<p style="font-family:system-ui;font-size:13px;color:#666">Reply within one business day — that's what the partners page promises.</p>`,
      `New partner enquiry.\n\n${line}\n\n${e.message || ""}\n\nReply within one business day — that's what the partners page promises.`,
    );
  }
  return NextResponse.json({ ok: true });
}
