import { NextResponse } from "next/server";
import { currentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Throws on purpose, so you can confirm error tracking is actually reporting.
    Admin-only: an open endpoint that throws is an invitation to fill your error quota. */
export async function GET() {
  const me = await currentUser();
  if (!me?.profile?.is_admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  throw new Error("Sentry test — thrown deliberately from /api/sentry-test");
}
