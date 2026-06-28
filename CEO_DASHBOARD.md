# CEO Command Center

An executive-only dashboard at `/admin/ceo` that combines a business overview with
admin access control. The CEO can **suspend or reactivate** any admin account; a
suspended admin is signed out in real time and blocked from the admin area.

## How it works

Every authenticated staff member gets an `admins/{uid}` Firestore document:

```
admins/{uid} = {
  uid, email, displayName,
  role:   'admin' | 'ceo',
  status: 'active' | 'suspended',
  createdAt, updatedAt, lastLoginAt,
  suspendedAt, suspendedBy
}
```

- **Provisioning** — `AdminContext` creates this doc automatically on first login
  (`role: 'admin'`, `status: 'active'`).
- **CEO designation** — the email in `VITE_CEO_BOOTSTRAP_EMAIL` is always granted
  `role: 'ceo'` and can never be suspended or deleted. The CEO can promote others
  by editing their `admins` doc, or from the Command Center.
- **Suspension** — the CEO toggles a target's `status`. A live `onSnapshot`
  listener in `AdminContext` detects the change and calls `signOut()` immediately,
  redirecting the user to the login page with an explanation.
- **Defense in depth** — `firestore.rules` enforces the same model server-side, so
  a suspended admin is blocked even via direct SDK/API calls, not just in the UI.

## Files

| File | Purpose |
|------|---------|
| `client/src/types/admin.ts` | Admin record / role / status types |
| `client/src/lib/roles.ts` | Bootstrap CEO email + helpers |
| `client/src/contexts/AdminContext.tsx` | Provisioning, role loading, live suspension |
| `client/src/pages/AdminCeoDashboard.tsx` | The CEO Command Center page |
| `client/src/App.tsx` | `CeoRoute` guard + `/admin/ceo` route |
| `client/src/components/AdminLayout.tsx` | CEO sidebar link (CEO-only) |
| `firestore.rules` | Server-side RBAC enforcement |
| `firebase.json` / `firestore.indexes.json` | Deploy config + composite index |

## Setup

1. **Set the CEO email** in your `.env` (and on Vercel):
   ```
   VITE_CEO_BOOTSTRAP_EMAIL=markravencanete50@gmail.com
   ```
   Keep it identical to `bootstrapCeoEmail()` in `firestore.rules`.

2. **Create the CEO's Firebase Auth user** (Firebase Console → Authentication →
   Add user) with that email, then log in once at `/admin/login`. The CEO doc is
   created automatically and the **CEO Command Center** link appears in the sidebar.

3. **Deploy the security rules** (requires the Firebase CLI):
   ```
   npm i -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## Troubleshooting — "Suspend does nothing"

99% of the time this is **un-deployed security rules**. The CEO Command Center
writes `status: 'suspended'` to `admins/{uid}`; if your Firestore project is still
running default or older rules, that write is rejected with `permission-denied`
and the UI now shows:

> Permission denied. Deploy the security rules: `firebase deploy --only firestore:rules`

Fix it:

```
firebase deploy --only firestore:rules,firestore:indexes
```

Then confirm in the Firebase Console → Firestore → Rules that `bootstrapCeoEmail()`
matches `VITE_CEO_BOOTSTRAP_EMAIL`. The CEO is also a **superset of an admin** —
the sidebar shows the full operational menu *plus* the Command Center, so the CEO
never has less access than a regular admin.

## Notes / limitations

- "Suspend" is an **application-level** revocation: it blocks all admin access via
  the app and Firestore rules, but does **not** disable the underlying Firebase Auth
  account. For hard account disabling (revoking the Auth credential itself), add a
  Cloud Function using the Firebase Admin SDK: `admin.auth().updateUser(uid, { disabled: true })`.
- The CEO cannot suspend their own account or the bootstrap CEO (guarded in the UI
  and in `firestore.rules`) to prevent lockout.
