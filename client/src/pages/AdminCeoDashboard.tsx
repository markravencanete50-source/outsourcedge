import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { isBootstrapCeo } from '@/lib/roles';
import type { AdminRecord } from '@/types/admin';
import { STAGES } from '@/types/crm';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Crown,
  Mail,
  DollarSign,
  Users,
  TrendingUp,
  Briefcase,
  FileText,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  CheckCircle2,
  Search,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Tailwind bg-* class → hex, so recharts bars match the CRM stage colors.
const STAGE_HEX: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-purple-500': '#a855f7',
  'bg-indigo-500': '#6366f1',
  'bg-orange-500': '#f97316',
  'bg-yellow-500': '#eab308',
  'bg-green-600': '#16a34a',
  'bg-emerald-500': '#10b981',
  'bg-gray-500': '#6b7280',
};

type PendingAction =
  | { type: 'suspend' | 'reactivate'; admin: AdminRecord }
  | null;

// Compact initials for the avatar chips in the roster.
function initials(name?: string, email?: string) {
  const source = (name || email || '?').trim();
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Best-effort timestamp formatter for Firestore Timestamp | Date | null.
function formatWhen(value: any): string | null {
  if (!value) return null;
  try {
    const d = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

export default function AdminCeoDashboard() {
  const { adminUser, adminEmail } = useAdmin();
  const { logActivity } = useAdminActivityLogger();

  const [contactsCount, setContactsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<PendingAction>(null);
  const [working, setWorking] = useState(false);

  // ── Live business metrics ────────────────────────────────────────────────
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'contacts'), (s) => setContactsCount(s.size));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'applications'), (s) => setApplicationsCount(s.size));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'jobs'), (s) => {
      setActiveJobsCount(s.docs.filter((d) => (d.data() as any).status === 'active').length);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'clients'), (s) => {
      setOpportunities(s.docs.map((d) => d.data()));
    });
    return () => unsub();
  }, []);

  // ── Live admin roster ────────────────────────────────────────────────────
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'admins'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (s) => {
        setAdmins(
          s.docs.map((d) => {
            // Normalize legacy field names so every row displays consistently.
            const data = d.data() as any;
            return {
              uid: d.id,
              ...data,
              displayName: data.displayName || data.name || '',
              email: data.email || data.emailaddress || '',
            } as AdminRecord;
          }),
        );
        setAdminsLoading(false);
      },
      (err) => {
        console.error('Admin roster error:', err);
        setAdminsLoading(false);
        toast.error('Could not load the admin roster — check Firestore rules deployment.');
      },
    );
    return () => unsub();
  }, []);

  // ── Derived figures ──────────────────────────────────────────────────────
  const pipeline = useMemo(() => {
    const totalValue = opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const won = opportunities.filter(
      (o) => o.stage === 'closed-won' || o.stage === 'active-client',
    ).length;
    const winRate = opportunities.length ? Math.round((won / opportunities.length) * 100) : 0;
    return { totalValue, count: opportunities.length, won, winRate };
  }, [opportunities]);

  const stageChartData = useMemo(
    () =>
      STAGES.map((stage) => ({
        label: stage.label,
        value: opportunities.filter((o) => o.stage === stage.id).length,
        fill: STAGE_HEX[stage.color] || '#64748b',
      })),
    [opportunities],
  );

  const activeAdmins = admins.filter((a) => a.status === 'active').length;
  const suspendedAdmins = admins.filter((a) => a.status === 'suspended').length;

  const filteredAdmins = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return admins;
    return admins.filter(
      (a) =>
        (a.displayName || '').toLowerCase().includes(term) ||
        (a.email || '').toLowerCase().includes(term) ||
        (a.role || '').toLowerCase().includes(term) ||
        (a.status || '').toLowerCase().includes(term),
    );
  }, [admins, search]);

  // ── Admin actions ────────────────────────────────────────────────────────
  const canManage = (admin: AdminRecord) =>
    admin.uid !== adminUser?.uid && !isBootstrapCeo(admin.email);

  const runAction = async () => {
    if (!pending || !db) return;
    const { type, admin } = pending;
    setWorking(true);
    try {
      const ref = doc(db, 'admins', admin.uid);
      if (type === 'suspend') {
        await updateDoc(ref, {
          status: 'suspended',
          suspendedAt: serverTimestamp(),
          suspendedBy: (adminEmail || 'CEO').toLowerCase(),
          updatedAt: serverTimestamp(),
        });
        await logActivity('update', 'CEO Command Center', `Suspended admin ${admin.email}`, {
          targetUid: admin.uid,
        });
        toast.success(`${admin.displayName || admin.email} has been suspended`);
      } else {
        await updateDoc(ref, {
          status: 'active',
          suspendedAt: null,
          suspendedBy: null,
          updatedAt: serverTimestamp(),
        });
        await logActivity('update', 'CEO Command Center', `Reactivated admin ${admin.email}`, {
          targetUid: admin.uid,
        });
        toast.success(`${admin.displayName || admin.email} has been reactivated`);
      }
    } catch (e: any) {
      console.error('Admin action failed:', e);
      // Surface the most common, actionable failure clearly.
      if (e?.code === 'permission-denied') {
        toast.error(
          'Permission denied. Deploy the security rules: firebase deploy --only firestore:rules',
          { duration: 8000 },
        );
      } else {
        toast.error(e?.message || 'Action failed — please try again.');
      }
    } finally {
      setWorking(false);
      setPending(null);
    }
  };

  const kpis = [
    { label: 'Total Inquiries', value: contactsCount, icon: Mail, tint: 'bg-blue-50 text-blue-600' },
    {
      label: 'Pipeline Value',
      value: `$${pipeline.totalValue.toLocaleString()}`,
      icon: DollarSign,
      tint: 'bg-green-50 text-green-600',
    },
    { label: 'Active Deals', value: pipeline.count, icon: Users, tint: 'bg-purple-50 text-purple-600' },
    { label: 'Win Rate', value: `${pipeline.winRate}%`, icon: TrendingUp, tint: 'bg-orange-50 text-orange-600' },
    { label: 'Job Applications', value: applicationsCount, icon: FileText, tint: 'bg-indigo-50 text-indigo-600' },
    { label: 'Active Jobs', value: activeJobsCount, icon: Briefcase, tint: 'bg-teal-50 text-teal-600' },
  ];

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* ── Executive header ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1B3A4B] to-[#0F172A] p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="absolute -bottom-12 right-24 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500 text-slate-900 shadow-md ring-4 ring-amber-500/20">
                <Crown className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">CEO Command Center</h1>
                <p className="mt-1 text-sm text-white/70">
                  Executive overview &amp; administrative access control
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm self-start sm:self-auto">
              <Clock className="h-4 w-4" />
              {today}
            </div>
          </div>
        </div>

        {/* ── Business KPIs ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`inline-flex p-2.5 rounded-lg ${kpi.tint}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-500 font-medium mt-3">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
            </div>
          ))}
        </div>

        {/* ── Pipeline chart + access summary ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1B3A4B]" /> Pipeline by Stage
            </h3>
            {opportunities.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm italic">
                No pipeline data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stageChartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stageChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" /> Access Control
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" /> Total admins
                </span>
                <span className="text-xl font-bold text-slate-900">{admins.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                <span className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Active
                </span>
                <span className="text-xl font-bold text-green-600">{activeAdmins}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
                <span className="text-sm text-red-700 flex items-center gap-2">
                  <ShieldOff className="w-4 h-4 text-red-600" /> Suspended
                </span>
                <span className="text-xl font-bold text-red-600">{suspendedAdmins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Admin management ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1B3A4B]" /> Admin Accounts
              <Badge variant="secondary" className="ml-1">{admins.length}</Badge>
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, role…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-3 font-medium">Member</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Last login</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {adminsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="ml-auto h-8 w-24" /></td>
                    </tr>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                      {search ? 'No admins match your search.' : 'No admin accounts found.'}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => {
                    const isSelf = admin.uid === adminUser?.uid;
                    const isFounder = isBootstrapCeo(admin.email);
                    const isSuspended = admin.status === 'suspended';
                    const lastLogin = formatWhen(admin.lastLoginAt);
                    return (
                      <tr key={admin.uid} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${
                                admin.role === 'ceo'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {initials(admin.displayName, admin.email)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">
                                {admin.displayName || '—'}
                                {isSelf && <span className="ml-2 text-[10px] text-slate-400">(you)</span>}
                              </div>
                              <div className="text-slate-500 truncate">{admin.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {admin.role === 'ceo' ? (
                            <Badge className="bg-amber-500 hover:bg-amber-500 text-slate-900">
                              <Crown className="w-3 h-3 mr-1" /> CEO
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isSuspended ? (
                            <Badge variant="destructive">Suspended</Badge>
                          ) : (
                            <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{lastLogin || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          {!canManage(admin) ? (
                            <span className="text-xs text-slate-400 italic">
                              {isSelf ? 'Your account' : isFounder ? 'Protected' : '—'}
                            </span>
                          ) : isSuspended ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-200 hover:bg-green-50"
                              onClick={() => setPending({ type: 'reactivate', admin })}
                            >
                              <ShieldCheck className="w-4 h-4 mr-1" /> Reactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-700 border-red-200 hover:bg-red-50"
                              onClick={() => setPending({ type: 'suspend', admin })}
                            >
                              <ShieldOff className="w-4 h-4 mr-1" /> Suspend
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Confirmation dialog ────────────────────────────────────────────── */}
      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert
                className={`w-5 h-5 ${pending?.type === 'suspend' ? 'text-red-600' : 'text-green-600'}`}
              />
              {pending?.type === 'suspend' ? 'Suspend admin access?' : 'Reactivate admin access?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.type === 'suspend' ? (
                <>
                  <strong>{pending?.admin.displayName || pending?.admin.email}</strong> will be
                  signed out immediately and blocked from the admin area until reactivated.
                </>
              ) : (
                <>
                  <strong>{pending?.admin.displayName || pending?.admin.email}</strong> will regain
                  full admin access right away.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={working}
              onClick={(e) => {
                e.preventDefault();
                runAction();
              }}
              className={
                pending?.type === 'suspend'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {working
                ? 'Working…'
                : pending?.type === 'suspend'
                  ? 'Suspend'
                  : 'Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
