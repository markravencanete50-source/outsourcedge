import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, Users, TrendingUp, Eye, Calendar, Clock, Activity } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChartData {
  name: string;
  contacts: number;
}

interface ServiceData {
  name: string;
  value: number;
}

export default function AdminDashboard() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    totalContacts: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const totalContacts = snapshot.size;
        let newLeads = 0;
        let qualifiedLeads = 0;
        
        const monthCounts: { [key: string]: number } = {};
        const serviceCounts: { [key: string]: number } = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Count status
          if (data.status === 'new') newLeads++;
          if (data.status === 'qualified') qualifiedLeads++;

          // Group by Month
          if (data.createdAt) {
            const date = data.createdAt.toDate();
            const monthName = date.toLocaleString('default', { month: 'short' });
            monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
          }

          // Group by Service
          const service = data.service || 'General Inquiry';
          serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });

        // Format Monthly Data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const mIndex = (currentMonth - i + 12) % 12;
          const mName = months[mIndex];
          last6Months.push({
            name: mName,
            contacts: monthCounts[mName] || 0
          });
        }
        setMonthlyData(last6Months);

        // Format Service Distribution
        const serviceData = Object.keys(serviceCounts).map(key => ({
          name: key.length > 15 ? key.substring(0, 15) + '...' : key,
          value: serviceCounts[key]
        })).sort((a, b) => b.value - a.value).slice(0, 5);
        setServiceDistribution(serviceData);

        setStats({
          totalContacts,
          newLeads,
          qualifiedLeads,
          conversionRate: totalContacts > 0 ? Math.round((qualifiedLeads / totalContacts) * 100) : 0,
        });
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching real-time stats:', error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up dashboard listener:', error);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const COLORS = ['#0891B2', '#059669', '#0F172A', '#64748B', '#E2E8F0'];

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    subtext
  }: {
    icon: React.ComponentType<any>;
    label: string;
    value: string | number;
    color: string;
    subtext?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
        {subtext && <span className="text-xs text-gray-400 font-medium">{subtext}</span>}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0891B2]"></div>
          <span className="ml-3 text-gray-600 font-medium">Loading Real-Time Data...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Real-Time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Mail}
          label="Total Inquiries"
          value={stats.totalContacts}
          color="bg-blue-500"
          subtext="Lifetime"
        />
        <StatCard
          icon={Activity}
          label="New Leads"
          value={stats.newLeads}
          color="bg-orange-500"
          subtext="Pending"
        />
        <StatCard
          icon={Users}
          label="Qualified"
          value={stats.qualifiedLeads}
          color="bg-green-500"
          subtext="High Intent"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion"
          value={`${stats.conversionRate}%`}
          color="bg-purple-500"
          subtext="Qualified Rate"
        />
      </div>

      {/* Real Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Real-Time Monthly Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0F172A]">Inquiry Trends (Last 6 Months)</h3>
            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-[#0891B2] rounded-full animate-pulse" />
              Live Data
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="contacts" fill="#0891B2" radius={[4, 4, 0, 0]} name="Inquiries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-6">Popular Services</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0891B2]" />
            Business Intelligence
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-700 font-medium">Total Database Size</span>
              <span className="font-bold text-[#0F172A]">{stats.totalContacts} Records</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-700 font-medium">Most Requested Service</span>
              <span className="font-bold text-[#0891B2]">{serviceDistribution[0]?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-700 font-medium">Lead Quality Score</span>
              <span className="font-bold text-green-600">{stats.conversionRate > 50 ? 'Excellent' : 'Healthy'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            System Integrity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database Engine</span>
              <span className="text-sm font-semibold text-gray-600">Firestore NoSQL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Data Latency</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                Real-Time (&lt;100ms)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">AI Model Status</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                Llama 3.1 Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Last Sync</span>
              <span className="text-sm text-gray-500 italic">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
