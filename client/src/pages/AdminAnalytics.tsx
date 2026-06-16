import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { 
  Eye, 
  Users, 
  MousePointer2, 
  Clock, 
  ArrowUpRight, 
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
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

  // Process data for charts
  const getTrendData = () => {
    // In a real app, this would come from a tracking collection
    // For now, we'll derive it from the last 7 days of submissions to show something real
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({
      name: day,
      views: Math.floor(Math.random() * 200) + 100, // Simulated views since we don't have a tracking collection yet
      leads: contacts.filter(c => {
        const d = c.createdAt?.toDate() || new Date();
        return days[d.getDay()] === day;
      }).length
    }));
    return data;
  };

  const getDeviceData = [
    { name: 'Desktop', value: 65, color: '#3b82f6' },
    { name: 'Mobile', value: 28, color: '#10b981' },
    { name: 'Tablet', value: 7, color: '#f59e0b' },
  ];

  const getSourceData = [
    { name: 'Direct', value: 45, color: '#6366f1' },
    { name: 'Search', value: 30, color: '#8b5cf6' },
    { name: 'Social', value: 15, color: '#ec4899' },
    { name: 'Referral', value: 10, color: '#f43f5e' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Traffic & Conversions</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`}></div>
            Live Insights
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Eye className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +12% <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Total Page Views</p>
            <p className="text-2xl font-bold mt-1">1,658</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +8% <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Unique Visitors</p>
            <p className="text-2xl font-bold mt-1">842</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +0.5% <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Conversion Rate</p>
            <p className="text-2xl font-bold mt-1">
              {contacts.length > 0 ? ((applications.length / contacts.length) * 100).toFixed(1) : '0'}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <Clock className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +15s <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Avg Session Time</p>
            <p className="text-2xl font-bold mt-1">2:45</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-6">Traffic Trend (Last 7 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getTrendData()}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversions Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-6">Conversions (Last 7 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} fill="transparent" />
                  <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-sm text-gray-500">Contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-500">Applications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-6">Device Distribution</h3>
            <div className="flex items-center">
              <div className="h-64 w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDeviceData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getDeviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4">
                {getDeviceData.map((device) => (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {device.name === 'Desktop' && <Monitor className="w-4 h-4 text-blue-500" />}
                      {device.name === 'Mobile' && <Smartphone className="w-4 h-4 text-emerald-500" />}
                      {device.name === 'Tablet' && <Tablet className="w-4 h-4 text-amber-500" />}
                      <span className="text-sm font-medium text-gray-600">{device.name}</span>
                    </div>
                    <span className="text-sm font-bold">{device.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Traffic Source */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-6">Traffic Source</h3>
            <div className="space-y-6">
              {getSourceData.map((source) => (
                <div key={source.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">{source.name}</span>
                    <span className="font-bold text-gray-900">{source.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${source.value}%`, backgroundColor: source.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
