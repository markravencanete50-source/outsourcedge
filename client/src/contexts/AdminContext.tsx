import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAuthenticated: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Simple admin credentials (in production, use Firebase Auth)
const ADMIN_EMAIL = 'admin@outsourcedge.com';
const ADMIN_PASSWORD = 'OutsourcEdge2024!'; // Change this!

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is already logged in (from localStorage)
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminSession');
    if (storedAdmin) {
      setAdminEmail(storedAdmin);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setAdminEmail(email);
        setIsAuthenticated(true);
        localStorage.setItem('adminSession', email);
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdminEmail(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminSession');
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, adminEmail, login, logout, isLoading }}>
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
