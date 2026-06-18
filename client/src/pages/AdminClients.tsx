import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Plus, 
  MoreVertical, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Search,
  Filter,
  ArrowRight,
  Calendar,
  Building2,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Opportunity, PipelineStage } from '@/types/crm';

const STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'new-lead', label: 'New Lead', color: 'bg-blue-500' },
  { id: 'discovery', label: 'Discovery', color: 'bg-purple-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
  { id: 'proposal-sent', label: 'Proposal Sent', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-pink-500' },
  { id: 'closed-won', label: 'Closed Won', color: 'bg-green-500' },
  { id: 'active-client', label: 'Active Client', color: 'bg-emerald-600' },
  { id: 'lost', label: 'Lost', color: 'bg-slate-400' },
];

export default function AdminClients() {
  const { isAuthenticated } = useAdmin();
  const { logActivity } = useAdminActivityLogger();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    estimatedValue: 0,
    stage: 'new-lead',
    priority: 'medium',
    notes: '',
  });

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    const q = query(collection(db, 'clients'), orderBy('dateAdded', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Opportunity[];
      setOpportunities(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    try {
      const opportunityData = {
        ...formData,
        estimatedValue: Number(formData.estimatedValue),
        dateAdded: editingOpportunity ? editingOpportunity.dateAdded : serverTimestamp(),
        lastActivity: serverTimestamp(),
      };

      if (editingOpportunity) {
        await updateDoc(doc(db, 'clients', editingOpportunity.id), opportunityData);
        toast.success('Opportunity updated');
        // LOG ACTIVITY
        logActivity('update', 'Partnership Pipeline', `Updated opportunity: ${formData.companyName}`, { id: editingOpportunity.id });
      } else {
        await addDoc(collection(db, 'clients'), opportunityData);
        toast.success('New opportunity created');
        // LOG ACTIVITY
        logActivity('create', 'Partnership Pipeline', `Created new opportunity: ${formData.companyName}`);
      }

      setIsDialogOpen(false);
      setEditingOpportunity(null);
      setFormData({
        companyName: '', contactName: '', email: '', phone: '',
        industry: '', estimatedValue: 0, stage: 'new-lead',
        priority: 'medium', notes: ''
      });
    } catch (error) {
      toast.error('Error saving opportunity');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!db || !window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await deleteDoc(doc(db, 'clients', id));
      toast.success('Opportunity deleted');
      // LOG ACTIVITY
      logActivity('delete', 'Partnership Pipeline', `Deleted opportunity: ${name}`);
    } catch (error) {
      toast.error('Error deleting opportunity');
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const opportunity = opportunities.find(o => o.id === draggableId);
    if (!opportunity || !db) return;

    try {
      await updateDoc(doc(db, 'clients', draggableId), {
        stage: destination.droppableId,
        lastActivity: serverTimestamp()
      });
      // LOG ACTIVITY
      logActivity('update', 'Partnership Pipeline', `Moved ${opportunity.companyName} to ${destination.droppableId}`, {
        from: source.droppableId,
        to: destination.droppableId
      });
    } catch (error) {
      toast.error('Failed to move opportunity');
    }
  };

  const stats = {
    totalValue: opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0),
    activeDeals: opportunities.filter(o => !['closed-won', 'lost', 'active-client'].includes(o.stage)).length,
    closedWon: opportunities.filter(o => o.stage === 'closed-won' || o.stage === 'active-client').length,
  };

  if (!isAuthenticated) return <AdminLayout><div className="p-8 text-center">Please login.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Partnership Pipeline</h1>
            <p className="text-slate-500 mt-1">Manage business opportunities and strategic growth.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingOpportunity(null);
                setFormData({
                  companyName: '', contactName: '', email: '', phone: '',
                  industry: '', estimatedValue: 0, stage: 'new-lead',
                  priority: 'medium', notes: ''
                });
              }} className="bg-[#0891B2] hover:bg-[#06748F]">
                <Plus className="w-4 h-4 mr-2" /> New Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveOpportunity} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. TechStack" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Person</label>
                    <Input required value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@company.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimated Value ($)</label>
                    <Input type="number" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: Number(e.target.value)})} placeholder="5000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stage</label>
                    <select className="w-full p-2 border rounded-md" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as PipelineStage})}>
                      {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select className="w-full p-2 border rounded-md" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internal Notes</label>
                  <textarea className="w-full p-2 border rounded-md h-24" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Key requirements, next steps..." />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#0891B2]">{editingOpportunity ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* CRM Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Pipeline Value</p>
              <h3 className="text-2xl font-bold text-slate-900">${stats.totalValue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Deals</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.activeDeals}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Closed Won</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.closedWon}</h3>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search companies or contacts..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
            {STAGES.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80 bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{stage.label}</h3>
                    <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-600">{opportunities.filter(o => o.stage === stage.id).length}</Badge>
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 space-y-3 min-h-[100px]">
                      {opportunities
                        .filter(o => o.stage === stage.id)
                        .filter(o => o.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || o.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((opp, index) => (
                          <Draggable key={opp.id} draggableId={opp.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-slate-900 truncate pr-4">{opp.companyName}</h4>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => { setEditingOpportunity(opp); setFormData(opp); setIsDialogOpen(true); }}>Edit</DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(opp.id, opp.companyName)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center text-xs text-slate-500 gap-2"><Users className="w-3 h-3" /> {opp.contactName}</div>
                                  <div className="flex items-center text-xs text-slate-500 gap-2"><DollarSign className="w-3 h-3" /> ${opp.estimatedValue?.toLocaleString()}</div>
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                                    <Badge variant={opp.priority === 'high' ? 'destructive' : opp.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px] uppercase px-1.5 py-0">
                                      {opp.priority}
                                    </Badge>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {opp.dateAdded?.toDate ? opp.dateAdded.toDate().toLocaleDateString() : 'Just now'}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </AdminLayout>
  );
}
