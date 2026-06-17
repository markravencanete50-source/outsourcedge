import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'onboarding' | 'pending';
  dateAdded: any; // Firestore Timestamp
  notes?: string;
}

export default function AdminClients() {
  const { isAuthenticated } = useAdmin();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'onboarding' | 'pending'>('all');

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    try {
      const clientsRef = collection(db, 'clients');
      let q = query(clientsRef, orderBy('dateAdded', 'desc'));

      if (filterStatus !== 'all') {
        // Note: Firestore requires an index for queries with orderBy and where clauses.
        // You might need to create one in your Firebase console if you encounter errors.
        // Example: collection('clients').where('status', '==', 'active').orderBy('dateAdded', 'desc')
        q = query(clientsRef, where('status', '==', filterStatus), orderBy('dateAdded', 'desc'));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const clientsData: Client[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          clientsData.push({
            id: docSnap.id,
            name: data.name || 'N/A',
            email: data.email || 'N/A',
            company: data.company || 'N/A',
            status: data.status || 'pending',
            dateAdded: data.dateAdded,
            notes: data.notes || '',
          });
        });
        setClients(clientsData);
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up listener:', error);
      setIsLoading(false);
    }
  }, [isAuthenticated, filterStatus]);

  const handleAddClient = () => {
    setCurrentClient({});
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setIsDialogOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!db) return;
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteDoc(doc(db, 'clients', id));
        toast.success('Client deleted successfully');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const handleSaveClient = async () => {
    if (!db || !currentClient?.name || !currentClient?.email || !currentClient?.company || !currentClient?.status) {
      toast.error('Please fill all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      if (currentClient.id) {
        // Update existing client
        const clientRef = doc(db, 'clients', currentClient.id);
        await updateDoc(clientRef, {
          name: currentClient.name,
          email: currentClient.email,
          company: currentClient.company,
          status: currentClient.status,
          notes: currentClient.notes,
        });
        toast.success('Client updated successfully');
      } else {
        // Add new client
        await addDoc(collection(db, 'clients'), {
          name: currentClient.name,
          email: currentClient.email,
          company: currentClient.company,
          status: currentClient.status,
          dateAdded: new Date(),
          notes: currentClient.notes,
        });
        toast.success('Client added successfully');
      }
      setIsDialogOpen(false);
      setCurrentClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client');
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
        <h1 className="text-3xl font-bold">Clients Management</h1>
        <Button onClick={handleAddClient}>Add New Client</Button>
      </div>

      <div className="mb-4">
        <Label htmlFor="filterStatus" className="mr-2">Filter by Status:</Label>
        <Select onValueChange={(value: 'all' | 'active' | 'inactive' | 'onboarding' | 'pending') => setFilterStatus(value)} value={filterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No clients found.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.company}</TableCell>
                  <TableCell>{client.status}</TableCell>
                  <TableCell>{client.dateAdded?.toDate().toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(client.id)}>Delete</Button>
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
            <DialogTitle>{currentClient?.id ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={currentClient?.name || ''} onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={currentClient?.email || ''} onChange={(e) => setCurrentClient({ ...currentClient, email: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">Company</Label>
              <Input id="company" value={currentClient?.company || ''} onChange={(e) => setCurrentClient({ ...currentClient, company: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select onValueChange={(value: 'active' | 'inactive' | 'onboarding' | 'pending') => setCurrentClient({ ...currentClient, status: value })} value={currentClient?.status || 'pending'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Input id="notes" value={currentClient?.notes || ''} onChange={(e) => setCurrentClient({ ...currentClient, notes: e.target.value })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSaveClient}>Save Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
