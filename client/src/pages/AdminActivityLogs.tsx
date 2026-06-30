import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Clock, Download, Search, Globe,
  LogIn, LogOut, MousePointerClick, Eye, Plus, Pencil, Trash2, Activity as ActivityIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DateRangeFilter from '@/components/DateRangeFilter';
import { ALL_TIME, DateRange, toJsDate, inRange, rangeLabel } from '@/lib/dateRange';
import { toast } from 'sonner';

// Visual treatment per activity type, so the trail is scannable at a glance.
const TYPE_META: Record<string, { label: string; icon: any; cls: string }> = {
  login:  { label: 'Login',  icon: LogIn,              cls: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' },
  logout: { label: 'Logout', icon: LogOut,             cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
  create: { label: 'Create', icon: Plus,               cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  update: { label: 'Update', icon: Pencil,             cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  delete: { label: 'Delete', icon: Trash2,             cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
  click:  { label: 'Click',  icon: MousePointerClick,  cls: 'bg-slate-100 text-slate-700 dark:bg-white/[.08] dark:text-slate-300' },
  view:   { label: 'View',   icon: Eye,                cls: 'bg-slate-100 text-slate-600 dark:bg-white/[.06] dark:text-slate-400' },
};
const typeMeta = (t: string) => TYPE_META[t] || { label: t || 'Action', icon: ActivityIcon, cls: 'bg-slate-100 text-slate-600 dark:bg-white/[.06] dark:text-slate-400' };

export default function AdminActivityLogs() {
  const { isAuthenticated } = useAdmin();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [range, setRange] = useState<DateRange>(ALL_TIME);

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    const q = query(
      collection(db, 'adminActivities'),
      orderBy('timestamp', 'desc'),
      limit(500) // generous window so day/week/month filters have data to work with
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(data);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load activity logs');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // --- DATA EXTRACTION (Export to CSV) ---
  const exportToCSV = () => {
    if (activities.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ['Timestamp', 'Admin', 'Activity Type', 'Page', 'Details'];
    const rows = activities.map(a => [
      a.timestamp?.toDate().toLocaleString() || 'N/A',
      a.adminName || a.adminEmail || 'N/A',
      a.activityType || 'N/A',
      a.page || 'N/A',
      a.details || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `outsourcedge_activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Logs exported successfully!");
  };

  const filteredActivities = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return activities.filter((a) => {
      if (!inRange(toJsDate(a.timestamp), range)) return false;
      if (!q) return true;
      return (
        (a.adminName?.toLowerCase() || '').includes(q) ||
        (a.adminEmail?.toLowerCase() || '').includes(q) ||
        (a.activityType?.toLowerCase() || '').includes(q) ||
        (a.page?.toLowerCase() || '').includes(q) ||
        (a.details?.toLowerCase() || '').includes(q)
      );
    });
  }, [activities, searchQuery, range]);

  if (!isAuthenticated) return <AdminLayout><div className="p-8 text-center">Please login.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Activity Logs</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Full audit trail of all administrative actions and system heartbeats.</p>
          </div>
          <Button onClick={exportToCSV} className="bg-[#1B3A4B] hover:bg-[#06748F]">
            <Download className="w-4 h-4 mr-2" /> Export to CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 bg-white dark:bg-[#0F1A2E] p-4 rounded-xl border border-slate-200 dark:border-white/[.08] shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search by admin, action, page, or detail..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DateRangeFilter value={range} onChange={setRange} />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredActivities.length}</span> action{filteredActivities.length === 1 ? '' : 's'}
            {range.preset !== 'all' && <> in <span className="font-semibold text-slate-600 dark:text-slate-300">{rangeLabel(range)}</span></>}
          </p>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-[#0F1A2E] rounded-xl border border-slate-200 dark:border-white/[.08] shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/[.04]">
              <TableRow>
                <TableHead className="w-[200px]">Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400 dark:text-slate-500 italic">Loading logs...</TableCell></TableRow>
              ) : filteredActivities.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400 dark:text-slate-500 italic">No activity logs found.</TableCell></TableRow>
              ) : (
                filteredActivities.map((log) => {
                  const when = toJsDate(log.timestamp);
                  const meta = typeMeta(log.activityType);
                  const Icon = meta.icon;
                  const md = log.metadata || {};
                  // Surface useful metadata fields (control, target, ids …) beneath the detail.
                  const mdBits = Object.entries(md)
                    .filter(([k, v]) => v && !['page', 'element'].includes(k) && typeof v !== 'object')
                    .map(([k, v]) => `${k}: ${v}`);
                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[.03] transition-colors align-top">
                      <TableCell className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 shrink-0" />
                          <div className="leading-tight">
                            <div>{when ? when.toLocaleDateString() : '—'}</div>
                            <div className="text-slate-400 dark:text-slate-500">{when ? when.toLocaleTimeString() : ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/[.06] flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                            {(log.adminName || log.adminEmail || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{log.adminName || 'Admin'}</div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{log.adminEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                          <Icon className="w-3 h-3" /> {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                          {log.page || 'System'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 dark:text-slate-300 max-w-[420px]">
                        <div>{log.details || '—'}</div>
                        {mdBits.length > 0 && (
                          <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 truncate">{mdBits.join(' · ')}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
