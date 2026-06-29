/**
 * Fire-and-forget email notification to the company inbox.
 *
 * Called after a lead form is saved to Firestore. It POSTs to the /api/notify
 * serverless function which emails contact@outsourcedge.com (see api/notify.ts).
 * Failures are swallowed on purpose: the submission is already persisted, so a
 * notification problem must never break the visitor's success experience.
 */
export type NotifyType = "application" | "contact" | "service";

export function notifySubmission(type: NotifyType, record: Record<string, unknown>): void {
  try {
    void fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, record }),
      keepalive: true,
    }).catch((err) => {
      console.error("notifySubmission failed:", err);
    });
  } catch (err) {
    console.error("notifySubmission failed:", err);
  }
}
