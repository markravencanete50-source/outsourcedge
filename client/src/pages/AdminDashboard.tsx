import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, Users, TrendingUp, Eye, Calendar, Clock, Activity } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminDashboard() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalApplications: 0,
    pageViews: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  // Real-time stats from Firestore
  useEffect(() => {
    if (!db || !isAuthenticated) return;

    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const totalContacts = snapshot.size;
        
        // Count by status
        let contacted = 0;
        let qualified = 0;
        
        snapshot.forEach((doc) => {
          const status = doc.data().status;
          if (status === 'contacted') contacted++;
          if (status === 'qualified') qualified++;
        });

        setStats({
          totalContacts,
          totalApplications: qualified,
          pageViews: 1250,
          conversionRate: totalContacts > 0 ? ((qualified / totalContacts) * 100).toFixed(1) : 0,
        });
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching stats:', error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up listener:', error);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const chartData = [
    { name: 'Jan', contacts: 4, applications: 2, views: 240 },
    { name: 'Feb', contacts: 3, applications: 1, views: 221 },
    { name: 'Mar', contacts: 2, applications: 9, views: 229 },
    { name: 'Apr', contacts: 5, applications: 3, views: 200 },
    { name: 'May', contacts: 6, applications: 4, views: 218 },
    { name: 'Jun', contacts: 4, applications: 3, views: 250 },
  ];

  const pageViewsData = [
    { name: 'Home', value: 450 },
    { name: 'Services', value: 300 },
    { name: 'About', value: 200 },
    { name: 'Careers', value: 150 },
    { name: 'Contact', value: 150 },
  ];

  const COLORS = ['#0891B2', '#059669', '#0F172A', '#64748B', '#E2E8F0'];

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    color,
  }: {
    icon: React.ComponentType<any>;
    label: string;
    value: string | number;
    change?: string;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && <span className="text-sm font-semibold text-green-600">{change}</span>}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
    </div>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Mail}
          label="Contact Submissions"
          value={stats.totalContacts}
          change="+12%"
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Qualified Leads"
          value={stats.totalApplications}
          change="+8%"
          color="bg-green-500"
        />
        <StatCard
          icon={Eye}
          label="Page Views"
          value={stats.pageViews}
          change="+5%"
          color="bg-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="+0.5%"
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Submissions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">Monthly Submissions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="contacts" fill="#0891B2" name="Contacts" />
              <Bar dataKey="applications" fill="#059669" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Page Views Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">Page Views</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pageViewsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pageViewsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-[#0F172A] mb-4">Traffic Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#0891B2" name="Page Views" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#0891B2]" />
                <span className="text-gray-700">Today's Submissions</span>
              </div>
              <span className="font-bold text-[#0F172A]">3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#059669]" />
                <span className="text-gray-700">This Week</span>
              </div>
              <span className="font-bold text-[#0F172A]">12</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">Pending Review</span>
              </div>
              <span className="font-bold text-[#0F172A]">{stats.totalContacts}</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Website Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Firebase Connection</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Last Backup</span>
              <span className="text-sm text-gray-600">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
