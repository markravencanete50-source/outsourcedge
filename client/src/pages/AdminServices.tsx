import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Star } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export default function AdminServices() {
  const { isAuthenticated } = useAdmin();
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({ title: '', description: '', icon: 'Zap', order: 0 });

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });
  }, []);

  const handleSave = async () => {
    try {
      if (currentService.id) {
        await updateDoc(doc(db, 'services', currentService.id), currentService);
        toast.success('Service updated');
      } else {
        await addDoc(collection(db, 'services'), { ...currentService, createdAt: new Date() });
        toast.success('Service added');
      }
      setIsDialogOpen(false);
    } catch (e) { toast.error('Error saving service'); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this service?')) {
      await deleteDoc(doc(db, 'services', id));
      toast.success('Service deleted');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Service Manager</h1>
        <Button onClick={() => { setCurrentService({ title: '', description: '', icon: 'Zap', order: services.length }); setIsDialogOpen(true); }} className="bg-[#0891B2]">
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell className="max-w-md truncate">{s.description}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentService(s); setIsDialogOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentService.id ? 'Edit Service' : 'Add New Service'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Title</Label><Input value={currentService.title} onChange={e => setCurrentService({...currentService, title: e.target.value})} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={currentService.description} onChange={e => setCurrentService({...currentService, description: e.target.value})} /></div>
            <div className="space-y-2"><Label>Order (Priority)</Label><Input type="number" value={currentService.order} onChange={e => setCurrentService({...currentService, order: parseInt(e.target.value)})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave} className="bg-[#0891B2]">Save Service</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
