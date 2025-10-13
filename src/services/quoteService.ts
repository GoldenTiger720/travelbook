import { Quote, QuoteFilters } from '@/types/quote';
import { format } from 'date-fns';

const mockQuotes: Quote[] = [
  {
    id: '1756682399909',
    quoteNumber: 'Q-2025-005',
    customer: {
      name: 'Maria González',
      email: 'maria@example.com',
      phone: '+54 11 1234-5678',
      company: 'Tech Solutions SA'
    },
    tourDetails: {
      destination: 'Buenos Aires City Tour',
      tourType: 'city-tour',
      startDate: new Date(2025, 0, 15),
      endDate: new Date(2025, 0, 17),
      passengers: 5,
      passengerBreakdown: {
        adults: 2,
        children: 2,
        infants: 1
      },
      description: 'Complete city tour including Recoleta, La Boca, and Tango show'
    },
    pricing: {
      amount: 3250,
      currency: 'USD',
      breakdown: [
        { item: 'City Tour - Adults', quantity: 2, unitPrice: 150, total: 300 },
        { item: 'City Tour - Children', quantity: 2, unitPrice: 75, total: 150 },
        { item: 'Hotel Accommodation (Family Room)', quantity: 1, unitPrice: 1800, total: 1800 },
        { item: 'Tango Show with Dinner - Adults', quantity: 2, unitPrice: 275, total: 550 },
        { item: 'Tango Show with Dinner - Children', quantity: 2, unitPrice: 150, total: 300 },
        { item: 'Airport Transfer (Van)', quantity: 2, unitPrice: 75, total: 150 }
      ]
    },
    status: 'pending',
    leadSource: 'website',
    assignedTo: 'Carlos Mendez',
    agency: 'Direct',
    validUntil: new Date(2025, 1, 30),
    shareableLink: 'https://travelbook.com/quotes/share/xyz789abc',
    metadata: {
      createdAt: new Date(2025, 0, 1),
      updatedAt: new Date(2025, 0, 1),
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
      passengerBreakdown: {
        adults: 2,
        children: 1,
        infants: 1
      },
      description: 'Beach resort package with excursions to Christ the Redeemer and Sugarloaf'
    },
    pricing: {
      amount: 3890,
      currency: 'USD',
      breakdown: [
        { item: 'Beach Resort (7 nights) - Adults', quantity: 2, unitPrice: 1400, total: 2800 },
        { item: 'Beach Resort (7 nights) - Child', quantity: 1, unitPrice: 700, total: 700 },
        { item: 'City Excursions - Adults', quantity: 2, unitPrice: 120, total: 240 },
        { item: 'City Excursions - Child', quantity: 1, unitPrice: 60, total: 60 },
        { item: 'Airport Transfers', quantity: 2, unitPrice: 45, total: 90 }
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
      shareableLink: `https://travelbook.com/quotes/share/${Date.now().toString()}`,
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