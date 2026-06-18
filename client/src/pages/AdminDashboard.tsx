// Add these imports at the top
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

// Inside your AdminDashboard component, add this new section:

export default function AdminDashboard() {
  // ... existing code ...
  
  // NEW: CRM & Activity Tracking State
  const [pipelineData, setPipelineData] = useState({
    totalValue: 0,
    activeOpportunities: 0,
    closedWon: 0,
    winRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // NEW: Fetch CRM Pipeline Data
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
    });
    
    return () => unsubscribe();
  }, []);

  // NEW: Fetch Recent Admin Activities
  useEffect(() => {
    if (!db) return;
    
    const q = query(
      collection(db, 'adminActivities'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentActivities(activities);
    });
    
    return () => unsubscribe();
  }, []);

  // NEW: Fetch Active Admin Sessions
  useEffect(() => {
    if (!db) return;
    
    const q = query(
      collection(db, 'adminActivities'),
      where('activityType', '==', 'login'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActiveSessions(sessions);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Existing Dashboard Content */}
        
        {/* NEW: Growth & Pipeline Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Growth & Pipeline</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Pipeline Value</p>
                  <h3 className="text-3xl font-bold text-blue-900 mt-2">
                    ${pipelineData.totalValue.toLocaleString()}
                  </h3>
                </div>
                <DollarSign className="w-12 h-12 text-blue-300" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Active Opportunities</p>
                  <h3 className="text-3xl font-bold text-purple-900 mt-2">
                    {pipelineData.activeOpportunities}
                  </h3>
                </div>
                <Users className="w-12 h-12 text-purple-300" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Closed Won</p>
                  <h3 className="text-3xl font-bold text-green-900 mt-2">
                    {pipelineData.closedWon}
                  </h3>
                </div>
                <TrendingUp className="w-12 h-12 text-green-300" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Win Rate</p>
                  <h3 className="text-3xl font-bold text-orange-900 mt-2">
                    {pipelineData.winRate}%
                  </h3>
                </div>
                <Activity className="w-12 h-12 text-orange-300" />
              </div>
            </div>
          </div>
        </section>

        {/* NEW: Admin Activity Feed */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Admin Activity Log</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Dashboard Activities</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                      <div className="w-2 h-2 rounded-full bg-[#0891B2] mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.adminName} <span className="text-slate-500 font-normal">{activity.activityType}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{activity.page || 'Dashboard'}</p>
                        {activity.details && <p className="text-xs text-slate-600 mt-1">{activity.details}</p>}
                        <p className="text-xs text-slate-400 mt-2">
                          {activity.timestamp?.toDate().toLocaleString() || 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No activities yet</p>
                )}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Admin Sessions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeSessions.length > 0 ? (
                  activeSessions.map((session) => (
                    <div key={session.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{session.adminName}</p>
                        <p className="text-xs text-slate-500 mt-1">Logged in</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {session.timestamp?.toDate().toLocaleString() || 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No active sessions</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
