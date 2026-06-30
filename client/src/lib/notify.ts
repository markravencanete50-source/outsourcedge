/**
 * Fire-and-forget email notification to the company inbox.
 *
 * Called after a lead form is saved to Firestore. It POSTs to the /api/notify
 * serverless function which emails contact@outsourcedge.com (see api/notify.ts).
 * Failures are swallowed on purpose: the submission is already persisted, so a
 * notification problem must never break the visitor's success experience.
 */
export type NotifyType = "application" | "contact" | "service";

export function notifySubmission(
  type: NotifyType,
  record: Record<string, unknown>,
  pdfBase64?: string,
): void {
  try {
    void fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, record, ...(pdfBase64 ? { pdfBase64 } : {}) }),
      // `keepalive` caps the request body at 64KB; an inline PDF can exceed that,
      // so only use it for the small (PDF-less) payloads where it helps the
      // request survive a page unload.
      keepalive: !pdfBase64,
    }).catch((err) => {
      console.error("notifySubmission failed:", err);
    });
  } catch (err) {
    console.error("notifySubmission failed:", err);
  }
}
