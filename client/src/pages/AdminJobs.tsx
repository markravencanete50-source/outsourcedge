import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useLocation } from 'wouter';
import { Briefcase, Plus, Trash2, Edit2, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  category: string;
  type: string;
  location: string;
  description: string;
  status: 'active' | 'closed';
  hiringTimeline?: string;
  createdAt: any;
}

export default function AdminJobs() {
  const { isAuthenticated } = useAdmin();
  const [, setLocation] = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '',
    category: 'Virtual Assistant',
    customCategory: '',
    type: 'Full-time',
    location: 'Remote',
    description: '',
    hiringTimeline: 'As soon as possible',
    status: 'active' as const
  });

  const timelineOptions = [
    'As soon as possible',
    '1 week from now',
    '2 weeks from now',
    'Next month',
    'Pooling'
  ];

  const categories = [
    'Virtual Assistant',
    'Customer Support',
    'Digital Marketing',
    'Data Entry',
    'Project Management',
    'Other'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin/login');
      return;
    }

    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(jobsData);
    });

    return () => unsubscribe();
  }, [isAuthenticated, setLocation]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCategory = newJob.category === 'Other' ? newJob.customCategory : newJob.category;
      
      if (!finalCategory) {
        toast.error('Please provide a category');
        return;
      }

      const jobData = {
        title: newJob.title,
        category: finalCategory,
        type: newJob.type,
        location: newJob.location,
        description: newJob.description,
        hiringTimeline: newJob.hiringTimeline,
        status: newJob.status,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'jobs'), jobData);
      setIsAdding(false);
      setNewJob({
        title: '',
        category: 'Virtual Assistant',
        customCategory: '',
        type: 'Full-time',
        location: 'Remote',
        description: '',
        hiringTimeline: 'As soon as possible',
        status: 'active'
      });
      setIsCustomCategory(false);
      toast.success('Job posted successfully!');
    } catch (error) {
      toast.error('Failed to post job');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteDoc(doc(db, 'jobs', id));
        toast.success('Job deleted');
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const toggleStatus = async (job: Job) => {
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        status: job.status === 'active' ? 'closed' : 'active'
      });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Management</h1>
            <p className="text-slate-500">Post and manage available positions on your site</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-[#0891B2] text-white px-4 py-2 rounded-lg hover:bg-[#0891B2]/90 transition-colors"
          >
            {isAdding ? <XCircle size={20} /> : <Plus size={20} />}
            {isAdding ? 'Cancel' : 'Post a New Job'}
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
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
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 border rounded-lg"
                    value={newJob.category}
                    onChange={e => {
                      setNewJob({...newJob, category: e.target.value});
                      setIsCustomCategory(e.target.value === 'Other');
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {isCustomCategory && (
                    <input
                      required
                      className="flex-1 p-2 border rounded-lg"
                      placeholder="Enter custom category"
                      value={newJob.customCategory}
                      onChange={e => setNewJob({...newJob, customCategory: e.target.value})}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Job Type</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={newJob.type}
                  onChange={e => setNewJob({...newJob, type: e.target.value})}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  required
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g. Remote, Manila"
                  value={newJob.location}
                  onChange={e => setNewJob({...newJob, location: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hiring Timeline</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={newJob.hiringTimeline}
                  onChange={e => setNewJob({...newJob, hiringTimeline: e.target.value})}
                >
                  {timelineOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Describe the role, requirements, and benefits..."
                  value={newJob.description}
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#0891B2] text-white py-2 rounded-lg font-semibold hover:bg-[#0891B2]/90"
                >
                  Publish Position
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Position</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Timeline</th>
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
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400" />
                      {job.hiringTimeline || 'ASAP'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {job.status === 'active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleStatus(job)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600"
                        title="Toggle Status"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                        title="Delete Job"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
