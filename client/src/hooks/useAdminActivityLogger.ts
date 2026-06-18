import { useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/contexts/AdminContext';

export const useAdminActivityLogger = () => {
  const { adminEmail, adminName } = useAdmin();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPageRef = useRef<string>('Dashboard');

  const logActivity = async (
    activityType: 'login' | 'logout' | 'heartbeat' | 'create' | 'update' | 'delete' | 'view' | 'click',
    page?: string,
    details?: string,
    metadata?: any
  ) => {
    if (!db || !adminEmail) return;

    try {
      await addDoc(collection(db, 'adminActivities'), {
        adminEmail,
        adminName: adminName || 'Admin',
        activityType,
        page: page || currentPageRef.current,
        details: details || '',
        metadata: metadata || {},
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const trackPageView = (pageName: string) => {
    currentPageRef.current = pageName;
    logActivity('view', pageName, `Visited ${pageName}`);
  };

  // NEW: Log specific clicks (buttons, links, etc.)
  const trackClick = (elementName: string, details?: string) => {
    logActivity('click', currentPageRef.current, `Clicked ${elementName}`, { details });
  };

  useEffect(() => {
    if (!adminEmail || !db) return;

    // Heartbeat every 60 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      logActivity('heartbeat', currentPageRef.current, 'User is still active');
    }, 60000);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [adminEmail]);

  return { logActivity, trackPageView, trackClick };
};
