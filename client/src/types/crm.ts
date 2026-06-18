import { Timestamp } from 'firebase/firestore';

export type OpportunityStage = 
  | 'new-lead' 
  | 'discovery' 
  | 'qualified' 
  | 'proposal-sent' 
  | 'negotiation' 
  | 'closed-won' 
  | 'active-client' 
  | 'lost';

export type PriorityLevel = 'hot' | 'warm' | 'cold' | 'critical';

export interface Opportunity {
  id: string;
  // Company Info
  companyName: string;
  industry?: string;
  website?: string;
  country?: string;
  companySize?: string;
  
  // Contact Info
  primaryContact: string;
  jobTitle?: string;
  email: string;
  phone?: string;
  linkedin?: string;
  
  // Business Info
  serviceInterest: string;
  opportunityType: 'new-business' | 'upsell' | 'renewal' | 'referral';
  estimatedValue: number;
  expectedStartDate?: any;
  leadSource?: string;
  
  // Relationship Info
  stage: OpportunityStage;
  probability: number; // 0, 25, 50, 75, 100
  priority: PriorityLevel;
  assignedTo?: string;
  
  // Metadata
  createdAt: any;
  updatedAt: any;
  notes?: string;
}

export interface Activity {
  id: string;
  opportunityId: string;
  type: string;
  description: string;
  createdBy: string;
  timestamp: any;
}

export const STAGES: { id: OpportunityStage; label: string; color: string }[] = [
  { id: 'new-lead', label: 'New Lead', color: 'bg-blue-500' },
  { id: 'discovery', label: 'Discovery', color: 'bg-purple-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
  { id: 'proposal-sent', label: 'Proposal Sent', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-yellow-500' },
  { id: 'closed-won', label: 'Closed Won', color: 'bg-green-600' },
  { id: 'active-client', label: 'Active Client', color: 'bg-emerald-500' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-500' },
];
