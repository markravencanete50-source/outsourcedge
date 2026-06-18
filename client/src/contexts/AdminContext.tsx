import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AdminContextType {
  isAuthenticated: boolean;
  adminEmail: string | null;
  adminName: string | null; // Added this
  adminUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null); // Added this
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminEmail(user.email);
        setAdminName(user.email ? user.email.split('@')[0] : 'Admin'); // Set name from email
        setAdminUser(user);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setAdminEmail(null);
        setAdminName(null);
        setAdminUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!auth) throw new Error('Firebase is not initialized');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setAdminEmail(userCredential.user.email);
      setAdminName(userCredential.user.email ? userCredential.user.email.split('@')[0] : 'Admin');
      setAdminUser(userCredential.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (!auth) throw new Error('Firebase is not initialized');
      await signOut(auth);
      setAdminEmail(null);
      setAdminName(null);
      setAdminUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, adminEmail, adminName, adminUser, login, logout, isLoading, error }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
