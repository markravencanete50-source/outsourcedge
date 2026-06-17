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
import { Plus, Trash2, Edit2, MessageSquare } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  rating: number;
}

export default function AdminTestimonials() {
  const { isAuthenticated } = useAdmin();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Testimonial>>({ name: '', company: '', content: '', rating: 5 });

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'testimonials'), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    });
  }, []);

  const handleSave = async () => {
    try {
      if (current.id) {
        await updateDoc(doc(db, 'testimonials', current.id), current);
        toast.success('Testimonial updated');
      } else {
        await addDoc(collection(db, 'testimonials'), { ...current, createdAt: new Date() });
        toast.success('Testimonial added');
      }
      setIsDialogOpen(false);
    } catch (e) { toast.error('Error saving'); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this testimonial?')) {
      await deleteDoc(doc(db, 'testimonials', id));
      toast.success('Deleted');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Testimonial Manager</h1>
        <Button onClick={() => { setCurrent({ name: '', company: '', content: '', rating: 5 }); setIsDialogOpen(true); }} className="bg-[#0891B2]">
          <Plus className="w-4 h-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.company}</TableCell>
                <TableCell className="max-w-md truncate">{t.content}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => { setCurrent(t); setIsDialogOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Testimonial Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Client Name</Label><Input value={current.name} onChange={e => setCurrent({...current, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={current.company} onChange={e => setCurrent({...current, company: e.target.value})} /></div>
            <div className="space-y-2"><Label>Review Content</Label><Textarea value={current.content} onChange={e => setCurrent({...current, content: e.target.value})} /></div>
            <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={current.rating} onChange={e => setCurrent({...current, rating: parseInt(e.target.value)})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave} className="bg-[#0891B2]">Save Testimonial</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
