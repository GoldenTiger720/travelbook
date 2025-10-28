// Payment interface
export interface Payment {
  id: string
  date: Date
  method: string
  amount: number
  status: 'completed' | 'refunded' | 'pending' | 'partial' | 'paid' | 'cancelled'
  notes?: string
  receipt?: string
  refundedAmount?: number
  refundDate?: Date
  refundReason?: string
}

// New payment form interface
export interface NewPayment {
  date: Date
  method: string
  amount: number
  notes: string
  status: Payment['status']
  receipt: string
}

// Cancel modal state interface
export interface CancelModalState {
  reason: string
  fee: number
  observation: string
}

// Tour modal state interface (matches TourData from TourModal component)
export interface TourModalState {
  tourId: string
  tourName: string
  destination: string
  destinationId?: string
  date: Date
  pickupAddress: string
  pickupTime: string
  adultPax: number
  adultPrice: number
  childPax: number
  childPrice: number
  infantPax: number
  infantPrice: number
  comments: string
  operator: string
}

// Payment summary interface
export interface PaymentSummary {
  total: number
  paid: number
  refunded: number
  remaining: number
}
