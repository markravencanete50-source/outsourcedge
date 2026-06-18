import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreVertical, 
  Mail, 
  Building2, 
  DollarSign, 
  Clock, 
  Search,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Types ---
type OpportunityStage = 'new-lead' | 'discovery' | 'qualified' | 'proposal-sent' | 'negotiation' | 'closed-won' | 'active-client' | 'lost';
type PriorityLevel = 'hot' | 'warm' | 'cold' | 'critical';

interface Opportunity {
  id: string;
  companyName: string;
  primaryContact: string;
  email: string;
  phone?: string;
  industry?: string;
  estimatedValue: number;
  stage: OpportunityStage;
  priority: PriorityLevel;
  dateAdded: any;
  notes?: string;
}

const STAGES: { id: OpportunityStage; label: string; color: string }[] = [
  { id: 'new-lead', label: 'New Lead', color: 'bg-blue-500' },
  { id: 'discovery', label: 'Discovery', color: 'bg-purple-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
  { id: 'proposal-sent', label: 'Proposal Sent', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-yellow-500' },
  { id: 'closed-won', label: 'Closed Won', color: 'bg-green-600' },
  { id: 'active-client', label: 'Active Client', color: 'bg-emerald-500' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-500' },
];

export default function AdminClients() {
  const { isAuthenticated, adminName } = useAdmin();
  const { logActivity, trackPageView } = useAdminActivityLogger();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState<Partial<Opportunity> | null>(null);

  // Track page view on mount
  useEffect(() => {
    trackPageView('Partnership Pipeline');
  }, []);

  // Fetch opportunities from Firestore
  useEffect(() => {
    if (!db || !isAuthenticated) return;

    const q = query(collection(db, 'clients'), orderBy('dateAdded', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        companyName: doc.data().company || doc.data().companyName || 'Unknown Co',
        primaryContact: doc.data().name || doc.data().primaryContact || 'Unknown Contact',
        stage: doc.data().stage || (doc.data().status === 'active' ? 'active-client' : 'new-lead'),
        priority: doc.data().priority || 'warm',
        estimatedValue: doc.data().estimatedValue || 0,
      })) as Opportunity[];
      
      setOpportunities(data);
      setIsLoading(false);
    }, (error) => {
      console.error('Error:', error);
      toast.error('Failed to sync pipeline');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Handle Add New Opportunity
  const handleAddOpportunity = () => {
    setCurrentOpportunity({
      stage: 'new-lead',
      priority: 'warm',
      estimatedValue: 0,
    });
    setIsDialogOpen(true);
  };

  // Handle Save Opportunity
  const handleSaveOpportunity = async () => {
    if (!db || !currentOpportunity?.companyName || !currentOpportunity?.primaryContact || !currentOpportunity?.email) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (currentOpportunity.id) {
        // Update existing
        await updateDoc(doc(db, 'clients', currentOpportunity.id), {
          companyName: currentOpportunity.companyName,
          primaryContact: currentOpportunity.primaryContact,
          email: currentOpportunity.email,
          phone: currentOpportunity.phone,
          industry: currentOpportunity.industry,
          estimatedValue: currentOpportunity.estimatedValue,
          stage: currentOpportunity.stage,
          priority: currentOpportunity.priority,
          notes: currentOpportunity.notes,
          updatedAt: serverTimestamp(),
        });
        await logActivity('update', 'Partnership Pipeline', 'Updated opportunity', currentOpportunity.companyName);
        toast.success('Opportunity updated');
      } else {
        // Create new
        await addDoc(collection(db, 'clients'), {
          companyName: currentOpportunity.companyName,
          primaryContact: currentOpportunity.primaryContact,
          email: currentOpportunity.email,
          phone: currentOpportunity.phone,
          industry: currentOpportunity.industry,
          estimatedValue: currentOpportunity.estimatedValue,
          stage: currentOpportunity.stage,
          priority: currentOpportunity.priority,
          notes: currentOpportunity.notes,
          dateAdded: serverTimestamp(),
          createdBy: adminName,
        });
        await logActivity('create', 'Partnership Pipeline', 'Created new opportunity', currentOpportunity.companyName);
        toast.success('Opportunity created');
      }
      setIsDialogOpen(false);
      setCurrentOpportunity(null);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save opportunity');
    }
  };

  // Handle Delete Opportunity
  const handleDeleteOpportunity = async (id: string, name: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'clients', id));
      await logActivity('delete', 'Partnership Pipeline', 'Deleted opportunity', name);
      toast.success('Opportunity deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Handle Stage Update
  const updateStage = async (id: string, newStage: OpportunityStage, companyName: string) => {
    try {
      await updateDoc(doc(db, 'clients', id), { 
        stage: newStage,
        updatedAt: serverTimestamp() 
      });
      await logActivity('update', 'Partnership Pipeline', `Moved to ${newStage}`, companyName);
      toast.success(`Moved to ${newStage.replace('-', ' ')}`);
    } catch (error) {
      toast.error('Failed to move opportunity');
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'hot': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'warm': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredOpportunities = opportunities.filter(opp => 
    opp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.primaryContact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) return <AdminLayout><div className="p-8 text-center">Please login.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Partnership Pipeline</h1>
            <p className="text-slate-500 mt-1">Manage business opportunities and strategic growth.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search pipeline..." 
                className="pl-10 w-64 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleAddOpportunity}
              className="bg-[#0891B2] hover:bg-[#06748F]"
            >
              <Plus className="w-4 h-4 mr-2" /> New Opportunity
            </Button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Pipeline Value</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              ${opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0).toLocaleString()}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Active Opportunities</p>
            <h3 className="text-2xl font-bold text-[#0891B2] mt-1">{opportunities.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Closed Won</p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">
              {opportunities.filter(o => o.stage === 'closed-won').length}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Win Rate</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {opportunities.length > 0 
                ? Math.round((opportunities.filter(o => o.stage === 'closed-won' || o.stage === 'active-client').length / opportunities.length) * 100) 
                : 0}%
            </h3>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-6">
          <div className="flex gap-6 min-w-max h-full">
            {STAGES.map((stage) => (
              <div key={stage.id} className="w-80 flex flex-col bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-xs">{stage.label}</h3>
                    <Badge variant="secondary" className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0">
                      {filteredOpportunities.filter(o => o.stage === stage.id).length}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence mode='popLayout'>
                    {filteredOpportunities
                      .filter(opp => opp.stage === stage.id)
                      .map((opp) => (
                        <motion.div
                          key={opp.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(opp.priority)}`}>
                              {opp.priority.toUpperCase()}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateStage(opp.id, 'closed-won', opp.companyName)} className="text-green-600">
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Won
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStage(opp.id, 'lost', opp.companyName)} className="text-red-600">
                                  <XCircle className="w-4 h-4 mr-2" /> Mark Lost
                                </DropdownMenuItem>
                                <DropdownMenuItem className="border-t mt-1" onClick={() => setCurrentOpportunity(opp) || setIsDialogOpen(true)}>
                                  Edit Opportunity
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteOpportunity(opp.id, opp.companyName)} className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <h4 className="font-bold text-slate-900 leading-tight mb-1">{opp.companyName}</h4>
                          <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {opp.primaryContact}
                          </p>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[#0891B2] font-bold text-sm">
                              <DollarSign className="w-3.5 h-3.5" />
                              {opp.estimatedValue?.toLocaleString() || '0'}
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                              <Clock className="w-3 h-3" />
                              {opp.dateAdded?.toDate().toLocaleDateString() || 'New'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                  
                  {filteredOpportunities.filter(o => o.stage === stage.id).length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                      <p className="text-xs text-slate-400">No opportunities</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New/Edit Opportunity Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentOpportunity?.id ? 'Edit Opportunity' : 'Create New Opportunity'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input 
                id="company" 
                value={currentOpportunity?.companyName || ''} 
                onChange={(e) => setCurrentOpportunity({ ...currentOpportunity, companyName: e.target.value })}
                placeholder="e.g., TechStack Inc"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact">Primary Contact *</Label>
              <Input 
                id="contact" 
                value={currentOpportunity?.primaryContact || ''} 
                onChange={(e) => setCurrentOpportunity({ ...currentOpportunity, primaryContact: e.target.value })}
                placeholder="e.g., John Smith"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email"
                value={currentOpportunity?.email || ''} 
                onChange={(e) => setCurrentOpportunity({ ...currentOpportunity, email: e.target.value })}
                placeholder="john@techstack.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={currentOpportunity?.phone || ''} 
                onChange={(e) => setCurrentOpportunity({ ...currentOpportunity, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
              <Input 
                id="industry" 
                value={currentOpportunity?.industry || ''} 
                onChange={(e) => setCurrentOpportunity({ ...currentOpportunity, industry: e.target.value })}
                placeholder="e.g., Technology, Finance"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">Estimated Value ($)</Label>
              <Input 
                id="value" 
                type="number"
                value={currentOpportunity?.estimatedValue || 0} 
                onChange={(e) => setCurrentOpportunity({ ...currentOpportunity, estimatedValue: parseInt(e.target.value) || 0 })}
                placeholder="50000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stage">Stage</Label>
                <Select 
                  value={currentOpportunity?.stage || 'new-lead'}
                  onValueChange={(value) => setCurrentOpportunity({ ...currentOpportunity, stage: value as OpportunityStage })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={currentOpportunity?.priority || 'warm'}
                  onValueChange={(value) => setCurrentOpportunity({ ...currentOpportunity, priority: value as PriorityLevel })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input 
                id="notes" 
                value={currentOpportunity?.notes || ''} 
                onChange={(e) => setCurrentOpportunity({ ...currentOpportunity, notes: e.target.value })}
                placeholder="Add any relevant notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveOpportunity} className="bg-[#0891B2] hover:bg-[#06748F]">
              {currentOpportunity?.id ? 'Update' : 'Create'} Opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </AdminLayout>
  );
}
