import { Quote, QuoteFilters } from '@/types/quote';
import { format } from 'date-fns';

const mockQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'Q-2024-001',
    customer: {
      name: 'Maria González',
      email: 'maria@example.com',
      phone: '+54 11 1234-5678',
      company: 'Tech Solutions SA'
    },
    tourDetails: {
      destination: 'Buenos Aires City Tour',
      tourType: 'city-tour',
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 0, 17),
      passengers: 2,
      description: 'Complete city tour including Recoleta, La Boca, and Tango show'
    },
    pricing: {
      amount: 2450,
      currency: 'USD',
      breakdown: [
        { item: 'City Tour (2 days)', quantity: 2, unitPrice: 150, total: 300 },
        { item: 'Hotel Accommodation', quantity: 2, unitPrice: 800, total: 1600 },
        { item: 'Tango Show with Dinner', quantity: 2, unitPrice: 275, total: 550 }
      ]
    },
    status: 'pending',
    leadSource: 'website',
    assignedTo: 'Carlos Mendez',
    agency: 'Direct',
    validUntil: new Date(2024, 0, 30),
    metadata: {
      createdAt: new Date(2024, 0, 1),
      updatedAt: new Date(2024, 0, 1),
      createdBy: 'Carlos Mendez'
    }
  },
  {
    id: '2',
    quoteNumber: 'Q-2024-002',
    customer: {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '+55 11 98765-4321'
    },
    tourDetails: {
      destination: 'Rio de Janeiro Beach Package',
      tourType: 'beach-tour',
      startDate: new Date(2024, 0, 18),
      endDate: new Date(2024, 0, 25),
      passengers: 4,
      description: 'Beach resort package with excursions to Christ the Redeemer and Sugarloaf'
    },
    pricing: {
      amount: 3890,
      currency: 'USD',
      breakdown: [
        { item: 'Beach Resort (7 nights)', quantity: 2, unitPrice: 1400, total: 2800 },
        { item: 'City Excursions', quantity: 4, unitPrice: 120, total: 480 },
        { item: 'Airport Transfers', quantity: 2, unitPrice: 80, total: 160 },
        { item: 'Breakfast Package', quantity: 4, unitPrice: 112.5, total: 450 }
      ]
    },
    status: 'approved',
    leadSource: 'instagram',
    assignedTo: 'Ana Costa',
    agency: 'Brazil Tours',
    validUntil: new Date(2024, 1, 1),
    shareableLink: 'https://travelbook.com/quotes/share/abc123def',
    termsAccepted: {
      accepted: true,
      acceptedAt: new Date(2024, 0, 5),
      acceptedBy: 'João Silva'
    },
    metadata: {
      createdAt: new Date(2024, 0, 3),
      updatedAt: new Date(2024, 0, 5),
      createdBy: 'Ana Costa'
    }
  },
  {
    id: '3',
    quoteNumber: 'Q-2024-003',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      company: 'Adventure Seekers Inc'
    },
    tourDetails: {
      destination: 'Patagonia Adventure',
      tourType: 'adventure',
      startDate: new Date(2024, 1, 10),
      endDate: new Date(2024, 1, 20),
      passengers: 2,
      description: 'Ultimate Patagonia experience: hiking, glaciers, and wildlife'
    },
    pricing: {
      amount: 4200,
      currency: 'USD'
    },
    status: 'sent',
    leadSource: 'referral',
    assignedTo: 'Diego Ramirez',
    agency: 'Adventure Seekers',
    validUntil: new Date(2024, 1, 5),
    shareableLink: 'https://travelbook.com/quotes/share/xyz789ghi',
    metadata: {
      createdAt: new Date(2024, 0, 5),
      updatedAt: new Date(2024, 0, 8),
      createdBy: 'Diego Ramirez'
    }
  }
];

class QuoteService {
  private quotes: Quote[] = [...mockQuotes];

  async getQuotes(filters?: QuoteFilters): Promise<Quote[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredQuotes = [...this.quotes];

    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredQuotes = filteredQuotes.filter(quote => 
          quote.customer.name.toLowerCase().includes(searchLower) ||
          quote.customer.email.toLowerCase().includes(searchLower) ||
          quote.quoteNumber.toLowerCase().includes(searchLower) ||
          quote.tourDetails.destination.toLowerCase().includes(searchLower)
        );
      }

