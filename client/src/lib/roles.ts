import type { AdminRole, AdminStatus } from '@/types/admin';

// The "founder" CEO email. This account is always granted the CEO role on login
// and can never be suspended or deleted (mirrored in firestore.rules). Override
// it per environment with VITE_CEO_BOOTSTRAP_EMAIL.
export const CEO_BOOTSTRAP_EMAIL = (
  import.meta.env.VITE_CEO_BOOTSTRAP_EMAIL || 'richieann@outsourcedge.com'
)
  .toString()
  .trim()
  .toLowerCase();

export function isBootstrapCeo(email?: string | null): boolean {
  return !!email && email.trim().toLowerCase() === CEO_BOOTSTRAP_EMAIL;
}

export function roleLabel(role: AdminRole): string {
  return role === 'ceo' ? 'CEO' : 'Admin';
}

export function statusLabel(status: AdminStatus): string {
  return status === 'active' ? 'Active' : 'Suspended';
}
