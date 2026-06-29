import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Sends an email notification to the company inbox whenever a visitor submits
 * one of the public lead forms (careers application, contact / book-a-call,
 * service inquiry). The form data is still persisted to Firestore by the
 * client; this endpoint is an additive notification so the team is alerted by
 * email in real time.
 *
 * Provider: Resend (https://resend.com) — called directly over REST, mirroring
 * the way api/chat.ts calls Groq. Configure these env vars in Vercel:
 *   RESEND_API_KEY   – required. Your Resend API key.
 *   NOTIFY_TO_EMAIL  – optional. Recipient. Defaults to contact@outsourcedge.com.
 *   NOTIFY_FROM_EMAIL– optional. Verified Resend sender.
 *                      Defaults to "OutsourcEdge <notifications@outsourcedge.com>".
 *
 * If RESEND_API_KEY is not set the endpoint responds 200 with { ok: false,
 * reason: "not_configured" } so the public site keeps working before the
 * provider is wired up.
 */

const DEFAULT_TO = "contact@outsourcedge.com";
const DEFAULT_FROM = "OutsourcEdge <notifications@outsourcedge.com>";

type SubmissionType = "application" | "contact" | "service";

const SUBJECTS: Record<SubmissionType, (r: Record<string, unknown>) => string> = {
  application: (r) => `New job application: ${str(r.jobTitle) || "Careers"} — ${str(r.fullName) || "Applicant"}`,
  contact: (r) => `New contact / book-a-call: ${str(r.name) || "Website visitor"}`,
  service: (r) => `New service inquiry: ${str(r.serviceTitle) || "Service"} — ${str(r.name) || "Visitor"}`,
};

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function escapeHtml(v: unknown): string {
  return str(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Turn a flat record (and one level of nested objects, e.g. answers) into rows. */
function flatten(record: Record<string, unknown>): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  const skip = new Set(["status"]);
  for (const [key, value] of Object.entries(record)) {
    if (skip.has(key) || value == null || value === "") continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (v == null || v === "") continue;
        rows.push([`${prettyKey(key)} — ${k}`, str(v)]);
      }
    } else {
      rows.push([prettyKey(key), Array.isArray(value) ? value.map(str).join(", ") : str(value)]);
    }
  }
  return rows;
}

function prettyKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function buildBody(type: SubmissionType, record: Record<string, unknown>) {
  const rows = flatten(record);
  const heading =
    type === "application" ? "New Job Application" : type === "service" ? "New Service Inquiry" : "New Contact Message";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1F2A44">
      <h2 style="color:#1B3A4B;border-bottom:2px solid #C6A75E;padding-bottom:8px">${heading}</h2>
      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        ${rows
          .map(
            ([k, v]) => `
          <tr>
            <td style="padding:8px 12px;background:#FAF7F1;font-weight:bold;border:1px solid #eee;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>
            <td style="padding:8px 12px;border:1px solid #eee;white-space:pre-wrap">${escapeHtml(v)}</td>
          </tr>`
          )
          .join("")}
      </table>
      <p style="margin-top:20px;font-size:12px;color:#888">Sent automatically from the OutsourcEdge website.</p>
    </div>`;

  const text = `${heading}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nSent automatically from the OutsourcEdge website.`;

  return { html, text };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  const { type, record } = (req.body ?? {}) as { type?: string; record?: unknown };

  if (type !== "application" && type !== "contact" && type !== "service") {
    return res.status(400).json({ error: "Invalid submission type" });
  }
  if (record === null || typeof record !== "object" || Array.isArray(record)) {
    return res.status(400).json({ error: "record object is required" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured yet — fail soft so the public form keeps working.
    return res.status(200).json({ ok: false, reason: "not_configured" });
  }

  const to = process.env.NOTIFY_TO_EMAIL || DEFAULT_TO;
  const from = process.env.NOTIFY_FROM_EMAIL || DEFAULT_FROM;
  const subject = SUBJECTS[type](record as Record<string, unknown>);
  const { html, text } = buildBody(type, record as Record<string, unknown>);

  // Reply directly to the person who submitted, when we have their email.
  const replyTo = str((record as Record<string, unknown>).email) || undefined;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", resendRes.status, errText);
      return res.status(502).json({ error: `Resend API error: ${resendRes.status}`, details: errText });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Notify handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
