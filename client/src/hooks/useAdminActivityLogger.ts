import { useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/contexts/AdminContext';

export const useAdminActivityLogger = () => {
  const { adminEmail, adminName } = useAdmin();
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
    logActivity('view', pageName, `Opened ${pageName}`);
  };

  // Log a specific click (button, link, menu item …) with rich context so the
  // audit trail reads like "what they actually did", not just timestamps.
  const trackClick = (
    elementName: string,
    extra?: { control?: string; details?: string },
  ) => {
    const page = currentPageRef.current;
    const label = (elementName || 'an element').replace(/\s+/g, ' ').trim().slice(0, 80);
    logActivity(
      'click',
      page,
      extra?.details || `Clicked "${label}" on ${page}`,
      { element: label, control: extra?.control || 'button', page },
    );
  };

  // No heartbeat: activity is recorded only when the admin actually does
  // something (navigates, clicks, creates/updates/deletes). This keeps the log
  // an action trail rather than a presence ping.

  return { logActivity, trackPageView, trackClick };
};
