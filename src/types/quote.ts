export interface Quote {
  id: string;
  quoteNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    birthday?: Date;
  };
  tourDetails: {
    destination: string;
    tourType: string;
    startDate: Date;
    endDate?: Date;
    passengers: number;
    passengerBreakdown?: {
      adults: number;
      children: number;
      infants: number;
    };
    description?: string;
  };
  pricing: {
    amount: number;
    currency: 'ARS' | 'BRL' | 'CLP' | 'USD' | 'EUR';
    breakdown?: Array<{
      item: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  };
  status: 'draft' | 'pending' | 'sent' | 'approved' | 'converted' | 'expired' | 'cancelled';
  leadSource: 'instagram' | 'whatsapp' | 'website' | 'email' | 'referral' | 'direct' | 'other';
  assignedTo: string;
  agency?: string;
  validUntil: Date;
  shareableLink?: string;
  termsAccepted?: {
    accepted: boolean;
    acceptedAt?: Date;
    acceptedBy?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy?: string;
  };
  notes?: string;
}

export interface QuoteFilters {
  search?: string;
  status?: string;
  tourType?: string;
  leadSource?: string;
  assignedTo?: string;
  agency?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

export interface QuoteStats {
  total: number;
  byStatus: Record<string, number>;
  totalValue: Record<string, number>;
  conversionRate: number;
  averageValue: number;
}