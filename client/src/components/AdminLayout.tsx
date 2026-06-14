import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAdmin } from '@/contexts/AdminContext';
import { BarChart3, Users, Mail, FileText, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout, adminEmail } = useAdmin();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/contacts', label: 'Contact Submissions', icon: Mail },
    { href: '/admin/applications', label: 'Job Applications', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: FileText },
  ];

  const isActive = (href: string) => location === href;

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
              <span className="font-bold">OutsourcEdge</span>
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
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    active
                      ? 'bg-[#0891B2] text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="mb-4">
            {sidebarOpen && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Logged in as</p>
                <p className="text-sm font-semibold truncate">{adminEmail}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#0F172A]">
              {menuItems.find((item) => isActive(item.href))?.label || 'Dashboard'}
            </h1>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
