import { Tour, TourPricing } from '@/types/tour'

const mockTours: Tour[] = [
  {
    id: '1',
    code: 'SCL-CT01',
    name: 'Santiago City Tour',
    destination: 'Santiago',
    category: 'city',
    description: 'Discover the highlights of Santiago including Plaza de Armas, La Moneda Palace, and San Cristobal Hill',
    duration: '4 hours',
    basePricing: {
      adultPrice: 35000,
      childPrice: 20000,
      infantPrice: 0,
      minAdultPrice: 30000,
      maxAdultPrice: 45000,
      minChildPrice: 15000,
      maxChildPrice: 25000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'CLP'
    },
    inclusions: ['Professional guide', 'Transportation', 'Entrance fees'],
    exclusions: ['Meals', 'Tips'],
    defaultPickupTime: '09:00',
    minParticipants: 2,
    maxParticipants: 15,
    operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    code: 'VAL-WT01',
    name: 'Casablanca Valley Wine Tour',
    destination: 'Valparaíso',
    category: 'wine',
    description: 'Visit premium wineries in Casablanca Valley with wine tasting and vineyard tours',
    duration: '6 hours',
    basePricing: {
      adultPrice: 65000,
      childPrice: 30000,
      infantPrice: 0,
      minAdultPrice: 55000,
      maxAdultPrice: 75000,
      minChildPrice: 25000,
      maxChildPrice: 35000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'CLP'
    },
    inclusions: ['Wine tasting', 'Lunch', 'Professional guide', 'Transportation'],
    exclusions: ['Additional wine purchases', 'Tips'],
    defaultPickupTime: '10:00',
    minParticipants: 2,
    maxParticipants: 12,
    operatingDays: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    code: 'BAR-CC01',
    name: 'Circuito Chico',
    destination: 'Bariloche',
    category: 'nature',
    description: 'Scenic tour around Nahuel Huapi Lake including Llao Llao Hotel, Puerto Pañuelo, and Panoramic Point',
    duration: '3 hours',
    basePricing: {
      adultPrice: 25000,
      childPrice: 15000,
      infantPrice: 0,
      minAdultPrice: 20000,
      maxAdultPrice: 30000,
      minChildPrice: 12000,
      maxChildPrice: 18000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'ARS'
    },
    inclusions: ['Professional guide', 'Transportation'],
    exclusions: ['Meals', 'Entrance to Campanario Hill'],
    defaultPickupTime: '14:00',
    minParticipants: 2,
    maxParticipants: 20,
    operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    code: 'BAR-LC01',
    name: 'La Cueva del Viejo Volcán',
    destination: 'Bariloche',
    category: 'adventure',
    description: 'Adventure tour to the old volcano cave with trekking and geological exploration',
    duration: '5 hours',
    basePricing: {
      adultPrice: 45000,
      childPrice: 30000,
      infantPrice: 0,
      minAdultPrice: 40000,
      maxAdultPrice: 55000,
      minChildPrice: 25000,
      maxChildPrice: 35000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'ARS'
    },
    inclusions: ['Professional guide', 'Transportation', 'Safety equipment', 'Snack'],
    exclusions: ['Lunch', 'Personal insurance'],
    defaultPickupTime: '09:00',
    minParticipants: 4,
    maxParticipants: 12,
    operatingDays: ['tuesday', 'thursday', 'saturday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    code: 'ATR-FD01',
    name: 'Atacama Full Day Tour',
    destination: 'Atacama Desert',
    category: 'nature',
    description: 'Full day exploring Valle de la Luna, Tres Marías, and salt flats with sunset viewing',
    duration: '8 hours',
    basePricing: {
      adultPrice: 85000,
      childPrice: 45000,
      infantPrice: 0,
      minAdultPrice: 75000,
      maxAdultPrice: 95000,
      minChildPrice: 40000,
      maxChildPrice: 50000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'CLP'
    },
    inclusions: ['Professional guide', 'Transportation', 'Lunch box', 'Entrance fees'],
    exclusions: ['Dinner', 'Tips'],
    defaultPickupTime: '08:00',
    minParticipants: 2,
    maxParticipants: 15,
    operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    code: 'EIS-MD01',
    name: 'Moai Discovery Tour',
    destination: 'Easter Island',
    category: 'cultural',
    description: 'Visit the main archaeological sites including Rano Raraku, Ahu Tongariki, and Anakena Beach',
    duration: '7 hours',
    basePricing: {
      adultPrice: 120000,
      childPrice: 60000,
      infantPrice: 0,
      minAdultPrice: 100000,
      maxAdultPrice: 140000,
      minChildPrice: 50000,
      maxChildPrice: 70000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'CLP'
    },
    inclusions: ['Professional guide', 'Transportation', 'Lunch', 'National Park entrance'],
    exclusions: ['Tips', 'Beverages'],
    defaultPickupTime: '09:00',
    minParticipants: 2,
    maxParticipants: 10,
    operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '7',
    code: 'PAT-TDP01',
    name: 'Torres del Paine Day Trip',
    destination: 'Patagonia',
    category: 'adventure',
    description: 'Day trip to Torres del Paine National Park with hiking and wildlife observation',
    duration: '12 hours',
    basePricing: {
      adultPrice: 150000,
      childPrice: 80000,
      infantPrice: 0,
      minAdultPrice: 130000,
      maxAdultPrice: 170000,
      minChildPrice: 70000,
      maxChildPrice: 90000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'CLP'
    },
    inclusions: ['Professional guide', 'Transportation', 'Lunch box', 'Park entrance fee'],
    exclusions: ['Accommodation', 'Dinner', 'Personal equipment'],
    defaultPickupTime: '06:00',
    minParticipants: 4,
    maxParticipants: 12,
    operatingDays: ['tuesday', 'thursday', 'saturday', 'sunday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    code: 'BAR-7L01',
    name: 'Seven Lakes Route',
    destination: 'Bariloche',
    category: 'nature',
    description: 'Scenic drive through the famous Seven Lakes route to San Martin de los Andes',
    duration: '10 hours',
    basePricing: {
      adultPrice: 65000,
      childPrice: 40000,
      infantPrice: 0,
      minAdultPrice: 55000,
      maxAdultPrice: 75000,
      minChildPrice: 35000,
      maxChildPrice: 45000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'ARS'
    },
    inclusions: ['Professional guide', 'Transportation', 'Photo stops'],
    exclusions: ['Meals', 'Entrance fees'],
    defaultPickupTime: '08:00',
    minParticipants: 4,
    maxParticipants: 18,
    operatingDays: ['monday', 'wednesday', 'friday', 'sunday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '9',
    code: 'MDZ-WR01',
    name: 'Mendoza Wine Route',
    destination: 'Mendoza',
    category: 'wine',
    description: 'Visit three premium wineries in Maipú and Luján de Cuyo with wine tasting',
    duration: '6 hours',
    basePricing: {
      adultPrice: 55000,
      childPrice: 25000,
      infantPrice: 0,
      minAdultPrice: 45000,
      maxAdultPrice: 65000,
      minChildPrice: 20000,
      maxChildPrice: 30000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'ARS'
    },
    inclusions: ['Wine tasting', 'Professional guide', 'Transportation', 'Winery tour'],
    exclusions: ['Lunch', 'Wine purchases'],
    defaultPickupTime: '10:00',
    minParticipants: 2,
    maxParticipants: 14,
    operatingDays: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '10',
    code: 'VAL-PC01',
    name: 'Valparaíso & Viña del Mar City Tour',
    destination: 'Valparaíso',
    category: 'city',
    description: 'Explore the colorful port city of Valparaíso and the beach resort of Viña del Mar',
    duration: '8 hours',
    basePricing: {
      adultPrice: 45000,
      childPrice: 25000,
      infantPrice: 0,
      minAdultPrice: 40000,
      maxAdultPrice: 55000,
      minChildPrice: 20000,
      maxChildPrice: 30000,
      minInfantPrice: 0,
      maxInfantPrice: 0,
      currency: 'CLP'
    },
    inclusions: ['Professional guide', 'Transportation', 'Funicular ride'],
    exclusions: ['Meals', 'Museum entrance fees'],
    defaultPickupTime: '09:00',
    minParticipants: 2,
    maxParticipants: 20,
    operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

class TourCatalogService {
  private tours: Tour[] = mockTours

  async getAllTours(): Promise<Tour[]> {
    return this.tours.filter(tour => tour.isActive)
  }

  async getTourById(id: string): Promise<Tour | undefined> {
    return this.tours.find(tour => tour.id === id)
  }

  async getToursByDestination(destination: string): Promise<Tour[]> {
    return this.tours.filter(
      tour => tour.destination.toLowerCase() === destination.toLowerCase() && tour.isActive
    )
  }

  async searchTours(query: string): Promise<Tour[]> {
    const lowerQuery = query.toLowerCase()
    return this.tours.filter(
      tour =>
        tour.isActive &&
        (tour.name.toLowerCase().includes(lowerQuery) ||
          tour.destination.toLowerCase().includes(lowerQuery) ||
          tour.code.toLowerCase().includes(lowerQuery))
    )
  }

  async getDestinations(): Promise<string[]> {
    const destinations = new Set(this.tours.map(tour => tour.destination))
    return Array.from(destinations).sort()
  }

  formatPrice(price: number, currency: string): string {
    const symbols: { [key: string]: string } = {
      CLP: 'CLP$',
      USD: 'USD$',
      EUR: '€',
      BRL: 'R$',
      ARS: 'ARS$'
    }
    return `${symbols[currency] || currency} ${price.toLocaleString()}`
  }

  validatePriceInRange(tour: Tour, priceType: 'adult' | 'child' | 'infant', price: number): boolean {
    const pricing = tour.basePricing
    
    switch (priceType) {
      case 'adult':
        const minAdult = pricing.minAdultPrice ?? pricing.adultPrice * 0.8
        const maxAdult = pricing.maxAdultPrice ?? pricing.adultPrice * 1.2
        return price >= minAdult && price <= maxAdult
      
      case 'child':
        const minChild = pricing.minChildPrice ?? pricing.childPrice * 0.8
        const maxChild = pricing.maxChildPrice ?? pricing.childPrice * 1.2
        return price >= minChild && price <= maxChild
      
      case 'infant':
        const minInfant = pricing.minInfantPrice ?? 0
        const maxInfant = pricing.maxInfantPrice ?? pricing.infantPrice
        return price >= minInfant && price <= maxInfant
      
      default:
        return false
    }
  }
}

export const tourCatalogService = new TourCatalogService()