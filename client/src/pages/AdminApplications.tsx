import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { Users, Trash2, Eye, Download, Search, Filter, CheckCircle, Clock } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  message: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'rejected' | 'accepted';
  rating?: number;
}

export default function AdminApplications() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'rejected' | 'accepted'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  // Mock data - in production, fetch from Firestore
  useEffect(() => {
    const mockApplications: Application[] = [
      {
        id: '1',
        name: 'Emma Wilson',
        email: 'emma@example.com',
        phone: '+1 (555) 111-2222',
        position: 'Virtual Assistant',
        message: 'Experienced VA with 5 years in customer support and admin tasks.',
        createdAt: '2024-06-14T11:20:00',
        status: 'new',
      },
      {
        id: '2',
        name: 'James Brown',
        email: 'james@example.com',
        phone: '+1 (555) 222-3333',
        position: 'Customer Service Representative',
        message: 'Bilingual support specialist with excellent communication skills.',
        createdAt: '2024-06-13T15:45:00',
        status: 'reviewed',
        rating: 4,
      },
      {
        id: '3',
        name: 'Lisa Garcia',
        email: 'lisa@example.com',
        phone: '+1 (555) 333-4444',
        position: 'Property Management Specialist',
        message: 'Property manager with 8 years experience managing 100+ units.',
        createdAt: '2024-06-12T10:15:00',
        status: 'accepted',
        rating: 5,
      },
      {
        id: '4',
        name: 'Robert Chen',
        email: 'robert@example.com',
        phone: '+1 (555) 444-5555',
        position: 'Data Entry Specialist',
        message: 'Fast and accurate data entry professional.',
        createdAt: '2024-06-11T09:30:00',
        status: 'rejected',
      },
    ];
    setApplications(mockApplications);
    setFilteredApplications(mockApplications);
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      setApplications(applications.filter((a) => a.id !== id));
      setSelectedApplication(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: Application['status']) => {
    setApplications(
      applications.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const handleRating = (id: string, rating: number) => {
    setApplications(
      applications.map((a) => (a.id === id ? { ...a, rating } : a))
    );
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === 'new').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-[#0F172A]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">New</p>
          <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">Accepted</p>
          <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2]"
            />
          </div>
          <div className="flex gap-2">
            <Filter className="w-5 h-5 text-gray-400 mt-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2]"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedApplication(application)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{application.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{application.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{application.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(application);
                        }}
                        className="text-[#0891B2] hover:text-[#0891B2]/80 transition"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Panel */}
        {selectedApplication && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0F172A]">Application</h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Name</p>
                <p className="text-gray-900 font-medium">{selectedApplication.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Position</p>
                <p className="text-gray-900">{selectedApplication.position}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Email</p>
                <a href={`mailto:${selectedApplication.email}`} className="text-[#0891B2] hover:underline">
                  {selectedApplication.email}
                </a>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Phone</p>
                <a href={`tel:${selectedApplication.phone}`} className="text-[#0891B2] hover:underline">
                  {selectedApplication.phone}
                </a>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Message</p>
                <p className="text-gray-900 text-sm">{selectedApplication.message}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(selectedApplication.id, star)}
                      className={`text-2xl ${
                        (selectedApplication.rating || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                <select
                  value={selectedApplication.status}
                  onChange={(e) =>
                    handleStatusChange(selectedApplication.id, e.target.value as Application['status'])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0891B2]"
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-4 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0891B2] text-white rounded-lg hover:bg-[#0891B2]/90 transition">
                  <Users className="w-4 h-4" />
                  Send Offer
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                  <Download className="w-4 h-4" />
                  Download CV
                </button>
                <button
                  onClick={() => handleDelete(selectedApplication.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
