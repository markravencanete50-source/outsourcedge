import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger'; // INJECTED
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
  const { logActivity } = useAdminActivityLogger(); // INJECTED
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
      // INJECTED LOG
      await logActivity('create', 'Manage Jobs', `Posted new job: ${newJob.title}`);
      
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

  const handleDeleteJob = async (id: string, title: string) => { // ADDED title
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteDoc(doc(db, 'jobs', id));
        // INJECTED LOG
        await logActivity('delete', 'Manage Jobs', `Deleted job posting: ${title}`, { id });
        toast.success('Job deleted');
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const toggleStatus = async (job: Job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      await updateDoc(doc(db, 'jobs', job.id), {
        status: newStatus
      });
      // INJECTED LOG
      await logActivity('update', 'Manage Jobs', `Changed status of ${job.title} to ${newStatus.toUpperCase()}`, { id: job.id });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // ... (Remaining JSX stays exactly the same as your original AdminJobs.tsx)
  return (
    <AdminLayout>
      {/* ... (Keep your full original return JSX here) ... */}
    </AdminLayout>
  );
}
