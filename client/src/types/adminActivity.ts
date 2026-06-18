export interface AdminActivity {
  id: string;
  adminEmail: string;
  adminName?: string;
  activityType: 'login' | 'logout' | 'heartbeat' | 'create' | 'update' | 'delete' | 'view';
  page?: string;
  action?: string;
  details?: string;
  timestamp: any;
  duration?: number; // in seconds
}

export interface AdminSession {
  id: string;
  adminEmail: string;
  adminName?: string;
  loginTime: any;
  logoutTime?: any;
  isActive: boolean;
  lastHeartbeat: any;
}
