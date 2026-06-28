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

export default function AdminCeoDashboard() {
  const { adminUser, adminName, adminEmail } = useAdmin();
  const { logActivity } = useAdminActivityLogger();

  const [contactsCount, setContactsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
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
      (s) => setAdmins(s.docs.map((d) => ({ uid: d.id, ...(d.data() as object) }) as AdminRecord)),
      (err) => console.error('Admin roster error:', err),
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
          suspendedBy: adminEmail || 'CEO',
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
      toast.error(e?.message || 'Action failed — check Firestore permissions');
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">CEO Command Center</h1>
            <p className="text-slate-500 mt-1">
              Executive overview and administrative access control.
            </p>
          </div>
        </div>

        {/* Business KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className={`inline-flex p-2.5 rounded-lg ${kpi.tint}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-500 font-medium mt-3">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
            </div>
          ))}
        </div>

        {/* Pipeline chart + admin summary */}
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
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" /> Access Control
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total admins</span>
                <span className="text-xl font-bold text-slate-900">{admins.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Active
                </span>
                <span className="text-xl font-bold text-green-600">{activeAdmins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <ShieldOff className="w-4 h-4 text-red-600" /> Suspended
                </span>
                <span className="text-xl font-bold text-red-600">{suspendedAdmins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin management */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1B3A4B]" /> Admin Accounts
            </h3>
            <Badge variant="secondary">{admins.length} accounts</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                      No admin accounts found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => {
                    const isSelf = admin.uid === adminUser?.uid;
                    const isFounder = isBootstrapCeo(admin.email);
                    const isSuspended = admin.status === 'suspended';
                    return (
                      <tr key={admin.uid} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {admin.displayName || '—'}
                          {isSelf && <span className="ml-2 text-[10px] text-slate-400">(you)</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{admin.email}</td>
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

      {/* Confirmation dialog */}
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
