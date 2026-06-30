import type { VercelRequest, VercelResponse } from "@vercel/node";
import { jwtVerify, createRemoteJWKSet } from "jose";

/**
 * Admin-only endpoint: sends a one-off email composed in the admin dashboard
 * (e.g. replying to a job applicant) through Resend.
 *
 * Security: the caller must present a valid Firebase ID token in the
 * Authorization header (`Bearer <token>`). Only this app's admins have Firebase
 * accounts — applicants never do — so a token signed for this Firebase project
 * is sufficient proof the caller is an admin. We verify the token signature
 * against Google's public keys (no service-account key needed) and check the
 * issuer/audience match the project.
 *
 * Env vars (Vercel):
 *   RESEND_API_KEY     – required. Resend API key (already used by api/notify.ts).
 *   FIREBASE_PROJECT_ID– required. Your Firebase project id (the public value,
 *                        same as VITE_FIREBASE_PROJECT_ID). Used to validate tokens.
 *   NOTIFY_FROM_EMAIL  – optional. Verified Resend sender. Defaults below.
 *   NOTIFY_TO_EMAIL    – optional. Where applicant replies should go. Defaults below.
 */

const DEFAULT_FROM = "OutsourcEdge <notifications@outsourcedge.com>";
const DEFAULT_REPLY_TO = "contact@outsourcedge.com";

// Firebase signs ID tokens with rotating RS256 keys published here as a JWK set.
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Wrap the admin's plain-text message in the branded OutsourcEdge shell. */
function buildHtml(message: string): string {
  const body = escapeHtml(message).replace(/\r?\n/g, "<br/>");
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1F2A44">
      <div style="background:#1B3A4B;padding:22px 28px;border-radius:10px 10px 0 0">
        <div style="color:#fff;font-size:20px;font-weight:bold">OutsourcEdge</div>
        <div style="color:#C6A75E;font-size:13px;margin-top:4px">Careers Team</div>
      </div>
      <div style="border:1px solid #eee;border-top:none;padding:28px;border-radius:0 0 10px 10px;line-height:1.6">
        ${body}
      </div>
      <p style="margin-top:16px;font-size:12px;color:#888;text-align:center">Sent by the OutsourcEdge team. You can reply directly to this email.</p>
    </div>`;
}

async function verifyAdmin(req: VercelRequest, projectId: string): Promise<string> {
  const header = str(req.headers.authorization);
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new Error("missing_token");

  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  // `email` is present on Firebase ID tokens for email/password users.
  return str(payload.email) || str(payload.sub);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Access-Control-Allow-Origin", "*");

  const apiKey = process.env.RESEND_API_KEY;
  // Accept either the server-style name or the VITE_-prefixed one (serverless
  // functions can read both — the VITE_ prefix only matters for the browser build).
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    return res.status(500).json({
      error: "Email sending is not configured. Set RESEND_API_KEY and FIREBASE_PROJECT_ID (or VITE_FIREBASE_PROJECT_ID) in Vercel.",
    });
  }

  // 1) Authorize: must be a signed-in admin of this Firebase project.
  let sender: string;
  try {
    sender = await verifyAdmin(req, projectId);
  } catch (err) {
    console.error("send-email auth failed:", err);
    return res.status(401).json({ error: "Unauthorized — please sign in again." });
  }

  // 2) Validate payload.
  const { to, subject, message } = (req.body ?? {}) as {
    to?: string;
    subject?: string;
    message?: string;
  };
  const toEmail = str(to).trim();
  const subjectLine = str(subject).trim();
  const messageBody = str(message).trim();

  if (!EMAIL_RE.test(toEmail)) return res.status(400).json({ error: "A valid recipient email is required." });
  if (!subjectLine) return res.status(400).json({ error: "A subject is required." });
  if (!messageBody) return res.status(400).json({ error: "A message is required." });

  const from = process.env.NOTIFY_FROM_EMAIL || DEFAULT_FROM;
  const replyTo = process.env.NOTIFY_TO_EMAIL || DEFAULT_REPLY_TO;

  // 3) Send via Resend.
  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: [toEmail],
        subject: subjectLine,
        html: buildHtml(messageBody),
        text: messageBody,
        reply_to: replyTo,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      console.error("Resend error:", resendRes.status, errText);
      return res.status(502).json({ error: `Email provider error (${resendRes.status}).`, details: errText });
    }

    return res.status(200).json({ ok: true, sentBy: sender });
  } catch (err) {
    console.error("send-email handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
