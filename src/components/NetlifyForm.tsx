"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

/** Form that submits to Netlify Forms. Every form used here must also be declared in public/__forms.html
    (that static file is how Netlify's Next.js runtime learns the form names and fields). */
export function NetlifyForm({ name, className, style, children }: { name: string; className?: string; style?: React.CSSProperties; children: ReactNode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const data = new FormData(e.currentTarget);
    data.set("form-name", name);
    const body = new URLSearchParams();
    data.forEach((v, k) => body.append(k, String(v)));
    try {
      const res = await fetch("/__forms.html", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
      if (!res.ok) throw new Error(`status ${res.status}`);
      router.push("/thanks");
    } catch {
      setErr("Sorry — that didn’t send. Please try again, or email hello@cycletowns.com.");
      setBusy(false);
    }
  };
  return (
    <form name={name} onSubmit={onSubmit} className={className} style={style}>
      <input type="hidden" name="form-name" value={name} />
      <p style={{ display: "none" }}>
        <label>
          Leave this empty: <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "contents" }}>
        {children}
      </fieldset>
      {err && <div style={{ color: "var(--coral-700)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{err}</div>}
    </form>
  );
}
