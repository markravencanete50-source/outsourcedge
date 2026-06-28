import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isBootstrapCeo } from '@/lib/roles';
import type { AdminRecord, AdminRole, AdminStatus } from '@/types/admin';

interface AdminContextType {
  isAuthenticated: boolean;
  adminEmail: string | null;
  adminName: string | null;
  adminUser: User | null;
  // RBAC
  adminRecord: AdminRecord | null;
  role: AdminRole | null;
  status: AdminStatus | null;
  isCeo: boolean;
  // actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminRecord, setAdminRecord] = useState<AdminRecord | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Holds the unsubscribe fn for the per-user admins/{uid} live listener.
  const adminDocUnsub = useRef<null | (() => void)>(null);

  const resetIdentity = () => {
    setAdminEmail(null);
    setAdminName(null);
    setAdminUser(null);
    setAdminRecord(null);
    setRole(null);
    setStatus(null);
    setIsAuthenticated(false);
  };

  // Force a sign-out triggered by suspension / removal, keeping the reason so the
  // login screen can explain why the user was kicked out.
  const revokeAccess = async (reason: string) => {
    setError(reason);
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.error('Forced sign-out failed:', e);
    }
  };

  // Make sure every authenticated user has an admins/{uid} record. The bootstrap
  // CEO is (re)granted the CEO role here; everyone else defaults to a regular,
  // active admin. Role/status changes are otherwise controlled only by the CEO.
  const provisionAdmin = async (user: User) => {
    if (!db) return;
    const ref = doc(db, 'admins', user.uid);
    const email = (user.email || '').toLowerCase();
    const bootstrap = isBootstrapCeo(email);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email,
        displayName: user.displayName || email.split('@')[0] || 'Admin',
        role: bootstrap ? 'ceo' : 'admin',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
      return;
    }

    const data = snap.data() as AdminRecord;
    const patch: Record<string, any> = { lastLoginAt: serverTimestamp() };
    // Self-heal the founder account so it can never be locked out.
    if (bootstrap && data.role !== 'ceo') patch.role = 'ceo';
    if (bootstrap && data.status !== 'active') patch.status = 'active';
    await updateDoc(ref, patch);
  };

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Tear down any previous user's admin-doc listener.
      if (adminDocUnsub.current) {
        adminDocUnsub.current();
        adminDocUnsub.current = null;
      }

      if (!user) {
        resetIdentity();
        setIsLoading(false);
        return;
      }

      setAdminUser(user);
      setAdminEmail(user.email);
      setAdminName(user.email ? user.email.split('@')[0] : 'Admin');
      setIsAuthenticated(true);

      // Clear the previous user's role/record FIRST. Without this, switching
      // accounts in the same browser (e.g. CEO → admin) lets the new user
      // inherit the prior session's elevated role until their own doc loads —
      // which is how an admin could briefly land in the CEO/Executive view.
      setAdminRecord(null);
      setRole(null);
      setStatus(null);

      try {
        await provisionAdmin(user);

        // Live access control: react instantly if the CEO suspends/removes us.
        adminDocUnsub.current = onSnapshot(
          doc(db, 'admins', user.uid),
          (snap) => {
            if (!snap.exists()) {
              revokeAccess('Your admin access has been removed.');
              return;
            }
            // Tolerate legacy field names (`name`/`emailaddress`) so older docs
            // resolve correctly instead of showing blanks.
            const data = snap.data() as any;
            const record = {
              uid: user.uid,
              ...data,
              displayName: data.displayName || data.name || (user.email || '').split('@')[0],
              email: data.email || data.emailaddress || user.email || '',
            } as AdminRecord;

            if (record.status === 'suspended') {
              revokeAccess('Your access has been suspended by the CEO.');
              return;
            }

            setAdminRecord(record);
            setRole(record.role);
            setStatus(record.status);
            if (record.displayName) setAdminName(record.displayName);
          },
          (err) => console.error('Admin record listener error:', err),
        );
      } catch (e) {
        console.error('Admin provisioning error:', e);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (adminDocUnsub.current) adminDocUnsub.current();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!auth) throw new Error('Firebase is not initialized');
      await signInWithEmailAndPassword(auth, email, password);
      // Identity, provisioning and role loading are handled by onAuthStateChanged.
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!auth) throw new Error('Firebase is not initialized');
      await signOut(auth);
      resetIdentity();
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isCeo = role === 'ceo' || isBootstrapCeo(adminEmail);

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        adminEmail,
        adminName,
        adminUser,
        adminRecord,
        role,
        status,
        isCeo,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