      if (filters.status && filters.status !== 'all') {
        filteredQuotes = filteredQuotes.filter(quote => quote.status === filters.status);
      }

      if (filters.tourType && filters.tourType !== 'all') {
        filteredQuotes = filteredQuotes.filter(quote => quote.tourDetails.tourType === filters.tourType);
      }

      if (filters.leadSource && filters.leadSource !== 'all') {
        filteredQuotes = filteredQuotes.filter(quote => quote.leadSource === filters.leadSource);
      }

      if (filters.assignedTo && filters.assignedTo !== 'all') {
        filteredQuotes = filteredQuotes.filter(quote => quote.assignedTo === filters.assignedTo);
      }

      if (filters.dateFrom) {
        filteredQuotes = filteredQuotes.filter(quote => 
          quote.tourDetails.startDate >= filters.dateFrom!
        );
      }

      if (filters.dateTo) {
        filteredQuotes = filteredQuotes.filter(quote => 
          quote.tourDetails.startDate <= filters.dateTo!
        );
      }

      if (filters.minAmount) {
        filteredQuotes = filteredQuotes.filter(quote => 
          quote.pricing.amount >= filters.minAmount!
        );
      }

      if (filters.maxAmount) {
        filteredQuotes = filteredQuotes.filter(quote => 
          quote.pricing.amount <= filters.maxAmount!
        );
      }
    }

    return filteredQuotes;
  }

  async getQuoteById(id: string): Promise<Quote | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.quotes.find(quote => quote.id === id) || null;
  }

  async getQuoteByShareableLink(link: string): Promise<Quote | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.quotes.find(quote => quote.shareableLink === link) || null;
  }

  async createQuote(quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'metadata'>): Promise<Quote> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newQuote: Quote = {
      ...quoteData,
      id: Date.now().toString(),
      quoteNumber: `Q-${new Date().getFullYear()}-${String(this.quotes.length + 1).padStart(3, '0')}`,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: quoteData.assignedTo
      }
    };

    this.quotes.push(newQuote);
    return newQuote;
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.quotes.findIndex(quote => quote.id === id);
    if (index === -1) return null;

    this.quotes[index] = {
      ...this.quotes[index],
      ...updates,
      metadata: {
        ...this.quotes[index].metadata,
        updatedAt: new Date(),
        lastModifiedBy: updates.assignedTo || this.quotes[index].assignedTo
      }
    };

    return this.quotes[index];
  }

  async deleteQuote(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.quotes.findIndex(quote => quote.id === id);
    if (index === -1) return false;

    this.quotes.splice(index, 1);
    return true;
  }

  async generateShareableLink(quoteId: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const randomString = Math.random().toString(36).substring(2, 15);
    const link = `https://travelbook.com/quotes/share/${randomString}`;
    
    const quote = this.quotes.find(q => q.id === quoteId);
    if (quote) {
      quote.shareableLink = link;
    }
    
    return link;
  }

  async acceptTerms(quoteId: string, acceptedBy: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const quote = this.quotes.find(q => q.id === quoteId);
    if (!quote) return false;

    quote.termsAccepted = {
      accepted: true,
      acceptedAt: new Date(),
      acceptedBy
    };

    return true;
  }

  async sendQuoteByEmail(quoteId: string, recipientEmail: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Sending quote ${quoteId} to ${recipientEmail}`);
    return true;
  }

  async duplicateQuote(quoteId: string): Promise<Quote | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const originalQuote = this.quotes.find(q => q.id === quoteId);
    if (!originalQuote) return null;

    const newQuote: Quote = {
      ...originalQuote,
      id: Date.now().toString(),
      quoteNumber: `Q-${new Date().getFullYear()}-${String(this.quotes.length + 1).padStart(3, '0')}`,
      status: 'draft',
      shareableLink: undefined,
      termsAccepted: undefined,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: originalQuote.assignedTo
      }
    };

    this.quotes.push(newQuote);
    return newQuote;
  }
}

export const quoteService = new QuoteService();