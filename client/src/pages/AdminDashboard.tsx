import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useTheme } from '@/contexts/ThemeProvider';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Mail, DollarSign, Users, TrendingUp, Activity,
  Sun, Moon, Monitor, Check,
} from 'lucide-react';

/* ---------- brand tokens (mirror the hi-fi reference) ---------- */
const ACCENT = '#1B3A4B';
const GOLD = '#C6A75E';
const GREEN = '#0E9F6E';
const SLATE = '#5B7C99';
const SERVICE_COLORS = [ACCENT, GOLD, GREEN, SLATE, '#9DB4C6', '#7C9AB0', '#B98E54'];

/* pipeline stages — must match AdminClients.tsx */
const STAGE_DEFS: { id: string; label: string }[] = [
  { id: 'new-lead', label: 'New Lead' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal-sent', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed-won', label: 'Closed Won' },
  { id: 'active-client', label: 'Active' },
  { id: 'lost', label: 'Lost' },
];
const WON_STAGES = ['closed-won', 'active-client'];
const OPEN_EXCLUDE = ['closed-won', 'active-client', 'lost'];

const toDate = (t: any): Date | null => {
  if (!t) return null;
  if (typeof t?.toDate === 'function') return t.toDate();
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
};
const fmtMoney = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toLocaleString()}`;

export default function AdminDashboard() {
  const { isAuthenticated } = useAdmin();
  const { theme, setTheme } = useTheme();
  const { trackPageView } = useAdminActivityLogger();

  // ---- live Firestore state (all real, no seeded sample data) ----
  const [contacts, setContacts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => { trackPageView('Admin Dashboard'); }, []);

  useEffect(() => {
    if (!db) return;
    const u1 = onSnapshot(collection(db, 'contacts'),
      (s) => setContacts(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error('contacts', e));
    const u2 = onSnapshot(collection(db, 'applications'),
      (s) => setApplications(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error('applications', e));
    const u3 = onSnapshot(query(collection(db, 'clients'), orderBy('dateAdded', 'desc')),
      (s) => setOpportunities(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error('clients', e));
    const u4 = onSnapshot(query(collection(db, 'adminActivities'), orderBy('timestamp', 'desc'), limit(6)),
      (s) => setActivities(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error('adminActivities', e));
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  /* ---------- real aggregations ---------- */
  const totalInquiries = contacts.length;

  const pipelineValue = useMemo(
    () => opportunities
      .filter((o) => o.stage !== 'lost')
      .reduce((s, o) => s + (Number(o.estimatedValue) || 0), 0),
    [opportunities]);

  const activeDeals = useMemo(
    () => opportunities.filter((o) => !OPEN_EXCLUDE.includes(o.stage)).length,
    [opportunities]);

  const { won, winRate } = useMemo(() => {
    const won = opportunities.filter((o) => WON_STAGES.includes(o.stage)).length;
    const lost = opportunities.filter((o) => o.stage === 'lost').length;
    const decided = won + lost;
    return { won, winRate: decided ? Math.round((won / decided) * 100) : 0 };
  }, [opportunities]);

  // 14-day submission trend, real counts by createdAt
  const trendData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (13 - i));
      return {
        key: d.toLocaleDateString(),
        d: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        leads: 0,
        apps: 0,
      };
    });
    const at = (date: Date | null) => date ? days.findIndex((x) => x.key === date.toLocaleDateString()) : -1;
    contacts.forEach((c) => { const i = at(toDate(c.createdAt)); if (i !== -1) days[i].leads++; });
    applications.forEach((a) => { const i = at(toDate(a.createdAt)); if (i !== -1) days[i].apps++; });
    return days;
  }, [contacts, applications]);

  // service distribution, real
  const serviceData = useMemo(() => {
    const m: Record<string, number> = {};
    contacts.forEach((c) => { const k = c.service || 'General Inquiry'; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [contacts]);
  const totalServices = serviceData.reduce((s, x) => s + x.value, 0);

  // pipeline by stage, real counts
  const stageData = useMemo(
    () => STAGE_DEFS.map((s) => ({ name: s.label, value: opportunities.filter((o) => o.stage === s.id).length })),
    [opportunities]);

  const totalOpps = opportunities.length;
  const stageCount = (id: string) => opportunities.filter((o) => o.stage === id).length;
  const pct = (n: number) => (totalOpps ? Math.round((n / totalOpps) * 100) : 0);

  if (!isAuthenticated)
    return <AdminLayout><div className="p-8 text-center text-slate-500">Please login.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-[18px]">
        <div>
          <h1 className="font-[Poppins] font-semibold text-[21px] tracking-[-.01em]">Dashboard Overview</h1>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">Real-time performance &amp; administrative activity</p>
        </div>

        {/* KPI ROW — all real */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi icon={<Mail className="w-[18px] h-[18px]" />} tint="bg-[#1B3A4B]/10 text-[#1B3A4B] dark:text-[#7FB6CC]"
            label="Total Inquiries" value={totalInquiries.toLocaleString()} />
          <Kpi icon={<DollarSign className="w-[18px] h-[18px]" />} tint="bg-[#C6A75E]/15 text-[#B0892F]"
            label="Pipeline Value" value={fmtMoney(pipelineValue)} />
          <Kpi icon={<Users className="w-[18px] h-[18px]" />} tint="bg-[#5B7C99]/15 text-[#4E7090]"
            label="Active Deals" value={activeDeals.toString()} />
          <Kpi icon={<TrendingUp className="w-[18px] h-[18px]" />} tint="bg-[#0E9F6E]/14 text-[#0E9F6E]"
            label="Win Rate" value={`${winRate}%`} />
        </div>

        {/* CHART ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-4">
          <Card>
            <CardHead title="Submission Trends" sub="Inquiries vs. applications · last 14 days" right={<Legend />} />
            <div className="h-[280px] mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-white/[.06]" />
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9AA8BC' }} interval={3} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9AA8BC' }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="leads" name="Inquiries" stroke={ACCENT} strokeWidth={3} fill="url(#gLeads)" />
                  <Area type="monotone" dataKey="apps" name="Applications" stroke={GOLD} strokeWidth={2.4} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHead title="Inquiries by Service" sub="Distribution across offerings" />
            {totalServices === 0 ? (
              <Empty label="No inquiries yet" />
            ) : (
              <>
                <div className="relative h-[200px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={serviceData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={2} stroke="none">
                        {serviceData.map((_, i) => <Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="font-[Poppins] font-bold text-[28px] tracking-[-.02em]">{totalServices.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">total inquiries</div>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  {serviceData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2 text-[12.5px]">
                      <span className="w-[9px] h-[9px] rounded-[3px]" style={{ background: SERVICE_COLORS[i % SERVICE_COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-300 truncate">{s.name}</span>
                      <span className="ml-auto font-bold">{Math.round((s.value / totalServices) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* CHART ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-4">
          <Card>
            <CardHead title="Pipeline by Stage" sub="Open & closed opportunities by stage" />
            {totalOpps === 0 ? (
              <Empty label="No pipeline opportunities yet" />
            ) : (
              <div className="h-[230px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData} margin={{ top: 16, right: 4, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={1} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-white/[.06]" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9.5, fill: '#5A6B83' }} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9AA8BC' }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(27,58,75,.06)' }} contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="url(#gBar)" radius={[7, 7, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card>
            <CardHead title="Conversion Health" sub="Win rate from decided deals" />
            <div className="flex items-center gap-4 mt-1">
              <div className="relative w-[130px] h-[130px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="74%" outerRadius="100%" data={[{ value: winRate, fill: GREEN }]} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: 'rgba(120,130,150,.15)' }} dataKey="value" cornerRadius={20} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-[Poppins] font-bold text-[26px]">{winRate}%</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">win rate</div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <Meter label="Closed won" val={String(won)} pct={pct(won)} color={GREEN} />
                <Meter label="In negotiation" val={String(stageCount('negotiation'))} pct={pct(stageCount('negotiation'))} color={GOLD} />
                <Meter label="Proposal sent" val={String(stageCount('proposal-sent'))} pct={pct(stageCount('proposal-sent'))} color={ACCENT} />
              </div>
            </div>
          </Card>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4">
          {/* activity feed — real adminActivities */}
          <Card pad={false}>
            <div className="flex items-center justify-between px-[22px] py-[18px] border-b border-slate-200 dark:border-white/[.08]">
              <h3 className="font-[Poppins] font-semibold text-[15.5px] flex items-center gap-2">
                <Activity className="w-[17px] h-[17px] text-[#1B3A4B] dark:text-[#7FB6CC]" /> Recent Admin Activity
              </h3>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0E9F6E] bg-[#0E9F6E]/12 px-[10px] py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E] animate-pulse" /> Live feed
              </span>
            </div>
            {activities.length === 0 ? (
              <div className="px-[22px] py-10 text-center text-[13px] text-slate-400 italic">No activity recorded yet.</div>
            ) : (
              <div>
                {activities.map((a, i) => (
                  <div key={a.id || i} className="flex items-start gap-3 px-[22px] py-[13px] border-b border-slate-100 dark:border-white/[.06] last:border-0">
                    <div className="w-[34px] h-[34px] shrink-0 rounded-[9px] flex items-center justify-center text-[12px] font-bold bg-[#1B3A4B]/10 text-[#1B3A4B] dark:text-[#7FB6CC]">
                      {(a.adminName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold truncate">{a.adminName || 'Admin'}</span>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                          {a.timestamp?.toDate ? a.timestamp.toDate().toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {a.activityType && <span className="text-[10px] font-bold uppercase tracking-[.05em] text-[#1B3A4B] dark:text-[#7FB6CC] mr-1.5">{a.activityType}</span>}
                        {a.details || `Viewed ${a.page || 'Dashboard'}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* APPEARANCE / dark-mode chooser */}
          <Card>
            <h3 className="font-[Poppins] font-semibold text-[15.5px] flex items-center gap-2">
              <Sun className="w-[17px] h-[17px] text-[#1B3A4B] dark:text-[#7FB6CC]" /> Appearance
            </h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 mb-4">Choose how the admin portal looks. Saved on this device.</p>
            <div className="space-y-[10px]">
              <ThemeOption active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun className="w-4 h-4" />} title="Light" sub="Bright, clean workspace" />
              <ThemeOption active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon className="w-4 h-4" />} title="Dark" sub="Easy on the eyes at night" />
              <ThemeOption active={theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor className="w-4 h-4" />} title="System" sub="Match your device setting" />
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ---------- presentational helpers ---------- */
const tooltipStyle = {
  borderRadius: 8, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.14)',
  fontSize: 12, background: '#0F1A2E', color: '#EAF0F8',
} as const;

