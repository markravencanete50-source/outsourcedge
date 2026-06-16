import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, Users, TrendingUp, Eye, Calendar, Clock, Activity, Briefcase } from 'lucide-react';
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

const COLORS = ['#0891B2', '#059669', '#0F172A', '#64748B', '#E2E8F0'];

export default function AdminDashboard() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    totalContacts: 0,
    newLeads: 0,
    totalApplications: 0,
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
      // 1. Fetch Contacts for Analytics
      const contactsRef = collection(db, 'contacts');
      const qContacts = query(contactsRef, orderBy('createdAt', 'desc'));

      const unsubscribeContacts = onSnapshot(qContacts, (contactsSnapshot) => {
        // 2. Fetch Applications for Job Stats
        const appsRef = collection(db, 'applications');
        const qApps = query(appsRef, orderBy('createdAt', 'desc'));

        onSnapshot(qApps, (appsSnapshot) => {
          const totalContacts = contactsSnapshot.size;
          const totalApplications = appsSnapshot.size;
          
          let newLeads = 0;
          const monthCounts: { [key: string]: number } = {};
          const serviceCounts: { [key: string]: number } = {};

          // Process Contacts
          contactsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            
            // Count New Leads (last 7 days)
            if (data.createdAt) {
              const createdDate = data.createdAt.toDate();
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              if (createdDate > sevenDaysAgo) newLeads++;

              // Group by Month
              const monthName = createdDate.toLocaleString('default', { month: 'short' });
              monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
            }

            // Group by Service
            const service = data.service || 'General Inquiry';
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
          });

          // Format Monthly Data (Last 6 months)
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

          // Update All Stats
          setStats({
            totalContacts,
            newLeads,
            totalApplications,
            conversionRate: totalContacts > 0 ? Math.round((totalApplications / totalContacts) * 100) : 0,
          });
          
          setIsLoading(false);
        });
      });

      return () => unsubscribeContacts();
    } catch (error) {
      console.error('Error setting up dashboard listeners:', error);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const StatCard = ({ icon: Icon, label, value, color, subtext }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center text-green-600 text-sm font-medium">
          <Activity className="w-4 h-4 mr-1" />
          Live
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-[#0F172A]">{value}</h3>
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Real-time performance metrics from your database.</p>
      </div>

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
          subtext="Last 7 Days"
        />
        <StatCard
          icon={Briefcase}
          label="Job Applications"
          value={stats.totalApplications}
          color="bg-purple-500"
          subtext="Real-time"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          color="bg-emerald-500"
          subtext="Lead to App"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inquiry Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Inquiry Trends</h3>
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              Updated just now
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="contacts" fill="#0891B2" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Services */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Popular Services</h3>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="h-80 flex items-center justify-center">
            {serviceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400">No inquiry data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
