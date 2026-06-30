import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger'; // INJECTED
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Video, FileText, User, Mail, Briefcase, Phone, Globe, Download, Send } from 'lucide-react';
import { buildApplicationPdf } from '@/lib/applicationPdf';
import { sendApplicantEmail } from '@/lib/sendApplicantEmail';

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
  const { isAuthenticated, adminEmail } = useAdmin();
  const { logActivity } = useAdminActivityLogger(); // INJECTED
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed' | 'accepted' | 'rejected' | 'hired'>('all');
  const [filterJob, setFilterJob] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Compose-email state
  const [composeApp, setComposeApp] = useState<Application | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  // Distinct positions applicants have applied for — powers the job filter.
  const jobTitles = Array.from(
    new Set(applications.map(a => a.jobTitle).filter(t => t && t !== 'Not specified')),
  ).sort();

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      (app.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.jobTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesJob = filterJob === 'all' || app.jobTitle === filterJob;

    return matchesSearch && matchesStatus && matchesJob;
  });

  const firstName = (name?: string) => (name || '').trim().split(/\s+/)[0] || 'there';

  // Editable starting points for the compose box. The admin can tweak before sending.
  const emailTemplates = (app: Application): Record<string, { subject: string; body: string }> => ({
    interview: {
      subject: `Interview invitation — ${app.jobTitle} at OutsourcEdge`,
      body:
        `Hi ${firstName(app.fullName)},\n\n` +
        `Thank you for applying for the ${app.jobTitle} role at OutsourcEdge. We were impressed with your application and would love to invite you to an interview.\n\n` +
        `Please reply with your availability over the coming days and we'll arrange a time that works for you.\n\n` +
        `Warm regards,\nThe OutsourcEdge Team`,
    },
    info: {
      subject: `A few more details about your application — OutsourcEdge`,
      body:
        `Hi ${firstName(app.fullName)},\n\n` +
        `Thank you for applying for the ${app.jobTitle} role at OutsourcEdge. To move your application forward, could you please share a little more detail on the following:\n\n` +
        `- \n- \n\n` +
        `Looking forward to hearing from you.\n\n` +
        `Warm regards,\nThe OutsourcEdge Team`,
    },
    reject: {
      subject: `Update on your application — OutsourcEdge`,
      body:
        `Hi ${firstName(app.fullName)},\n\n` +
        `Thank you for your interest in the ${app.jobTitle} role at OutsourcEdge and for the time you invested in your application.\n\n` +
        `After careful consideration, we won't be moving forward at this time. We genuinely appreciate your interest and encourage you to apply for future roles that match your skills.\n\n` +
        `Wishing you all the best,\nThe OutsourcEdge Team`,
    },
  });

  const openCompose = (app: Application) => {
    if (!app.email || app.email === 'No email') {
      toast.error('This applicant has no email address on file.');
      return;
    }
    // Pre-fill with a friendly default; templates can overwrite it.
    setComposeApp(app);
    setEmailSubject(`Your application for ${app.jobTitle} — OutsourcEdge`);
    setEmailBody(
      `Hi ${firstName(app.fullName)},\n\n` +
        `Thank you for applying for the ${app.jobTitle} role at OutsourcEdge.\n\n` +
        `\n\nWarm regards,\nThe OutsourcEdge Team`,
    );
  };

  const applyTemplate = (key: 'interview' | 'info' | 'reject') => {
    if (!composeApp) return;
    const t = emailTemplates(composeApp)[key];
    setEmailSubject(t.subject);
    setEmailBody(t.body);
  };

  const handleSendEmail = async () => {
    if (!composeApp) return;
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Please add a subject and a message.');
      return;
    }
    setIsSending(true);
    try {
      await sendApplicantEmail({
        to: composeApp.email,
        subject: emailSubject.trim(),
        message: emailBody.trim(),
      });

      // Keep a record of what was sent to whom.
      try {
        await addDoc(collection(db, 'sentEmails'), {
          applicationId: composeApp.id,
          to: composeApp.email,
          applicantName: composeApp.fullName,
          jobTitle: composeApp.jobTitle,
          subject: emailSubject.trim(),
          message: emailBody.trim(),
          sentBy: adminEmail || 'admin',
          sentAt: serverTimestamp(),
        });
      } catch (logErr) {
        console.error('Could not record sent email:', logErr);
      }

      await logActivity('update', 'Job Applications', `Emailed ${composeApp.fullName} (${composeApp.email})`, { id: composeApp.id });
      toast.success(`Email sent to ${composeApp.fullName}`);
      setComposeApp(null);
    } catch (err: any) {
      console.error('Send email failed:', err);
      toast.error(err?.message || 'Failed to send the email.');
    } finally {
      setIsSending(false);
    }
  };

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
        <Select value={filterJob} onValueChange={(v: any) => setFilterJob(v)}>
          <SelectTrigger className="w-[220px] bg-white dark:bg-[#0F1A2E]">
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {jobTitles.map((title) => (
              <SelectItem key={title} value={title}>{title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                      <Button variant="outline" size="sm" className="text-[#1B3A4B] dark:text-[#7FB6CC]" onClick={() => openCompose(app)}>
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Email
                      </Button>
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
            {currentApplication && (
              <Button
                variant="outline"
                className="text-[#1B3A4B] dark:text-[#7FB6CC]"
                onClick={() => { setIsDialogOpen(false); openCompose(currentApplication); }}
              >
                <Send className="w-4 h-4 mr-2" /> Email Applicant
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
            <Button className="bg-[#1B3A4B] hover:bg-[#1B3A4B]/90" onClick={handleSaveApplication}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose email to applicant */}
      <Dialog open={!!composeApp} onOpenChange={(open) => { if (!open) setComposeApp(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#1B3A4B] dark:text-[#7FB6CC]" /> Compose Email
            </DialogTitle>
          </DialogHeader>

          {composeApp && (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">To:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{composeApp.fullName}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[.06] text-slate-600 dark:text-slate-300 text-xs">{composeApp.email}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400">{composeApp.jobTitle}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500 dark:text-slate-400">Quick templates</Label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('interview')}>Invite to interview</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('info')}>Request more info</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('reject')}>Not moving forward</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject line" />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  rows={12}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your message..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-400">Sent from your verified OutsourcEdge address. Replies come back to your team inbox.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeApp(null)} disabled={isSending}>Cancel</Button>
            <Button className="bg-[#1B3A4B] hover:bg-[#1B3A4B]/90" onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send Email</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
