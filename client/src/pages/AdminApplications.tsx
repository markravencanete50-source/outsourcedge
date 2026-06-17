import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
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

interface Application {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'new' | 'reviewed' | 'accepted' | 'rejected' | 'hired';
  date: any; // Firestore Timestamp
  resumeUrl?: string;
  experience?: string;
  message?: string;
  notes?: string; // Added notes field
}

export default function AdminApplications() {
  const { isAuthenticated } = useAdmin();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<Partial<Application> | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed' | 'accepted' | 'rejected' | 'hired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    try {
      const appsRef = collection(db, 'applications');
      let q = query(appsRef, orderBy('date', 'desc'));

      if (filterStatus !== 'all') {
        q = query(q, where('status', '==', filterStatus));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appsData: Application[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          appsData.push({
            id: docSnap.id,
            name: data.name || 'Anonymous',
            email: data.email || 'No email',
            position: data.position || 'Not specified',
            status: data.status || 'new',
            date: data.date,
            resumeUrl: data.resumeUrl,
            experience: data.experience,
            message: data.message,
            notes: data.notes || '',
          });
        });
        setApplications(appsData.filter(app => 
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.position.toLowerCase().includes(searchTerm.toLowerCase())
        ));
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
  }, [isAuthenticated, filterStatus, searchTerm]);

  const handleEditApplication = (application: Application) => {
    setCurrentApplication(application);
    setIsDialogOpen(true);
  };

  const handleDeleteApplication = async (id: string) => {
    if (!db) return;
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteDoc(doc(db, 'applications', id));
        toast.success('Application deleted successfully');
      } catch (error) {
        console.error('Error deleting application:', error);
        toast.error('Failed to delete application');
      }
    }
  };

  const handleSaveApplication = async () => {
    if (!db || !currentApplication?.id) {
      toast.error('Application ID is missing.');
      return;
    }

    setIsLoading(true);
    try {
      const appRef = doc(db, 'applications', currentApplication.id);
      await updateDoc(appRef, {
        status: currentApplication.status,
        notes: currentApplication.notes,
      });
      toast.success('Application updated successfully');
      setIsDialogOpen(false);
      setCurrentApplication(null);
    } catch (error) {
      console.error('Error saving application:', error);
      toast.error('Failed to save application');
    }
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-500">
          Please log in to access the admin dashboard.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Job Applications</h1>
      </div>

      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Search by name, email, or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select onValueChange={(value: 'all' | 'new' | 'reviewed' | 'accepted' | 'rejected' | 'hired') => setFilterStatus(value)} value={filterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No applications found.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.position}</TableCell>
                  <TableCell>{app.status}</TableCell>
                  <TableCell>{app.date?.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>
                    {app.resumeUrl ? (
                      <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Resume
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditApplication(app)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteApplication(app.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={currentApplication?.name || ''} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" value={currentApplication?.email || ''} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">Position</Label>
              <Input id="position" value={currentApplication?.position || ''} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select onValueChange={(value: 'new' | 'reviewed' | 'accepted' | 'rejected' | 'hired') => setCurrentApplication({ ...currentApplication, status: value })} value={currentApplication?.status || 'new'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Status" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">Message</Label>
              <Textarea id="message" value={currentApplication?.message || ''} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea id="notes" value={currentApplication?.notes || ''} onChange={(e) => setCurrentApplication({ ...currentApplication, notes: e.target.value })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSaveApplication}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
