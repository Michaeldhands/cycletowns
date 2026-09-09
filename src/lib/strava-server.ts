import "server-only";
import { supabaseAdmin } from "@/lib/stripe/server";
import { refresh, type StravaTokens } from "@/lib/strava";

export type StravaRow = { user_id: string; athlete_id: number; access_token: string; refresh_token: string; expires_at: string; scope: string | null };

export async function saveTokens(userId: string, t: StravaTokens) {
  await supabaseAdmin()
    .from("strava_accounts")
    .upsert(
      {
        user_id: userId,
        athlete_id: t.athlete_id,
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        expires_at: new Date(t.expires_at * 1000).toISOString(),
        scope: t.scope ?? null,
      },
      { onConflict: "user_id" },
    );
}

export async function getRow(userId: string): Promise<StravaRow | null> {
  const { data } = await supabaseAdmin().from("strava_accounts").select("*").eq("user_id", userId).maybeSingle();
  return (data as StravaRow) ?? null;
}

/**
 * A usable access token, refreshed if it's within five minutes of expiry.
 * Returns null when the rider isn't connected or Strava has revoked us.
 */
export async function accessTokenFor(userId: string): Promise<string | null> {
  const row = await getRow(userId);
  if (!row) return null;

  const expiresMs = new Date(row.expires_at).getTime();
  if (expiresMs - Date.now() > 5 * 60_000) return row.access_token;

  try {
    const t = await refresh(row.refresh_token);
    await supabaseAdmin()
      .from("strava_accounts")
      .update({
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        expires_at: new Date(t.expires_at * 1000).toISOString(),
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    return t.access_token;
  } catch {
    // A refresh token Strava no longer honours is worse than none — it will fail forever.
    await supabaseAdmin().from("strava_accounts").delete().eq("user_id", userId);
    return null;
  }
}

/** Forget everything Strava gave us about this rider. */
export async function forget(userId: string) {
  const db = supabaseAdmin();
  await db.from("strava_accounts").delete().eq("user_id", userId);
  await db.from("reviews").update({ verify_ref: null }).eq("user_id", userId).eq("verify_source", "strava");
}

/** Is this rider connected? Used to decide which button to show; never exposes a token. */
export async function isConnected(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin().from("strava_accounts").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}
