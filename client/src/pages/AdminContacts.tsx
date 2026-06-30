import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger'; // INJECTED
import { useLocation } from 'wouter';
import { Mail, Trash2, Eye, Search, Filter, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
  createdAt: any;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  summary?: string;
  isLoadingSummary?: boolean;
}

export default function AdminContacts() {
  const { isAuthenticated } = useAdmin();
  const { logActivity } = useAdminActivityLogger(); // INJECTED
  const [, setLocation] = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'qualified' | 'closed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  // Real-time Firestore listener
  useEffect(() => {
    if (!db || !isAuthenticated) return;

    try {
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const contactsData: Contact[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          contactsData.push({
            id: docSnap.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.company || '',
            service: data.service || '',
            message: data.message || '',
            createdAt: data.createdAt,
            status: data.status || 'new',
            summary: data.summary,
          });
        });
        setContacts(contactsData);
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up listener:', error);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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

  const handleDelete = async (id: string, name: string) => { // ADDED name parameter
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await deleteDoc(doc(db, 'contacts', id));
      // INJECTED LOG
      await logActivity('delete', 'Contact Submissions', `Deleted inquiry from ${name}`, { id });
      setSelectedContact(null);
      toast.success('Contact deleted');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const handleStatusChange = async (id: string, newStatus: Contact['status'], name: string) => { // ADDED name parameter
    try {
      await updateDoc(doc(db, 'contacts', id), { status: newStatus });
      // INJECTED LOG
      await logActivity('update', 'Contact Submissions', `Changed status of ${name} to ${newStatus.toUpperCase()}`, { id });
      toast.success('Status updated');
      
      if (selectedContact?.id === id) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAISummarize = async (contact: Contact) => {
    if (contact.summary) return;

    const updatedContacts = contacts.map((c) =>
      c.id === contact.id ? { ...c, isLoadingSummary: true } : c
    );
    setContacts(updatedContacts);
    if (selectedContact?.id === contact.id) {
      setSelectedContact({ ...selectedContact, isLoadingSummary: true });
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Summarize this inquiry in one sentence: "${contact.message}"`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to summarize');

      const data = await response.json();
      const summary = data.reply || 'Unable to summarize';

      await updateDoc(doc(db, 'contacts', contact.id), { summary });
      // INJECTED LOG
      await logActivity('update', 'Contact Submissions', `Generated AI Summary for ${contact.name}`, { id: contact.id });
      toast.success('Summary generated');
    } catch (error) {
      console.error('Error summarizing:', error);
      toast.error('Failed to generate summary');
    }
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300';
      case 'contacted':
        return 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-800 dark:text-yellow-300';
      case 'qualified':
        return 'bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 dark:bg-white/[.06] text-gray-800 dark:text-slate-200';
    }
  };

  const getStatusIcon = (status: Contact['status']) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4" />;
      case 'contacted':
        return <Clock className="w-4 h-4" />;
      case 'qualified':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <Mail className="w-4 h-4" />;
    }
  };

  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === 'new').length,
    contacted: contacts.filter((c) => c.status === 'contacted').length,
    qualified: contacts.filter((c) => c.status === 'qualified').length,
  };

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#0F1A2E] rounded-lg shadow-sm border border-gray-200 dark:border-white/[.08] p-4">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-1">Total Contacts</p>
          <p className="text-3xl font-bold text-[#0F172A] dark:text-slate-100">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#0F1A2E] rounded-lg shadow-sm border border-gray-200 dark:border-white/[.08] p-4">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-1">New</p>
          <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-white dark:bg-[#0F1A2E] rounded-lg shadow-sm border border-gray-200 dark:border-white/[.08] p-4">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-1">Contacted</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.contacted}</p>
        </div>
        <div className="bg-white dark:bg-[#0F1A2E] rounded-lg shadow-sm border border-gray-200 dark:border-white/[.08] p-4">
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-1">Qualified</p>
          <p className="text-3xl font-bold text-green-600">{stats.qualified}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#0F1A2E] rounded-lg shadow-sm border border-gray-200 dark:border-white/[.08] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/[.08] rounded-lg focus:outline-none focus:border-[#1B3A4B]"
            />
          </div>
          <div className="flex gap-2">
            <Filter className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-white/[.08] rounded-lg focus:outline-none focus:border-[#1B3A4B]"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-slate-400">Loading contacts...</p>
        </div>
      )}

      {/* Contacts Table */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0F1A2E] rounded-lg shadow-sm border border-gray-200 dark:border-white/[.08] overflow-hidden">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-slate-400">No contacts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-white/[.04] border-b border-gray-200 dark:border-white/[.08]">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Service</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">Date</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-gray-200 dark:border-white/[.08] hover:bg-gray-50 dark:hover:bg-white/[.04] cursor-pointer transition"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 font-medium">{contact.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{contact.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{contact.service || 'General'}</td>
                        <td className="px-6 py-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(contact.status)}`}>
                            {getStatusIcon(contact.status)}
                            {contact.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                          {contact.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContact(contact);
                            }}
                            className="text-[#1B3A4B] dark:text-[#7FB6CC] hover:text-[#1B3A4B]/80 transition"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Details Panel */}
          {selectedContact && (
            <div className="bg-white dark:bg-[#0F1A2E] rounded-lg shadow-sm border border-gray-200 dark:border-white/[.08] p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-slate-100">Contact Details</h3>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold mb-1">Name</p>
                  <p className="text-gray-900 dark:text-slate-100 font-medium">{selectedContact.name}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold mb-1">Email</p>
                  <a href={`mailto:${selectedContact.email}`} className="text-[#1B3A4B] dark:text-[#7FB6CC] hover:underline">
                    {selectedContact.email}
                  </a>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold mb-1">Phone</p>
                  <a href={`tel:${selectedContact.phone}`} className="text-[#1B3A4B] dark:text-[#7FB6CC] hover:underline">
                    {selectedContact.phone || 'N/A'}
                  </a>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold mb-1">Company</p>
                  <p className="text-gray-900 dark:text-slate-100">{selectedContact.company || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold mb-1">Service</p>
                  <p className="text-gray-900 dark:text-slate-100">{selectedContact.service || 'General Inquiry'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold mb-1">Message</p>
                  <p className="text-gray-900 dark:text-slate-100 text-sm bg-gray-50 dark:bg-white/[.04] p-3 rounded">{selectedContact.message}</p>
                </div>

                {/* AI Summary */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold">AI Summary</p>
                    <button
                      onClick={() => handleAISummarize(selectedContact)}
                      disabled={selectedContact.isLoadingSummary || !!selectedContact.summary}
                      className="text-xs flex items-center gap-1 text-[#1B3A4B] dark:text-[#7FB6CC] hover:text-[#1B3A4B]/80 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      {selectedContact.isLoadingSummary ? 'Summarizing...' : selectedContact.summary ? 'Summarized' : 'Summarize with AI'}
                    </button>
                  </div>
                  {selectedContact.summary && (
                    <p className="text-sm text-gray-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-500/10 p-3 rounded border border-blue-200 dark:border-blue-500/25">
                      {selectedContact.summary}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold mb-2">Status</p>
                  <select
                    value={selectedContact.status}
                    onChange={(e) =>
                      handleStatusChange(selectedContact.id, e.target.value as Contact['status'], selectedContact.name)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/[.08] rounded-lg text-sm focus:outline-none focus:border-[#1B3A4B]"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleDelete(selectedContact.id, selectedContact.name)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    Delete Contact
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
