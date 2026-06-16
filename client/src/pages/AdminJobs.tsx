import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { Briefcase, Plus, Trash2, Edit2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Job {
  id: string;
  title: string;
  category: string;
  type: string;
  location: string;
  description: string;
  status: 'active' | 'closed';
  createdAt: any;
}

export default function AdminJobs() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    category: 'Virtual Assistant',
    type: 'Full-time',
    location: 'Remote',
    description: '',
    status: 'active' as const
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'jobs'), {
        ...newJob,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewJob({
        title: '',
        category: 'Virtual Assistant',
        type: 'Full-time',
        location: 'Remote',
        description: '',
        status: 'active'
      });
    } catch (error) {
      console.error("Error adding job:", error);
    }
  };

  const toggleStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    await updateDoc(doc(db, 'jobs', job.id), { status: newStatus });
  };

  const deleteJob = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      await deleteDoc(doc(db, 'jobs', id));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Management</h1>
            <p className="text-slate-500">Post and manage available positions on your site</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-[#0891B2] text-white px-4 py-2 rounded-lg hover:bg-[#067a96] transition-colors"
          >
            {isAdding ? <XCircle size={20} /> : <Plus size={20} />}
            {isAdding ? 'Cancel' : 'Add New Position'}
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-semibold mb-4">Post a New Job</h2>
            <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title</label>
                <input 
                  required
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g. Senior Virtual Assistant"
                  value={newJob.title}
                  onChange={e => setNewJob({...newJob, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={newJob.category}
                  onChange={e => setNewJob({...newJob, category: e.target.value})}
                >
                  <option>Virtual Assistant</option>
                  <option>Customer Support</option>
                  <option>Digital Marketing</option>
                  <option>Data Entry</option>
                  <option>Project Management</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  required
                  className="w-full p-2 border rounded-lg h-32"
                  placeholder="Describe the role, requirements, and benefits..."
                  value={newJob.description}
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                />
              </div>
              <button type="submit" className="md:col-span-2 bg-[#0891B2] text-white py-2 rounded-lg font-semibold">
                Publish Position
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Position</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{job.title}</div>
                    <div className="text-xs text-slate-500">{job.type} • {job.location}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{job.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {job.status === 'active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleStatus(job)} title="Toggle Status" className="text-slate-400 hover:text-[#0891B2]">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteJob(job.id)} title="Delete" className="text-slate-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No job positions found. Click "Add New Position" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
