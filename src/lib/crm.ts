/* Pushing a partner enquiry to a CRM.

   Two routes, both optional — with neither configured, enquiries still land in the database and
   in the admin, so nothing is ever lost waiting on a third party.

   · ATTIO_API_KEY  — creates a Person and a Company in Attio, linked.
   · CRM_WEBHOOK_URL — posts the enquiry as JSON anywhere else (Zapier, Make, n8n, your own).
*/

export type Enquiry = {
  business: string;
  contact: string;
  email: string;
  type?: string | null;
  town?: string | null;
  message?: string | null;
  source?: string | null;
};

export const hasCrm = () => Boolean(process.env.ATTIO_API_KEY || process.env.CRM_WEBHOOK_URL);

type Result = { ok: boolean; error?: string };

const ATTIO = "https://api.attio.com/v2";

/** Attio upserts on a matching attribute, so re-submitting the same address updates rather than duplicates. */
async function toAttio(e: Enquiry, key: string): Promise<Result> {
  const call = async (path: string, body: unknown, matching?: string) => {
    const url = `${ATTIO}${path}${matching ? `?matching_attribute=${matching}` : ""}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`${path} ${res.status} ${(await res.text().catch(() => "")).slice(0, 160)}`);
    return res.json();
  };

  try {
    const company = (await call(
      "/objects/companies/records",
      { data: { values: { name: [{ value: e.business }] } } },
      "name",
    )) as { data?: { id?: { record_id?: string } } };

    const companyId = company?.data?.id?.record_id;
    await call(
      "/objects/people/records",
      {
        data: {
          values: {
            email_addresses: [{ email_address: e.email }],
            name: [{ full_name: e.contact }],
            ...(companyId ? { company: [{ target_object: "companies", target_record_id: companyId }] } : {}),
          },
        },
      },
      "email_addresses",
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

async function toWebhook(e: Enquiry, url: string): Promise<Result> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...e, received_at: new Date().toISOString(), from: "cycletowns.com" }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok ? { ok: true } : { ok: false, error: `webhook ${res.status}` };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Best-effort. A CRM that is down must never cost you the enquiry. */
export async function pushToCrm(e: Enquiry): Promise<Result> {
  const key = process.env.ATTIO_API_KEY;
  const hook = process.env.CRM_WEBHOOK_URL;
  if (!key && !hook) return { ok: false, error: "no CRM configured" };
  const results = await Promise.all([key ? toAttio(e, key) : null, hook ? toWebhook(e, hook) : null]);
  const live = results.filter(Boolean) as Result[];
  const failed = live.filter((r) => !r.ok);
  if (!failed.length) return { ok: true };
  return { ok: live.some((r) => r.ok), error: failed.map((f) => f.error).join("; ") };
}
