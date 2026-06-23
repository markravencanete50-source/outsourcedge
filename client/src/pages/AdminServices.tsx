import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger'; // INJECTED
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  questions?: string[];
  icon?: string;
  order?: number;
}

export default function AdminServices() {
  const { isAuthenticated } = useAdmin();
  const { logActivity } = useAdminActivityLogger(); // INJECTED
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLongDescription, setFormLongDescription] = useState('');
  const [formQuestions, setFormQuestions] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formOrder, setFormOrder] = useState(0);

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const resetForm = () => {
    setCurrentService(null);
    setFormTitle('');
    setFormDescription('');
    setFormLongDescription('');
    setFormQuestions('');
    setFormIcon('Zap');
    setFormOrder(services.length);
  };

  const handleAddService = async () => {
    if (!formTitle || !formDescription) {
      toast.error('Title and Description are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'services'), {
        title: formTitle,
        description: formDescription,
        longDescription: formLongDescription,
        questions: formQuestions.split('\n').filter(q => q.trim() !== ''),
        icon: formIcon,
        order: formOrder,
        createdAt: new Date()
      });
      // INJECTED LOG
      await logActivity('create', 'Service Manager', `Added new service: ${formTitle}`);
      
      toast.success('Service added successfully!');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service.');
    }
  };

  const handleUpdateService = async () => {
    if (!currentService || !formTitle || !formDescription) {
      toast.error('Title and Description are required.');
      return;
    }
    try {
      const serviceRef = doc(db, 'services', currentService.id);
      await updateDoc(serviceRef, {
        title: formTitle,
        description: formDescription,
        longDescription: formLongDescription,
        questions: formQuestions.split('\n').filter(q => q.trim() !== ''),
        icon: formIcon,
        order: formOrder,
      });
      // INJECTED LOG
      await logActivity('update', 'Service Manager', `Updated service: ${formTitle}`, { id: currentService.id });
      
      toast.success('Service updated successfully!');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service.');
    }
  };

  const handleDeleteService = async (id: string, title: string) => { // ADDED title parameter
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        // INJECTED LOG
        await logActivity('delete', 'Service Manager', `Deleted service: ${title}`, { id });
        
        toast.success('Service deleted successfully!');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service.');
      }
    }
  };

  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    setFormTitle(service.title);
    setFormDescription(service.description);
    setFormLongDescription(service.longDescription || '');
    setFormQuestions(service.questions?.join('\n') || '');
    setFormIcon(service.icon || 'Zap');
    setFormOrder(service.order || 0);
    setIsDialogOpen(true);
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Manager</h1>
          <p className="text-slate-500">Manage the services displayed on your website</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#1B3A4B] hover:bg-[#1B3A4B]/90">
          <Plus className="w-4 h-4 mr-2" /> Add New Service
        </Button>
      </div>

      {isLoading ? (
        <p>Loading services...</p>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.order}</TableCell>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(service)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id, service.title)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">Icon Name</Label>
              <Input id="icon" value={formIcon} onChange={(e) => setFormIcon(e.target.value)} className="col-span-3" placeholder="e.g., Zap, Users, Shield" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Short Description</Label>
              <Textarea id="description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longDescription" className="text-right">Full Details</Label>
              <Textarea id="longDescription" value={formLongDescription} onChange={(e) => setFormLongDescription(e.target.value)} className="col-span-3" rows={5} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="questions" className="text-right">Questionnaire (one per line)</Label>
              <Textarea id="questions" value={formQuestions} onChange={(e) => setFormQuestions(e.target.value)} className="col-span-3" placeholder="What is your current property count?&#10;Which software do you use?" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order" className="text-right">Order</Label>
              <Input id="order" type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value))} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={currentService ? handleUpdateService : handleAddService} className="bg-[#1B3A4B] hover:bg-[#1B3A4B]/90">
              {currentService ? 'Save Changes' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
