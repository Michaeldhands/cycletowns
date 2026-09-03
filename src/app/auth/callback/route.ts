import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** OAuth / magic-link landing: exchanges the code for a session, then sends the rider on.
    On failure we pass the real reason through so it can be shown rather than guessed at. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/account";

  // Supabase can bounce back with its own error instead of a code (provider refused, config mismatch).
  const providerError = searchParams.get("error_description") || searchParams.get("error");
  if (providerError) return NextResponse.redirect(`${origin}/login?error=link&why=${encodeURIComponent(providerError.slice(0, 200))}`);

  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/account"}`);
    console.error("auth callback exchange failed", error.message);
    return NextResponse.redirect(`${origin}/login?error=link&why=${encodeURIComponent(error.message.slice(0, 200))}`);
  }
  return NextResponse.redirect(`${origin}/login?error=link&why=no-code`);
}