function Card({ children, pad = true }: { children: React.ReactNode; pad?: boolean }) {
  return (
    <div className={`bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-white/[.08] rounded-2xl shadow-sm ${pad ? 'p-[22px]' : 'overflow-hidden'}`}>
      {children}
    </div>
  );
}
function CardHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="font-[Poppins] font-semibold text-[15.5px]">{title}</h3>
        {sub && <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
function Empty({ label }: { label: string }) {
  return (
    <div className="h-[200px] flex flex-col items-center justify-center text-center">
      <span className="text-[13px] text-slate-400 italic">{label}</span>
    </div>
  );
}
function Legend() {
  return (
    <div className="flex gap-4 text-[12px] text-slate-500 dark:text-slate-400">
      <span className="flex items-center gap-1.5"><span className="w-[9px] h-[9px] rounded-[3px] bg-[#1B3A4B]" />Inquiries</span>
      <span className="flex items-center gap-1.5"><span className="w-[9px] h-[9px] rounded-[3px] bg-[#C6A75E]" />Applications</span>
    </div>
  );
}
function Kpi({ icon, tint, label, value }: { icon: React.ReactNode; tint: string; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-white/[.08] rounded-2xl p-5 shadow-sm transition hover:-translate-y-[3px] hover:shadow-[0_18px_40px_rgba(16,27,45,.14)]">
      <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center ${tint}`}>{icon}</div>
      <div className="mt-3.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-[Poppins] font-bold text-[28px] tracking-[-.02em] mt-0.5">{value}</div>
    </div>
  );
}
function Meter({ label, val, pct, color }: { label: string; val: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="text-slate-500 dark:text-slate-400">{label}</span><span className="font-bold">{val}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[.07]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
function ThemeOption({ active, onClick, icon, title, sub }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 w-full text-left p-[13px] rounded-xl border-[1.5px] transition ${
        active ? 'bg-[#1B3A4B]/8 border-[#1B3A4B] dark:border-[#7FB6CC]' : 'bg-slate-50 dark:bg-white/[.04] border-slate-200 dark:border-white/[.08]'}`}>
      <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-white dark:bg-white/[.06] text-[#1B3A4B] dark:text-[#7FB6CC] border border-slate-200 dark:border-white/[.08]">{icon}</span>
      <span className="flex-1">
        <span className="block text-[13.5px] font-semibold">{title}</span>
        <span className="block text-[11.5px] text-slate-500 dark:text-slate-400">{sub}</span>
      </span>
      {active && <Check className="w-[18px] h-[18px] text-[#1B3A4B] dark:text-[#7FB6CC]" />}
    </button>
  );
}
