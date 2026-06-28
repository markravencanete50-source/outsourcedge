// Role-based access control model for the admin/CEO area.
// An `admins/{uid}` Firestore doc backs every authenticated staff member.

export type AdminRole = 'admin' | 'ceo';
export type AdminStatus = 'active' | 'suspended';

export interface AdminRecord {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  status: AdminStatus;
  // Legacy field aliases tolerated when reading older docs.
  name?: string;
  emailaddress?: string;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
  suspendedAt?: any;
  suspendedBy?: string | null;
}
