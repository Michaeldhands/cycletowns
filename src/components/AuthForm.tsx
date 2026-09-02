"use client";
import { useState } from "react";
import { hasSupabaseClient, supabaseBrowser } from "@/lib/supabase/client";
import { WaitlistForm } from "./Prose";

/** Email magic-link + Google sign-in. Falls back to the waitlist when Supabase isn't configured. */
export function AuthForm({ mode, next = "/account" }: { mode: "join" | "login"; next?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  if (!hasSupabaseClient()) return <WaitlistForm form="join-waitlist" cta="Put me first in line" />;

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const sendLink = async () => {
    if (!email.trim()) return;
    setState("busy");
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo() } });
    if (error) {
      setMsg(error.message);
      setState("error");
    } else setState("sent");
  };
  const google = async () => {
    setState("busy");
    const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) {
      setMsg(error.message);
      setState("error");
    }
  };
  if (state === "sent")
    return (
      <div className="unlocknote" style={{ fontSize: 14, padding: 16 }}>
        ✉️ Check your inbox — we’ve sent a sign-in link to <b>{email}</b>. It opens straight into your account.
      </div>
    );
  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <button className="lk-ghost big" style={{ width: "100%", justifyContent: "center" }} onClick={google} disabled={state === "busy"}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.5 13.3l7.8 6C12.2 13.6 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.5 5.8c4.4-4 7-10 7-17.5z"/><path fill="#FBBC05" d="M10.3 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.4 0-11.8-4.1-13.7-9.9l-7.8 6C6.5 42.6 14.6 48 24 48z"/></svg>
        Continue with Google
      </button>
      <div style={{ textAlign: "center", color: "var(--grey-m)", fontSize: 12, fontWeight: 700, margin: "14px 0" }}>or use your email</div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={(e) => e.key === "Enter" && sendLink()} />
      </div>
      <button className="btn btn-coral" style={{ borderRadius: 13 }} onClick={sendLink} disabled={state === "busy"}>
        {mode === "join" ? "Join free — email me a link" : "Email me a sign-in link"}
      </button>
      {state === "error" && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{msg}</div>}
      <p style={{ fontSize: 12, color: "var(--grey-m)", marginTop: 12, textAlign: "center" }}>No passwords. We email you a link that signs you in. By continuing you agree to our terms and privacy policy.</p>
    </div>
  );
}
