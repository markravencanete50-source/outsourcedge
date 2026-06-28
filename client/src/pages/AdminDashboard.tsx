import { useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Mail, 
  Clock
} from 'lucide-react';
import { Badge } from "@/components/ui/badge"; // Fixed import

export default function AdminDashboard() {
  const { isAuthenticated, isCeo } = useAdmin();
  const { trackPageView } = useAdminActivityLogger();
  
  const [totalInquiries, setTotalInquiries] = useState(0);
  const [pipelineData, setPipelineData] = useState({
    totalValue: 0,
    activeOpportunities: 0,
    closedWon: 0,
    winRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  useEffect(() => {
    trackPageView('Admin Dashboard');
  }, []);

  // Fetch Total Inquiries
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      setTotalInquiries(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  // Fetch CRM Pipeline Data
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'clients'), orderBy('dateAdded', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const opportunities = snapshot.docs.map(doc => doc.data());
      const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
      const closedWon = opportunities.filter(o => o.stage === 'closed-won' || o.stage === 'active-client').length;
      
      setPipelineData({
        totalValue,
        activeOpportunities: opportunities.length,
        closedWon,
        winRate: opportunities.length > 0 ? Math.round((closedWon / opportunities.length) * 100) : 0,
      });
    }, (err) => console.error("Pipeline fetch error:", err));
    return () => unsubscribe();
  }, []);

  // Fetch Recent Admin Activities
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'adminActivities'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Activity fetch error:", err));
    return () => unsubscribe();
  }, []);

  // Fetch Recent Sessions
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'adminActivities'), where('activityType', '==', 'login'), orderBy('timestamp', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Session fetch error:", err));
    return () => unsubscribe();
  }, []);

  if (!isAuthenticated) return <AdminLayout><div className="p-8 text-center">Please login.</div></AdminLayout>;
  // CEOs never see the operational admin dashboard — send them to their portal.
  if (isCeo) return <Redirect to="/admin/ceo" />;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time performance metrics and administrative activity.</p>
        </div>

        {/* Top Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Mail className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Inquiries</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalInquiries}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Pipeline Value</p>
                <h3 className="text-2xl font-bold text-slate-900">${pipelineData.totalValue.toLocaleString()}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Deals</p>
                <h3 className="text-2xl font-bold text-slate-900">{pipelineData.activeOpportunities}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Win Rate</p>
                <h3 className="text-2xl font-bold text-slate-900">{pipelineData.winRate}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Activity & Pipeline Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#1B3A4B]" /> Recent Admin Activity
              </h3>
              <Badge variant="secondary">Live Feed</Badge>
            </div>
            <div className="p-0 max-h-[500px] overflow-y-auto">
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      activity.activityType === 'login' ? 'bg-green-100 text-green-700' :
                      activity.activityType === 'logout' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {activity.adminName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">{activity.adminName || 'Admin'}</p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {activity.timestamp?.toDate().toLocaleTimeString() || 'Recently'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        <span className="font-semibold uppercase text-[10px] mr-2">{activity.activityType}</span>
                        {activity.details || `Viewed ${activity.page || 'Dashboard'}`}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-400 text-sm italic">No activity recorded yet.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" /> Active Sessions
            </h3>
            <div className="space-y-4">
              {activeSessions.length > 0 ? activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                        {session.adminName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{session.adminName || 'Admin'}</p>
                      <p className="text-[10px] text-slate-500">Online now</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-slate-400 text-xs italic py-4">No active sessions.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
