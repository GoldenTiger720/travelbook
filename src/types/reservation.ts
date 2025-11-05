export interface PaymentDetails {
  id: number
  date: string
  method: string
  percentage: number
  amountPaid: number
  comments?: string
  status: 'pending' | 'partial' | 'paid' | 'refunded' | 'cancelled'
  receiptFile?: string
  copyComments?: boolean
  includePayment?: boolean
  quoteComments?: string
  sendPurchaseOrder?: boolean
  sendQuotationAccess?: boolean
}

export interface Reservation {
  id: string
  bookingId: string // Original booking ID without tour suffix (for API calls)
  reservationNumber: string
  operationDate: Date
  saleDate: Date
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show' | 'reconfirmed'
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded' | 'overdue'
  client: {
    id?: string
    name: string
    email: string
    phone: string
    country: string
    idNumber: string
    language?: string
    cpf?: string
    address?: string
    hotel?: string
    room?: string
    comments?: string
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
  tourId?: string // Backend BookingTour ID for actions
  tourStatus?: 'pending' | 'confirmed' | 'checked-in' | 'cancelled' | 'no-show' | 'completed'
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
  email: string
  phone: string
  operator?: string
  guide?: string // User ID for API calls
  guideName?: string // User name for display
  driver?: string // User ID for API calls
  driverName?: string // User name for display
  externalAgency?: string
  purchaseOrderNumber?: string
  notes?: string
  paymentDetails?: PaymentDetails // Legacy: single payment (kept for backward compatibility)
  payments?: PaymentDetails[] // New: multiple payments support
  acceptTerm?: boolean // Whether customer accepted terms
  acceptTermDetails?: { // Details of when terms were accepted
    email?: string | null
    ip?: string | null
    name?: string | null
    date?: string | null
    accepted: boolean
  }
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