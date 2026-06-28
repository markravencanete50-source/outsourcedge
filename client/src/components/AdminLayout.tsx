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

  const menuItems = [
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
              <div className="w-10 h-10 bg-[#1B3A4B] rounded-lg flex items-center justify-center font-bold">OE</div>
              <span className="font-bold">OutsourceEdge</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-700 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {isCeo && (
              <li>
                <Link href="/admin/ceo">
                  <a className={`flex items-center gap-3 p-3 rounded-lg transition-colors mb-2 ${
                    isActive('/admin/ceo')
                      ? 'bg-amber-500 text-slate-900 font-semibold'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                  }`}>
                    <Crown className="w-5 h-5" />
                    {sidebarOpen && <span>CEO Command Center</span>}
                  </a>
                </Link>
              </li>
            )}
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive(item.href) ? 'bg-[#1B3A4B] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </a>
                </Link>
              </li>
            ))}
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
