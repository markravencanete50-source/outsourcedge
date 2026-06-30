import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAdmin } from '@/contexts/AdminContext';
import { useTheme } from '@/contexts/ThemeProvider';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import {
  LayoutDashboard, Mail, Users, Briefcase, BarChart3, Zap, Clock,
  Layout, Settings, Star, FileText, LogOut, Menu, Sun, Moon, Crown,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

/**
 * Redesigned admin shell.
 *  - Collapsible sidebar (76px icon rail) — state lives in ThemeProvider, persisted.
 *  - Top bar with hamburger + Light/Dark quick toggle.
 *  - Full dark-mode support via Tailwind `dark:` classes (class-based variant
 *    is wired in index.css: `@custom-variant dark`).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout, isCeo } = useAdmin();
  const { trackPageView, logActivity, trackClick } = useAdminActivityLogger();
  const { theme, setTheme, sidebarCollapsed, toggleSidebar } = useTheme();
  const [location, setLocation] = useLocation();
  const [dbConnected, setDbConnected] = useState(false);

  // access: 'all'  → both CEO and admin
  //         'ceo'   → CEO view only (hidden + route-guarded from regular admins)
  //         'admin' → regular admin operational pages (not shown in the CEO view)
  const allMenu = [
    { href: '/admin/ceo', label: 'Command Center', icon: Crown, section: 'Executive', access: 'ceo' },
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', access: 'all' },
    { href: '/admin/contacts', label: 'Contact Submissions', icon: Mail, section: 'Overview', access: 'admin' },
    { href: '/admin/applications', label: 'Job Applications', icon: Users, section: 'Overview', access: 'admin' },
    { href: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase, section: 'Overview', access: 'admin' },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, section: 'Intelligence', access: 'ceo' },
    { href: '/admin/clients', label: 'Partnership Pipeline', icon: Zap, section: 'Intelligence', access: 'ceo' },
    { href: '/admin/activity-logs', label: 'Activity Logs', icon: Clock, section: 'Intelligence', access: 'ceo' },
    { href: '/admin/editor', label: 'Website Editor', icon: Layout, section: 'Content', access: 'admin' },
    { href: '/admin/services', label: 'Service Manager', icon: Settings, section: 'Content', access: 'admin' },
    { href: '/admin/testimonials', label: 'Testimonial Manager', icon: Star, section: 'Content', access: 'admin' },
    { href: '/admin/service-questionnaires', label: 'Service Inquiries', icon: FileText, section: 'Content', access: 'admin' },
  ];
  const menu = allMenu.filter((m) => m.access === 'all' || m.access === (isCeo ? 'ceo' : 'admin'));

  useEffect(() => {
    const name = menu.find((m) => m.href === location)?.label || 'Admin Page';
    trackPageView(name);
  }, [location]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        'button, a, [role="button"], [role="menuitem"], [role="tab"], [role="option"]',
      ) as HTMLElement | null;
      if (!el) return;
      const label =
        el.getAttribute('aria-label') ||
        el.textContent?.replace(/\s+/g, ' ').trim() ||
        el.getAttribute('title') ||
        '';
      if (!label || ['OE', 'OutsourcEdge'].includes(label)) return;
      const control =
        el.tagName === 'A'
          ? 'link'
          : el.getAttribute('role') || el.tagName.toLowerCase();
      trackClick(label, { control });
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => setDbConnected(!!u));
  }, []);

  const handleLogout = async () => {
    try {
      await logActivity('logout', 'System', 'Admin initiated logout');
      await logout();
      setLocation('/admin/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Error during logout');
    }
  };

  const active = (href: string) => location === href;
  const sections = Array.from(new Set(menu.map((m) => m.section)));

  return (
    <div className="admin-shell flex h-screen bg-[#EEF1F6] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors">
      {/* SIDEBAR */}
      <aside
        className={`${sidebarCollapsed ? 'w-[76px]' : 'w-64'} flex flex-col bg-[#0C1426] dark:bg-[#0A1020] border-r border-white/[.07] overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)]`}
      >
        <div className="flex items-center gap-3 px-4 h-[74px] border-b border-white/[.07]">
          <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#1B3A4B] to-[#0B2230] shadow-lg">
            <span className="font-[Poppins] font-bold text-[15px] text-[#C6A75E]">OE</span>
          </div>
          {!sidebarCollapsed && (
            <div className="leading-tight whitespace-nowrap">
              <div className="font-[Poppins] font-semibold text-[15px] text-slate-50">OutsourcEdge</div>
              <div className="text-[10px] tracking-[.14em] uppercase text-[#C6A75E] font-semibold">
                {isCeo ? 'Executive Portal' : 'Admin Portal'}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {sections.map((sec) => (
            <div key={sec}>
              {!sidebarCollapsed && (
                <div className="px-3 pt-4 pb-2 text-[10px] tracking-[.13em] uppercase font-bold text-slate-500 whitespace-nowrap">
                  {sec}
                </div>
              )}
              {menu.filter((m) => m.section === sec).map((m) => {
                const isOn = active(m.href);
                return (
                  <Link key={m.href} href={m.href}>
                    <a
                      title={m.label}
                      className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} px-3 py-[11px] rounded-[10px] mb-[3px] text-[13.5px] whitespace-nowrap transition-colors ${
                        isOn
                          ? 'font-semibold text-white bg-gradient-to-r from-[#1B3A4B] to-[#143040] shadow-[0_8px_20px_rgba(27,58,75,.4)]'
                          : 'font-medium text-slate-400 hover:bg-white/[.06] hover:text-slate-100'
                      }`}
                    >
                      <m.icon className="w-[17px] h-[17px] shrink-0" />
                      {!sidebarCollapsed && <span>{m.label}</span>}
                    </a>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[.07]">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-[10px] px-1">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                Database
              </span>
              <span className={dbConnected ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
                {dbConnected ? 'Connected' : 'Syncing…'}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''} w-full px-3 py-[11px] rounded-[10px] text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors`}
          >
            <LogOut className="w-[17px] h-[17px] shrink-0" />
            {!sidebarCollapsed && <span className="text-[13.5px]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 px-[clamp(18px,3vw,30px)] py-[14px] bg-white/80 dark:bg-[#080C16]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/[.08]">
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Hide sidebar'}
            className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/[.04] border border-slate-200 dark:border-white/[.08] text-slate-600 dark:text-slate-300 hover:bg-[#1B3A4B] hover:text-white hover:border-transparent transition flex items-center justify-center"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>
          <div className="mr-auto" />
          {/* quick Light/Dark toggle */}
          <div className="flex items-center gap-[3px] h-10 p-1 rounded-xl bg-slate-100 dark:bg-white/[.04] border border-slate-200 dark:border-white/[.08]">
            <button
              onClick={() => setTheme('light')}
              title="Light"
              className={`w-[34px] h-8 rounded-lg flex items-center justify-center transition ${theme === 'light' ? 'bg-[#1B3A4B] text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark"
              className={`w-[34px] h-8 rounded-lg flex items-center justify-center transition ${theme === 'dark' ? 'bg-[#1B3A4B] text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Moon className="w-[15px] h-[15px]" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-[clamp(18px,3vw,28px)]">{children}</main>
      </div>
    </div>
  );
}
