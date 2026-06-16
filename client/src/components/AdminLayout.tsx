import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAdmin } from '@/contexts/AdminContext';
import { BarChart3, Users, Mail, FileText, LogOut, Menu, X, Wifi, WifiOff, Zap, Briefcase } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout, adminEmail } = useAdmin();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Check Firebase connection
  useEffect(() => {
    if (!auth) {
      setFirebaseConnected(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseConnected(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/contacts', label: 'Contact Submissions', icon: Mail },
    { href: '/admin/applications', label: 'Job Applications', icon: Users },
    { href: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
    { href: '/admin/analytics', label: 'Analytics', icon: FileText },
  ];

  const isActive = (href: string) => location === href;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0F172A] text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0891B2] rounded-lg flex items-center justify-center font-bold">
                OE
              </div>
              <span className="font-bold">OutsourceEdge</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive(item.href) 
                      ? 'bg-[#0891B2] text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}>
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Status Bar */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          {sidebarOpen && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>System Status</span>
                <span className={isOnline ? 'text-green-500' : 'text-red-500'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Database</span>
                <span className={firebaseConnected ? 'text-green-500' : 'text-yellow-500'}>
                  {firebaseConnected ? 'Connected' : 'Syncing...'}
                </span>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-gray-400 hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
