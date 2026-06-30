import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Clock, 
  Download, 
  Search, 
  Filter,
  User,
  Globe,
  Activity as ActivityIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminActivityLogs() {
  const { isAuthenticated } = useAdmin();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    const q = query(
      collection(db, 'adminActivities'),
      orderBy('timestamp', 'desc'),
      limit(100) // Show last 100 activities
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

  const filteredActivities = activities.filter(a => 
    (a.adminName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (a.activityType?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (a.page?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

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
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#0F1A2E] p-4 rounded-xl border border-slate-200 dark:border-white/[.08] shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input 
              placeholder="Search by admin, action, or page..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> More Filters
          </Button>
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
                filteredActivities.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {log.timestamp?.toDate().toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/[.06] flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {log.adminName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{log.adminName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        log.activityType === 'login' ? 'default' : 
                        log.activityType === 'logout' ? 'destructive' : 
                        'secondary'
                      } className="uppercase text-[10px] px-1.5 py-0">
                        {log.activityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {log.page || 'System'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400 italic">
                      {log.details || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
