export interface Contact {
  id: number;
  name: string;
  phone: string;
  batch_id: number | null;
  tags: string;
  category: string;
  notes: string;
  created_at: string;
}

export interface Batch {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Message {
  id: number;
  contact_id: number;
  batch_id: number | null;
  content: string;
  status: 'pending' | 'sent' | 'failed';
  scheduled_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  contact_name?: string;
  contact_phone?: string;
  batch_name?: string;
}

export interface Stats {
  totalMessages: number;
  sentMessages: number;
  failedMessages: number;
  totalContacts: number;
  totalBatches: number;
  activeCampaigns: number;
}
