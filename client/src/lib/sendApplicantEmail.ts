import { auth } from '@/lib/firebase';

/**
 * Send a one-off email (composed in the admin dashboard) to an applicant via
 * the secured /api/send-email endpoint. Attaches the signed-in admin's Firebase
 * ID token so the server can verify the caller is an admin.
 *
 * Throws with a human-readable message on any failure so the caller can toast it.
 */
export async function sendApplicantEmail(payload: {
  to: string;
  subject: string;
  message: string;
}): Promise<void> {
  const user = auth?.currentUser;
  if (!user) throw new Error('You are not signed in. Please log in again.');

  const token = await user.getIdToken();

  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = `Send failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) detail = data.error;
    } catch {
      /* non-JSON error body — keep the generic message */
    }
    throw new Error(detail);
  }
}
