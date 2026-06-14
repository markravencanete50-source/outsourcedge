import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, Eye, Clock, Download } from 'lucide-react';

export default function AdminAnalytics() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  const trafficData = [
    { date: 'Jun 1', views: 240, users: 45, bounce: 24 },
    { date: 'Jun 2', views: 221, users: 38, bounce: 22 },
    { date: 'Jun 3', views: 229, users: 42, bounce: 20 },
    { date: 'Jun 4', views: 200, users: 35, bounce: 25 },
    { date: 'Jun 5', views: 218, users: 40, bounce: 19 },
    { date: 'Jun 6', views: 250, users: 48, bounce: 18 },
    { date: 'Jun 7', views: 210, users: 39, bounce: 23 },
  ];

  const conversionData = [
    { date: 'Jun 1', contacts: 4, applications: 2, conversions: 2.4 },
    { date: 'Jun 2', contacts: 3, applications: 1, conversions: 1.8 },
    { date: 'Jun 3', contacts: 5, applications: 3, conversions: 3.2 },
    { date: 'Jun 4', contacts: 2, applications: 1, conversions: 1.5 },
    { date: 'Jun 5', contacts: 6, applications: 4, conversions: 4.1 },
    { date: 'Jun 6', contacts: 4, applications: 2, conversions: 2.8 },
    { date: 'Jun 7', contacts: 7, applications: 5, conversions: 5.2 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, users: 520 },
    { name: 'Mobile', value: 25, users: 200 },
    { name: 'Tablet', value: 10, users: 80 },
  ];

  const sourceData = [
    { name: 'Direct', value: 35, users: 280 },
    { name: 'Organic Search', value: 40, users: 320 },
    { name: 'Social Media', value: 15, users: 120 },
    { name: 'Referral', value: 10, users: 80 },
  ];

  const pageData = [
    { page: 'Home', views: 450, avgTime: '2:30', bounce: 22 },
    { page: 'Services', views: 320, avgTime: '3:45', bounce: 18 },
    { page: 'About', views: 210, avgTime: '2:15', bounce: 25 },
    { page: 'Careers', views: 180, avgTime: '4:20', bounce: 15 },
    { page: 'Contact', views: 150, avgTime: '1:50', bounce: 35 },
  ];

  const MetricCard = ({
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

  return (
    <AdminLayout>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={Eye}
          label="Total Page Views"
          value="1,658"
          change="+12%"
          color="bg-blue-500"
        />
        <MetricCard
          icon={Users}
          label="Unique Visitors"
          value="842"
          change="+8%"
          color="bg-green-500"
        />
        <MetricCard
          icon={TrendingUp}
          label="Conversion Rate"
          value="3.2%"
          change="+0.5%"
          color="bg-purple-500"
        />
        <MetricCard
          icon={Clock}
          label="Avg Session Time"
          value="2:45"
          change="+15s"
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">Traffic Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891B2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#0891B2" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">Conversions (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="contacts" stroke="#0891B2" name="Contacts" />
              <Line type="monotone" dataKey="applications" stroke="#059669" name="Applications" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device & Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Device Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">Device Distribution</h3>
          <div className="space-y-4">
            {deviceData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-600">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#0891B2] h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.users} users</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Source */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">Traffic Source</h3>
          <div className="space-y-4">
            {sourceData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-600">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#059669] h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.users} users</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0F172A]">Top Pages</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-[#0891B2] hover:bg-blue-50 rounded-lg transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Page</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Views</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Avg Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bounce Rate</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((page) => (
                <tr key={page.page} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{page.page}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{page.views}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{page.avgTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{page.bounce}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
