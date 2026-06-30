import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Sends an email notification to the company inbox whenever a visitor submits
 * one of the public lead forms (careers application, contact / book-a-call,
 * service inquiry). The form data is still persisted to Firestore by the
 * client; this endpoint is an additive notification so the team is alerted by
 * email in real time.
 *
 * For careers applications it additionally:
 *   • attaches the branded application PDF to the team email. The PDF is sent
 *     inline as base64 (`pdfBase64`) so it attaches even when Cloudinary is not
 *     configured; if a hosted `pdfUrl` is also present it is used for the
 *     "Download" link and as a fallback attachment source.
 *   • sends the applicant a confirmation email acknowledging their application.
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
  const skip = new Set(["status", "pdfUrl"]);
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

function buildBody(type: SubmissionType, record: Record<string, unknown>, hasPdfAttachment: boolean) {
  const rows = flatten(record);
  const heading =
    type === "application" ? "New Job Application" : type === "service" ? "New Service Inquiry" : "New Contact Message";

  const pdfUrl = str(record.pdfUrl);
  const downloadBtn = pdfUrl
    ? `<a href="${escapeHtml(pdfUrl)}"
          style="display:inline-block;background:#1B3A4B;color:#fff;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:8px">
         📄 Download application PDF
       </a>`
    : "";
  const attachNote =
    hasPdfAttachment || pdfUrl
      ? `<span style="display:block;margin-top:6px;font-size:12px;color:#888">The full application is attached to this email as a PDF.</span>`
      : "";
  const pdfBlock = downloadBtn || attachNote ? `<p style="margin:16px 0">${downloadBtn}${attachNote}</p>` : "";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1F2A44">
      <h2 style="color:#1B3A4B;border-bottom:2px solid #C6A75E;padding-bottom:8px">${heading}</h2>
      ${pdfBlock}
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

  const text =
    `${heading}\n\n` +
    (pdfUrl ? `Application PDF: ${pdfUrl}\n\n` : hasPdfAttachment ? `(Application PDF attached.)\n\n` : "") +
    `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nSent automatically from the OutsourcEdge website.`;

  return { html, text };
}

/** Friendly confirmation sent to the applicant the moment their application arrives. */
function buildApplicantAck(record: Record<string, unknown>) {
  const fullName = str(record.fullName).trim();
  const firstName = fullName ? fullName.split(/\s+/)[0] : "there";
  const jobTitle = str(record.jobTitle);
  const role = jobTitle ? `the <strong>${escapeHtml(jobTitle)}</strong> role` : "the role you applied for";
  const roleText = jobTitle ? `the ${jobTitle} role` : "the role you applied for";

  const subject = "We've received your application — OutsourcEdge";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1F2A44">
      <div style="background:#1B3A4B;padding:24px 28px;border-radius:10px 10px 0 0">
        <div style="color:#fff;font-size:20px;font-weight:bold">OutsourcEdge</div>
        <div style="color:#C6A75E;font-size:13px;margin-top:4px">Application received</div>
      </div>
      <div style="border:1px solid #eee;border-top:none;padding:28px;border-radius:0 0 10px 10px">
        <p style="margin:0 0 14px">Hi ${escapeHtml(firstName)},</p>
        <p style="margin:0 0 14px">Thank you for applying for ${role} at OutsourcEdge. We've received your application and our team will review it carefully.</p>
        <p style="margin:0 0 14px"><strong>Please keep your lines open</strong> — if your profile matches what we're looking for, a member of our team will reach out to you with the next steps.</p>
        <p style="margin:0 0 14px">We appreciate the time you took to apply and wish you the very best.</p>
        <p style="margin:18px 0 0">Warm regards,<br/>The OutsourcEdge Team</p>
      </div>
      <p style="margin-top:16px;font-size:12px;color:#888;text-align:center">This is an automated confirmation. You can reply to this email if you have any questions.</p>
    </div>`;

  const text =
    `Hi ${firstName},\n\n` +
    `Thank you for applying for ${roleText} at OutsourcEdge. We've received your application and our team will review it carefully.\n\n` +
    `Please keep your lines open — if your profile matches what we're looking for, a member of our team will reach out to you with the next steps.\n\n` +
    `We appreciate the time you took to apply and wish you the very best.\n\n` +
    `Warm regards,\nThe OutsourcEdge Team`;

  return { subject, html, text };
}

/** POST a single email through Resend. Throws on a non-2xx response. */
async function sendViaResend(apiKey: string, payload: Record<string, unknown>): Promise<void> {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    throw new Error(`Resend API error ${r.status}: ${errText}`);
  }
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

  const { type, record, pdfBase64 } = (req.body ?? {}) as {
    type?: string;
    record?: unknown;
    pdfBase64?: string;
  };

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

  const rec = record as Record<string, unknown>;
  const to = process.env.NOTIFY_TO_EMAIL || DEFAULT_TO;
  const from = process.env.NOTIFY_FROM_EMAIL || DEFAULT_FROM;
  const subject = SUBJECTS[type](rec);

  // Reply directly to the person who submitted, when we have their email.
  const applicantEmail = str(rec.email);
  const replyTo = applicantEmail || undefined;

  // Attach the application PDF. Prefer the inline base64 bytes (works without
  // Cloudinary); fall back to fetching the hosted file from its URL.
  const pdfUrl = str(rec.pdfUrl);
  const attachmentName = `application_${(str(rec.fullName) || "applicant")
    .replace(/[^a-z0-9]+/gi, "_")
    .toLowerCase()}.pdf`;
  const hasInlinePdf = typeof pdfBase64 === "string" && pdfBase64.length > 0;
  const attachments = hasInlinePdf
    ? [{ filename: attachmentName, content: pdfBase64 as string }]
    : pdfUrl
    ? [{ path: pdfUrl, filename: attachmentName }]
    : undefined;

  const { html, text } = buildBody(type, rec, !!attachments);

  // 1) Team notification — this is the one that must succeed.
  try {
    await sendViaResend(apiKey, {
      from,
      to: [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments ? { attachments } : {}),
    });
  } catch (err) {
    console.error("Team notification email failed:", err);
    return res.status(502).json({ error: String(err) });
  }

  // 2) Applicant acknowledgement — best-effort; never fail the request on it.
  let applicantNotified = false;
  if (type === "application" && applicantEmail) {
    try {
      const ack = buildApplicantAck(rec);
      await sendViaResend(apiKey, {
        from,
        to: [applicantEmail],
        subject: ack.subject,
        html: ack.html,
        text: ack.text,
        reply_to: to, // replies from the applicant go to the company inbox
      });
      applicantNotified = true;
    } catch (err) {
      console.error("Applicant acknowledgement email failed:", err);
    }
  }

  return res.status(200).json({ ok: true, applicantNotified });
}
