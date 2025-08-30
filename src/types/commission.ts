export interface Commission {
  id: string
  reservationNumber: string
  saleDate: Date
  operationDate: Date
  tour: {
    id: string
    name: string
    code: string
    destination: string
  }
  client: {
    name: string
    email: string
    country: string
  }
  salesperson?: string
  externalAgency?: string
  passengers: {
    adults: number
    children: number
    infants: number
    total: number
  }
  pricing: {
    grossTotal: number
    costs: number
    netReceived: number
    currency: string
  }
  commission: {
    percentage: number
    amount: number
    status: 'pending' | 'approved' | 'paid' | 'cancelled'
    paymentDate?: Date
  }
  notes?: string
}

export interface CommissionFilters {
  startDate?: Date
  endDate?: Date
  dateType: 'sale' | 'operation'
  tour?: string
  salesperson?: string
  externalAgency?: string
  commissionStatus?: string
  searchTerm?: string
}

export interface CommissionSummary {
  totalSales: number
  totalCosts: number
  totalNet: number
  totalCommissions: number
  pendingCommissions: number
  paidCommissions: number
  averageCommissionRate: number
  reservationCount: number
}