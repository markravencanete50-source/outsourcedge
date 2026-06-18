import { useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/contexts/AdminContext';

export const useAdminActivityLogger = () => {
  const { adminEmail, adminName } = useAdmin();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPageRef = useRef<string>('Dashboard');

  const logActivity = async (
    activityType: 'login' | 'logout' | 'heartbeat' | 'create' | 'update' | 'delete' | 'view',
    page?: string,
    details?: string
  ) => {
    // IMPORTANT: We use the email passed in or the one from context
    if (!db || !adminEmail) return;

    try {
      await addDoc(collection(db, 'adminActivities'), {
        adminEmail,
        adminName: adminName || 'Admin',
        activityType,
        page: page || currentPageRef.current,
        details: details || '',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const trackPageView = (pageName: string) => {
    currentPageRef.current = pageName;
    logActivity('view', pageName);
  };

  useEffect(() => {
    if (!adminEmail || !db) return;

    // Heartbeat every 60 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      logActivity('heartbeat', currentPageRef.current);
    }, 60000);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [adminEmail]);

  return { logActivity, trackPageView };
};
