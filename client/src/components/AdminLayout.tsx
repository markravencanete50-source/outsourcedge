import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import {
  BarChart3, Users, Mail, FileText, LogOut, Menu, X, Zap,
  Briefcase, Layout, Settings, Star, Clock, Crown
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout, adminEmail, isCeo } = useAdmin();
  const { trackPageView, logActivity, trackClick } = useAdminActivityLogger();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // The CEO is a superset of an admin: they get the FULL operational menu plus an
  // exclusive Command Center at the top. Regular admins see the operational menu
  // only. (The CEO must never have *less* access than an admin.)
  const adminMenu = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/contacts', label: 'Contact Submissions', icon: Mail },
    { href: '/admin/applications', label: 'Job Applications', icon: Users },
    { href: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
    { href: '/admin/analytics', label: 'Analytics', icon: FileText },
    { href: '/admin/clients', label: 'Partnership Pipeline', icon: Zap },
    { href: '/admin/activity-logs', label: 'Activity Logs', icon: Clock },
    { href: '/admin/editor', label: 'Website Editor', icon: Layout },
    { href: '/admin/services', label: 'Service Manager', icon: Settings },
    { href: '/admin/testimonials', label: 'Testimonial Manager', icon: Star },
    { href: '/admin/service-questionnaires', label: 'Service Inquiries', icon: FileText },
  ];

  // CEO-only entries, surfaced above the shared admin menu.
  const ceoMenu = [
    { href: '/admin/ceo', label: 'Command Center', icon: Crown },
  ];

  const menuItems = isCeo ? [...ceoMenu, ...adminMenu] : adminMenu;

  // 1. GLOBAL PAGE TRACKING
  useEffect(() => {
    const pageName = menuItems.find(item => item.href === location)?.label || 'Admin Page';
    trackPageView(pageName);
  }, [location]);

  // 2. GLOBAL CLICK LISTENER (Captures all button/link clicks)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, [role="button"]');
      
      if (clickable) {
        const name = clickable.textContent?.trim() || clickable.getAttribute('aria-label') || 'Unknown Element';
        // Don't log heartbeat or system internal clicks
        if (name && !['Logout', 'OE', 'OutsourceEdge'].includes(name)) {
          trackClick(name);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseConnected(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logActivity('logout', 'System', 'Admin initiated logout');
      await logout();
      setLocation('/admin/login');
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error during logout");
    }
  };

  const isActive = (href: string) => location === href;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0F172A] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isCeo ? 'bg-amber-500 text-slate-900' : 'bg-[#1B3A4B]'}`}>
                {isCeo ? <Crown className="w-5 h-5" /> : 'OE'}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold">OutsourceEdge</span>
                {isCeo && <span className="text-[10px] uppercase tracking-wider text-amber-400">Executive Portal</span>}
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-700 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => {
              const activeCls = isCeo
                ? 'bg-amber-500 text-slate-900 font-semibold'
                : 'bg-[#1B3A4B] text-white';
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive(item.href) ? activeCls : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                      <item.icon className="w-5 h-5" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-3">
          {sidebarOpen && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Database</span>
                <span className={firebaseConnected ? 'text-green-500' : 'text-yellow-500'}>{firebaseConnected ? 'Connected' : 'Syncing...'}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-gray-400 hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
