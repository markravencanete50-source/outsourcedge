import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import DateRangeFilter from '@/components/DateRangeFilter';
import { ALL_TIME, DateRange, toJsDate, inRange } from '@/lib/dateRange';
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
  const { logActivity } = useAdminActivityLogger();
  const [opportunitiesRaw, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [range, setRange] = useState<DateRange>(ALL_TIME);

  // Pipeline scoped to the selected calendar range (by dateAdded).
  const opportunities = useMemo(
    () => opportunitiesRaw.filter((o) => inRange(toJsDate(o.dateAdded), range)),
    [opportunitiesRaw, range],
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState<Partial<Opportunity> | null>(null);

  // Fetch opportunities from Firestore
  useEffect(() => {
    if (!db || !isAuthenticated) return;

    const q = query(collection(db, 'clients'), orderBy('dateAdded', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Map old fields to new fields for backward compatibility
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

  const handleSaveOpportunity = async () => {
    if (!db || !currentOpportunity?.companyName || !currentOpportunity?.primaryContact || !currentOpportunity?.email) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const dataToSave = {
        companyName: currentOpportunity.companyName,
        primaryContact: currentOpportunity.primaryContact,
        email: currentOpportunity.email,
        phone: currentOpportunity.phone || '',
        industry: currentOpportunity.industry || '',
        estimatedValue: Number(currentOpportunity.estimatedValue) || 0,
        stage: currentOpportunity.stage || 'new-lead',
        priority: currentOpportunity.priority || 'warm',
        notes: currentOpportunity.notes || '',
        updatedAt: serverTimestamp(),
      };

      if (currentOpportunity.id) {
        await updateDoc(doc(db, 'clients', currentOpportunity.id), dataToSave);
        await logActivity('update', 'Partnership Pipeline', `Updated opportunity: ${dataToSave.companyName}`);
        toast.success('Opportunity updated');
      } else {
        await addDoc(collection(db, 'clients'), {
          ...dataToSave,
          dateAdded: serverTimestamp(),
          createdBy: adminName,
        });
        await logActivity('create', 'Partnership Pipeline', `Created new opportunity: ${dataToSave.companyName}`);
        toast.success('Opportunity created');
      }
      setIsDialogOpen(false);
      setCurrentOpportunity(null);
    } catch (error) {
      toast.error('Failed to save opportunity');
    }
  };

  const handleDeleteOpportunity = async (id: string, name: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'clients', id));
      await logActivity('delete', 'Partnership Pipeline', `Deleted opportunity: ${name}`);
      toast.success('Opportunity deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const updateStage = async (id: string, newStage: OpportunityStage, companyName: string) => {
    try {
      await updateDoc(doc(db, 'clients', id), { 
        stage: newStage,
        updatedAt: serverTimestamp() 
      });
      await logActivity('update', 'Partnership Pipeline', `Moved ${companyName} to ${newStage}`);
      toast.success(`Moved to ${newStage.replace('-', ' ')}`);
    } catch (error) {
      toast.error('Failed to move opportunity');
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/25';
      case 'hot': return 'bg-orange-100 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/25';
      case 'warm': return 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/25';
      default: return 'bg-gray-100 dark:bg-white/[.06] text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/[.08]';
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Partnership Pipeline</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage business opportunities and strategic growth.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangeFilter value={range} onChange={setRange} />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search pipeline..."
                className="pl-10 w-64 bg-white dark:bg-[#0F1A2E]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                setCurrentOpportunity({ stage: 'new-lead', priority: 'warm', estimatedValue: 0 });
                setIsDialogOpen(true);
              }}
              className="bg-[#1B3A4B] hover:bg-[#06748F]"
            >
              <Plus className="w-4 h-4 mr-2" /> New Opportunity
            </Button>
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
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">{stage.label}</h3>
                    <Badge variant="secondary" className="bg-slate-200 dark:bg-white/[.08] text-slate-600 dark:text-slate-400 text-[10px] px-1.5 py-0">
                      {filteredOpportunities.filter(o => o.stage === stage.id).length}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
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
                          className="bg-white dark:bg-[#0F1A2E] p-4 rounded-xl border border-slate-200 dark:border-white/[.08] shadow-sm hover:shadow-md transition-all group"
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
                                <DropdownMenuItem onClick={() => updateStage(opp.id, 'closed-won', opp.companyName)} className="text-green-600 font-medium">
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Won
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStage(opp.id, 'lost', opp.companyName)} className="text-red-600 font-medium">
                                  <XCircle className="w-4 h-4 mr-2" /> Mark Lost
                                </DropdownMenuItem>
                                <DropdownMenuItem className="border-t mt-1" onClick={() => { setCurrentOpportunity(opp); setIsDialogOpen(true); }}>
                                  Edit Opportunity
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteOpportunity(opp.id, opp.companyName)} className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1">{opp.companyName}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {opp.primaryContact}
                          </p>

                          <div className="pt-3 border-t border-slate-100 dark:border-white/[.06] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[#1B3A4B] dark:text-[#7FB6CC] font-bold text-sm">
                              <DollarSign className="w-3.5 h-3.5" />
                              {opp.estimatedValue?.toLocaleString() || '0'}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                              <Clock className="w-3 h-3" />
                              {opp.dateAdded?.toDate ? opp.dateAdded.toDate().toLocaleDateString() : 'Just now'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunity Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {currentOpportunity?.id ? 'Edit Opportunity' : 'New Opportunity'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input 
                    value={currentOpportunity?.companyName || ''} 
                    onChange={e => setCurrentOpportunity({...currentOpportunity, companyName: e.target.value})}
                    placeholder="e.g. TechStack"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Contact *</Label>
                  <Input 
                    value={currentOpportunity?.primaryContact || ''} 
                    onChange={e => setCurrentOpportunity({...currentOpportunity, primaryContact: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input 
                    type="email"
                    value={currentOpportunity?.email || ''} 
                    onChange={e => setCurrentOpportunity({...currentOpportunity, email: e.target.value})}
                    placeholder="john@techstack.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Value ($)</Label>
                  <Input 
                    type="number"
                    value={currentOpportunity?.estimatedValue || 0} 
                    onChange={e => setCurrentOpportunity({...currentOpportunity, estimatedValue: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-white/[.08] text-sm bg-white dark:bg-[#0F1A2E]"
                    value={currentOpportunity?.stage || 'new-lead'}
                    onChange={e => setCurrentOpportunity({...currentOpportunity, stage: e.target.value as OpportunityStage})}
                  >
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-white/[.08] text-sm bg-white dark:bg-[#0F1A2E]"
                    value={currentOpportunity?.priority || 'warm'}
                    onChange={e => setCurrentOpportunity({...currentOpportunity, priority: e.target.value as PriorityLevel})}
                  >
                    <option value="critical">Critical</option>
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea 
                  className="w-full h-24 p-3 rounded-md border border-slate-200 dark:border-white/[.08] text-sm bg-white dark:bg-[#0F1A2E]"
                  value={currentOpportunity?.notes || ''}
                  onChange={e => setCurrentOpportunity({...currentOpportunity, notes: e.target.value})}
                  placeholder="Additional details..."
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSaveOpportunity}
                className="bg-[#1B3A4B] hover:bg-[#06748F]"
              >
                {currentOpportunity?.id ? 'Save Changes' : 'Create Opportunity'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
