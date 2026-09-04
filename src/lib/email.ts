/* Transactional email through Resend. Kept deliberately small: one send function and the
   templates that use it, so there's one place to look when an email doesn't arrive. */

export const hasEmail = () => Boolean(process.env.RESEND_API_KEY);
const FROM = () => process.env.NEWSLETTER_FROM || "Cycletowns <hello@cycletowns.com>";

export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "email not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM(), to: [to], subject, html, text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("resend", res.status, detail.slice(0, 300));
      return { ok: false, error: `status ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("resend", (e as Error).message);
    return { ok: false, error: "send failed" };
  }
}

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

/** Confirm-your-subscription email. Plain, honest, and it tells people how to ignore it. */
export function confirmEmail(confirmUrl: string, site = "https://cycletowns.com") {
  const html = `<!doctype html><html><body style="margin:0;background:#F3F5F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#191919">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px">
    <div style="background:#01536C;border-radius:14px;padding:26px 24px;color:#fff">
      <div style="font-size:12px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:#FD3D35">Cycletowns</div>
      <h1 style="margin:8px 0 0;font-size:26px;line-height:1.15;font-weight:800">One click and you're in.</h1>
    </div>
    <div style="background:#fff;border-radius:14px;padding:24px;margin-top:12px;border:1px solid #E7EAEC">
      <p style="margin:0 0 14px;font-size:15px;line-height:1.55">
        Someone — hopefully you — asked for the Cycletowns newsletter: new town guides, routes worth travelling for,
        and the occasional long read.
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.55">
        Confirm your address and we'll add you to the list. We ask because it means nobody can sign you up but you.
      </p>
      <a href="${esc(confirmUrl)}" style="display:inline-block;background:#FD3D35;color:#fff;text-decoration:none;font-weight:800;font-size:15px;padding:13px 22px;border-radius:12px">Confirm my subscription</a>
      <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#5B5B5B">
        Didn't sign up? Ignore this email — nothing happens unless you click, and we won't email you again.
      </p>
      <p style="margin:14px 0 0;font-size:12px;color:#8A8A8A;word-break:break-all">
        Button not working? Paste this into your browser:<br>${esc(confirmUrl)}
      </p>
    </div>
    <p style="margin:16px 4px 0;font-size:11.5px;line-height:1.5;color:#8A8A8A">
      Cycletowns is a Sport2040 project · ABN 73 680 648 855<br>
      Level 15, 461 Bourke Street, Melbourne VIC 3000, Australia · <a href="${site}" style="color:#8A8A8A">cycletowns.com</a>
    </p>
  </div></body></html>`;

  const text = `One click and you're in.

Someone — hopefully you — asked for the Cycletowns newsletter: new town guides, routes worth travelling for, and the occasional long read.

Confirm your address and we'll add you to the list:
${confirmUrl}

Didn't sign up? Ignore this email. Nothing happens unless you click, and we won't email you again.

Cycletowns is a Sport2040 project · ABN 73 680 648 855
Level 15, 461 Bourke Street, Melbourne VIC 3000, Australia`;

  return { subject: "Confirm your Cycletowns subscription", html, text };
}
