import { useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, query, where, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/contexts/AdminContext';

export const useAdminActivityLogger = () => {
  const { adminEmail, adminName } = useAdmin();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPageRef = useRef<string>('');

  // Log activity to Firestore
  const logActivity = async (
    activityType: 'login' | 'logout' | 'heartbeat' | 'create' | 'update' | 'delete' | 'view',
    page?: string,
    action?: string,
    details?: string
  ) => {
    if (!db || !adminEmail) return;

    try {
      await addDoc(collection(db, 'adminActivities'), {
        adminEmail,
        adminName: adminName || 'Unknown Admin',
        activityType,
        page: page || currentPageRef.current,
        action,
        details,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Track page changes
  const trackPageView = (pageName: string) => {
    currentPageRef.current = pageName;
    logActivity('view', pageName);
  };

  // Start heartbeat on login
  useEffect(() => {
    if (!adminEmail || !db) return;

    // Log login
    logActivity('login');

    // Start heartbeat every 60 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      logActivity('heartbeat', currentPageRef.current);
    }, 60000); // 60 seconds

    // Cleanup on logout
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      logActivity('logout');
    };
  }, [adminEmail]);

  return { logActivity, trackPageView };
};
