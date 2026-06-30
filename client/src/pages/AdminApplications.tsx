import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger'; // INJECTED
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Video, FileText, User, Mail, Briefcase, Phone, Globe, Download } from 'lucide-react';
import { buildApplicationPdf } from '@/lib/applicationPdf';

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  portfolioUrl?: string;
  experience: string;
  coverLetter: string;
  resumeUrl: string;
  videoIntroUrl?: string;
  pdfUrl?: string;
  status: 'new' | 'reviewed' | 'accepted' | 'rejected' | 'hired';
  date: any;
  notes?: string;
}

export default function AdminApplications() {
  const { isAuthenticated } = useAdmin();
  const { logActivity } = useAdminActivityLogger(); // INJECTED
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed' | 'accepted' | 'rejected' | 'hired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    try {
      const appsRef = collection(db, 'applications');
      let q = query(appsRef, orderBy('date', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appsData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            fullName: data.fullName || data.name || 'Anonymous',
            email: data.email || 'No email',
            phone: data.phone || 'N/A',
            jobTitle: data.jobTitle || data.position || 'Not specified',
            portfolioUrl: data.portfolioUrl,
            experience: data.experience || 'N/A',
            coverLetter: data.coverLetter || data.message || 'N/A',
            resumeUrl: data.resumeUrl,
            videoIntroUrl: data.videoIntroUrl,
            pdfUrl: data.pdfUrl,
            status: data.status || 'new',
            date: data.date,
            notes: data.notes || '',
          } as Application;
        });
        
        setApplications(appsData);
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up listener:', error);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Open the hosted PDF if we stored one at submission time; otherwise generate
  // it on the fly from the application data (covers older records, too).
  const downloadApplicationPdf = (app: Application) => {
    if (app.pdfUrl) {
      window.open(app.pdfUrl, '_blank', 'noopener');
      logActivity('view', 'Job Applications', `Downloaded application PDF for ${app.fullName}`, { id: app.id });
      return;
    }
    try {
      const { blob, filename } = buildApplicationPdf(app as any);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      logActivity('view', 'Job Applications', `Generated application PDF for ${app.fullName}`, { id: app.id });
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Could not generate the PDF');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.jobTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditApplication = (application: Application) => {
    setCurrentApplication(application);
    setIsDialogOpen(true);
  };

  const handleDeleteApplication = async (id: string, name: string) => { // ADDED name
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteDoc(doc(db, 'applications', id));
        // INJECTED LOG
        await logActivity('delete', 'Job Applications', `Deleted application from ${name}`, { id });
        toast.success('Application deleted successfully');
      } catch (error) {
        toast.error('Failed to delete application');
      }
    }
  };

  const handleSaveApplication = async () => {
    if (!currentApplication?.id) return;
    try {
      await updateDoc(doc(db, 'applications', currentApplication.id), {
        status: currentApplication.status,
        notes: currentApplication.notes || '',
      });
      // INJECTED LOG
      await logActivity('update', 'Job Applications', `Changed status of ${currentApplication.fullName} to ${currentApplication.status.toUpperCase()}`, { id: currentApplication.id });
      toast.success('Application updated');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update application');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Job Applications</h1>
          <p className="text-slate-500 dark:text-slate-400">Review and manage incoming job applications</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Input 
          placeholder="Search name, email, or position..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white dark:bg-[#0F1A2E]"
        />
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-[#0F1A2E]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-[#0F1A2E] rounded-xl border border-slate-200 dark:border-white/[.08] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-white/[.04]">
            <TableRow>
              <TableHead className="font-semibold">Applicant</TableHead>
              <TableHead className="font-semibold">Position</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Links</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">No applications found.</TableCell></TableRow>
            ) : (
              filteredApplications.map((app) => (
                <TableRow key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/[.04] transition-colors">
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{app.fullName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{app.email}</div>
                  </TableCell>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{app.jobTitle}</div>
                  </td>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'new' ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' :
                      app.status === 'accepted' ? 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300' :
                      app.status === 'rejected' ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300' :
                      'bg-slate-100 dark:bg-white/[.06] text-slate-700 dark:text-slate-300'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {app.date?.toDate().toLocaleDateString() || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadApplicationPdf(app)}
                        title="Download application PDF"
                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded"
                      >
                        <Download size={18} />
                      </button>
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" title="Resume" className="p-1 text-[#1B3A4B] dark:text-[#7FB6CC] hover:bg-[#1B3A4B]/10 rounded">
                          <FileText size={18} />
                        </a>
                      )}
                      {app.videoIntroUrl && (
                        <a href={app.videoIntroUrl} target="_blank" rel="noreferrer" title="Video Intro" className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded">
                          <Video size={18} />
                        </a>
                      )}
                      {app.portfolioUrl && (
                        <a href={app.portfolioUrl} target="_blank" rel="noreferrer" title="Portfolio" className="p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded">
                          <Globe size={18} />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditApplication(app)}>View/Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => handleDeleteApplication(app.id, app.fullName)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Application Details</DialogTitle>
          </DialogHeader>
          
          {currentApplication && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-slate-500 dark:text-slate-400">Full Name</Label>
                  <div className="flex items-center gap-2 font-medium">
                    <User size={16} className="text-[#1B3A4B] dark:text-[#7FB6CC]" />
                    {currentApplication.fullName}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 dark:text-slate-400">Email Address</Label>
                  <div className="flex items-center gap-2 font-medium">
                    <Mail size={16} className="text-[#1B3A4B] dark:text-[#7FB6CC]" />
                    {currentApplication.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 dark:text-slate-400">Phone Number</Label>
                  <div className="flex items-center gap-2 font-medium">
                    <Phone size={16} className="text-[#1B3A4B] dark:text-[#7FB6CC]" />
                    {currentApplication.phone}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 dark:text-slate-400">Applied Position</Label>
                  <div className="flex items-center gap-2 font-medium">
                    <Briefcase size={16} className="text-[#1B3A4B] dark:text-[#7FB6CC]" />
                    {currentApplication.jobTitle}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500 dark:text-slate-400">Relevant Experience</Label>
                <div className="p-3 bg-slate-50 dark:bg-white/[.04] rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {currentApplication.experience}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500 dark:text-slate-400">Cover Letter</Label>
                <div className="p-3 bg-slate-50 dark:bg-white/[.04] rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {currentApplication.coverLetter}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Application Status</Label>
                  <Select 
                    value={currentApplication.status} 
                    onValueChange={(v: any) => setCurrentApplication({...currentApplication, status: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea 
                    placeholder="Add private notes about this candidate..."
                    value={currentApplication.notes || ''}
                    onChange={(e) => setCurrentApplication({...currentApplication, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {currentApplication && (
              <Button variant="outline" className="mr-auto" onClick={() => downloadApplicationPdf(currentApplication)}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
            <Button className="bg-[#1B3A4B] hover:bg-[#1B3A4B]/90" onClick={handleSaveApplication}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
