import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { Mail, Trash2, Eye, Download, Search, Filter } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
  createdAt: string;
  status: 'new' | 'responded' | 'archived';
}

export default function AdminContacts() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'responded' | 'archived'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  // Mock data - in production, fetch from Firestore
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        company: 'ABC Corp',
        phone: '+1 (555) 123-4567',
        service: 'dedicated-growth',
        message: 'Interested in your dedicated growth partners service. Can you provide more details?',
        createdAt: '2024-06-14T10:30:00',
        status: 'new',
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        company: 'Property Management Inc',
        phone: '+1 (555) 234-5678',
        service: 'property-management',
        message: 'We need property management support for our 50 units.',
        createdAt: '2024-06-13T14:15:00',
        status: 'responded',
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike@example.com',
        company: 'Tech Startup',
        phone: '+1 (555) 345-6789',
        service: 'virtual-staffing',
        message: 'Looking for virtual staff for customer support.',
        createdAt: '2024-06-12T09:45:00',
        status: 'new',
      },
    ];
    setContacts(mockContacts);
    setFilteredContacts(mockContacts);
  }, []);

  // Filter contacts
  useEffect(() => {
    let filtered = contacts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  }, [searchTerm, statusFilter, contacts]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter((c) => c.id !== id));
      setSelectedContact(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: Contact['status']) => {
    setContacts(
      contacts.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === 'new').length,
    responded: contacts.filter((c) => c.status === 'responded').length,
  };

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">Total Contacts</p>
          <p className="text-3xl font-bold text-[#0F172A]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">New Submissions</p>
          <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-gray-600 text-sm mb-1">Responded</p>
          <p className="text-3xl font-bold text-green-600">{stats.responded}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
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
              <option value="responded">Responded</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{contact.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.company}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
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
        {selectedContact && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0F172A]">Details</h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Name</p>
                <p className="text-gray-900 font-medium">{selectedContact.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Email</p>
                <a href={`mailto:${selectedContact.email}`} className="text-[#0891B2] hover:underline">
                  {selectedContact.email}
                </a>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Phone</p>
                <a href={`tel:${selectedContact.phone}`} className="text-[#0891B2] hover:underline">
                  {selectedContact.phone}
                </a>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Company</p>
                <p className="text-gray-900">{selectedContact.company}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Service</p>
                <p className="text-gray-900">{selectedContact.service}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Message</p>
                <p className="text-gray-900 text-sm">{selectedContact.message}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                <select
                  value={selectedContact.status}
                  onChange={(e) =>
                    handleStatusChange(selectedContact.id, e.target.value as Contact['status'])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0891B2]"
                >
                  <option value="new">New</option>
                  <option value="responded">Responded</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="pt-4 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0891B2] text-white rounded-lg hover:bg-[#0891B2]/90 transition">
                  <Mail className="w-4 h-4" />
                  Reply
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => handleDelete(selectedContact.id)}
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
