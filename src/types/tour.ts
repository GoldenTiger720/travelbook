export interface TourPricing {
  adultPrice: number
  childPrice: number
  infantPrice: number
  minAdultPrice?: number
  maxAdultPrice?: number
  minChildPrice?: number
  maxChildPrice?: number
  minInfantPrice?: number
  maxInfantPrice?: number
  currency: string
}

export interface Tour {
  id: string
  code: string
  name: string
  destination: string
  category: 'city' | 'adventure' | 'wine' | 'cultural' | 'nature' | 'historical'
  description: string
  duration: string // e.g., "4 hours", "2 days"
  basePricing: TourPricing
  inclusions?: string[]
  exclusions?: string[]
  defaultPickupTime?: string
  minParticipants?: number
  maxParticipants?: number
  operatingDays?: string[] // e.g., ["monday", "tuesday", "wednesday"]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TourBooking {
  id: string
  tourId: string
  tourName: string
  tourCode: string
  date: Date
  pickupAddress?: string
  pickupTime?: string
  adultPax: number
  adultPrice: number
  childPax: number
  childPrice: number
  infantPax: number
  infantPrice: number
  subtotal: number
  operator?: string
  comments?: string
  createdAt: string
  updatedAt: string
}

export interface QuoteWithTours {
  id: string
  quoteNumber: string
  customer: {
    name: string
    email: string
    phone: string
    idNumber: string
    language: string
    country: string
    address: string
  }
  tours: TourBooking[]
  grandTotal: number
  currency: string
  hasMultipleAddresses: boolean
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  validUntil: Date
  createdAt: Date
  updatedAt: Date
}