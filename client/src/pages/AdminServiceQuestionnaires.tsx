import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface QuestionnaireResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  answers: Record<string, any>;
  status: 'new' | 'reviewed' | 'contacted' | 'closed';
  createdAt: any;
  summary?: string;
  isLoadingSummary?: boolean;
}

export default function AdminServiceQuestionnaires() {
  const { isAuthenticated } = useAdmin();
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'service_questionnaires'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionnaireResponse[];
      setResponses(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching questionnaires:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: QuestionnaireResponse['status']) => {
    try {
      await updateDoc(doc(db, 'service_questionnaires', id), { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      try {
        await deleteDoc(doc(db, 'service_questionnaires', id));
        setSelectedResponse(null);
        toast.success('Response deleted');
      } catch (error) {
        toast.error('Failed to delete response');
      }
    }
  };

  const filteredResponses = responses.filter(resp => {
    const matchesSearch = 
      resp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resp.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || resp.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Service Inquiries</h1>
        <p className="text-slate-500">Manage and review detailed service questionnaire submissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or service..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A4B]/20 focus:border-[#1B3A4B] transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A4B]/20"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading submissions...</div>
            ) : filteredResponses.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No submissions found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredResponses.map((resp) => (
                      <tr 
                        key={resp.id} 
                        className={`hover:bg-slate-50 transition cursor-pointer ${selectedResponse?.id === resp.id ? 'bg-slate-50' : ''}`}
                        onClick={() => setSelectedResponse(resp)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{resp.name}</div>
                          <div className="text-xs text-slate-500">{resp.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {resp.service}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                            resp.status === 'new' ? 'text-orange-500' : 
                            resp.status === 'contacted' ? 'text-blue-500' : 
                            resp.status === 'reviewed' ? 'text-emerald-500' : 'text-slate-400'
                          }`}>
                            {resp.status === 'new' && <AlertCircle className="w-3 h-3" />}
                            {resp.status === 'reviewed' && <CheckCircle className="w-3 h-3" />}
                            {resp.status === 'contacted' && <Clock className="w-3 h-3" />}
                            {resp.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {resp.createdAt?.toDate ? resp.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#1B3A4B] hover:text-[#1B3A4B]/80 transition">
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
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          {selectedResponse ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Submission Details</h3>
                <button onClick={() => setSelectedResponse(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Name</p>
                    <p className="text-slate-900 font-medium">{selectedResponse.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Service</p>
                    <p className="text-slate-900 font-medium">{selectedResponse.service}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Email</p>
                  <a href={`mailto:${selectedResponse.email}`} className="text-[#1B3A4B] hover:underline block truncate">
                    {selectedResponse.email}
                  </a>
                </div>

                {selectedResponse.phone && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Phone</p>
                    <p className="text-slate-900">{selectedResponse.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Questionnaire Answers</p>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto border border-slate-100">
                    {Object.entries(selectedResponse.answers || {}).map(([question, answer]) => (
                      <div key={question} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                        <p className="text-xs font-bold text-slate-600 mb-1">{question}</p>
                        <p className="text-sm text-slate-800">{String(answer)}</p>
                      </div>
                    ))}
                    {(!selectedResponse.answers || Object.keys(selectedResponse.answers).length === 0) && (
                      <p className="text-sm text-slate-400 italic">No answers provided</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Status</p>
                  <select
                    value={selectedResponse.status}
                    onChange={(e) => handleStatusChange(selectedResponse.id, e.target.value as QuestionnaireResponse['status'])}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4B]"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => handleDelete(selectedResponse.id)}
                    className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Select a submission to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
