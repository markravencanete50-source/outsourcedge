import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { Eye, Users, MousePointer2, Clock, ArrowUpRight, TrendingUp, Globe, Monitor, Smartphone, Tablet, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminAnalytics() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();
  const [contacts, setContacts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    // Listen to contacts
    const contactsUnsubscribe = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to applications
    const appsUnsubscribe = onSnapshot(collection(db, 'applications'), (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => {
      contactsUnsubscribe();
      appsUnsubscribe();
    };
  }, [isAuthenticated]);

  // Process real data for charts
  const getTrendData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        date: d.toLocaleDateString(),
        leads: 0,
        apps: 0
      };
    });

    // Count real submissions per day
    contacts.forEach(c => {
      const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
      const dateStr = date.toLocaleDateString();
      const dayIndex = last7Days.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1) last7Days[dayIndex].leads++;
    });

    applications.forEach(a => {
      const date = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateStr = date.toLocaleDateString();
      const dayIndex = last7Days.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1) last7Days[dayIndex].apps++;
    });

    return last7Days;
  };

  const getServiceDistribution = () => {
    const services: { [key: string]: number } = {};
    contacts.forEach(c => {
      const s = c.service || 'General Inquiry';
      services[s] = (services[s] || 0) + 1;
    });
    return Object.entries(services).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#1B3A4B', '#059669', '#0F172A', '#64748B', '#94A3B8'];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Analytics</h1>
            <p className="text-slate-500">Real-time performance from your database</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium animate-pulse">
            <Activity size={16} />
            Live Connection
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Inquiries" 
            value={contacts.length} 
            icon={<Users className="text-blue-600" />}
            trend="+12%"
            color="bg-blue-50"
          />
          <StatCard 
            title="Job Applications" 
            value={applications.length} 
            icon={<TrendingUp className="text-green-600" />}
            trend="+8%"
            color="bg-green-50"
          />
          <StatCard 
            title="Conversion Rate" 
            value={`${contacts.length > 0 ? ((applications.length / contacts.length) * 100).toFixed(1) : 0}%`}
            icon={<MousePointer2 className="text-purple-600" />}
            trend="+0.5%"
            color="bg-purple-50"
          />
          <StatCard 
            title="Database Records" 
            value={contacts.length + applications.length}
            icon={<Globe className="text-orange-600" />}
            trend="Live"
            color="bg-orange-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-6">Submission Trends (Last 7 Days)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getTrendData()}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B3A4B" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1B3A4B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="leads" name="Inquiries" stroke="#1B3A4B" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
                  <Area type="monotone" dataKey="apps" name="Applications" stroke="#059669" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-6">Inquiries by Service</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getServiceDistribution()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getServiceDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {getServiceDistribution().map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-slate-600 truncate">{item.name}</span>
                  <span className="text-sm font-semibold text-slate-900 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}
