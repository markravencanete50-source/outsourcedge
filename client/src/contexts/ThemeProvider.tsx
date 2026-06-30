import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeCtx {
  theme: Theme;                 // user choice
  resolvedTheme: 'light' | 'dark'; // actually-applied
  setTheme: (t: Theme) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const resolve = (t: Theme): 'light' | 'dark' =>
  t === 'system' ? (prefersDark() ? 'dark' : 'light') : t;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [sidebarCollapsed, setCollapsed] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oe-admin-theme') as Theme | null;
      if (saved) setThemeState(saved);
      setCollapsed(localStorage.getItem('oe-admin-collapsed') === '1');
    } catch {}
  }, []);

  // apply `dark` class on <html>
  useEffect(() => {
    const apply = () => {
      const r = resolve(theme);
      document.documentElement.classList.toggle('dark', r === 'dark');
    };
    apply();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    try { localStorage.setItem('oe-admin-theme', t); } catch {}
    setThemeState(t);
  };
  const toggleSidebar = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem('oe-admin-collapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  return (
    <Ctx.Provider
      value={{ theme, resolvedTheme: resolve(theme), setTheme, sidebarCollapsed, toggleSidebar }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTheme must be used within <ThemeProvider>');
  return c;
}
