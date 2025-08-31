export interface Reservation {
  id: string
  reservationNumber: string
  operationDate: Date
  saleDate: Date
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show'
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded' | 'overdue'
  client: {
    name: string
    email: string
    phone: string
    country: string
    idNumber: string
  }
  tour: {
    id: string
    name: string
    code: string
    destination: string
    date: Date
    pickupTime: string
    pickupAddress: string
  }
  passengers: {
    adults: number
    children: number
    infants: number
  }
  pricing: {
    adultPrice: number
    childPrice: number
    infantPrice: number
    totalAmount: number
    currency: string
  }
  salesperson: string
  operator?: string
  guide?: string
  driver?: string
  externalAgency?: string
  purchaseOrderNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ReservationFilters {
  startDate?: Date
  endDate?: Date
  dateType: 'operation' | 'sale'
  status?: string
  paymentStatus?: string
  salesperson?: string
  operator?: string
  tour?: string
  guide?: string
  driver?: string
  externalAgency?: string
  searchTerm?: string
}