import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AdminContextType {
  isAuthenticated: boolean;
  adminEmail: string | null;
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
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminEmail(user.email);
        setAdminUser(user);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setAdminEmail(null);
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
      if (!auth) {
        throw new Error('Firebase is not initialized');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setAdminEmail(userCredential.user.email);
      setAdminUser(userCredential.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.code === 'auth/user-not-found' 
        ? 'Email not found. Please check your email address.'
        : err.code === 'auth/wrong-password'
        ? 'Incorrect password. Please try again.'
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : err.message || 'Login failed. Please try again.';
      
      setError(errorMessage);
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase is not initialized');
      }
      
      await signOut(auth);
      setAdminEmail(null);
      setAdminUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContext.Provider 
      value={{ 
        isAuthenticated, 
        adminEmail, 
        adminUser,
        login, 
        logout, 
        isLoading,
        error 
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
