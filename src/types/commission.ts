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
  closingInfo: {
    isClosed: boolean
    closedAt?: string
    closedBy?: string
    invoiceNumber?: string
    closingId?: string
  }
  reservationStatus?: string
  paymentStatus?: string
  notes?: string
}

export interface OperatorPayment {
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
  operatorName: string
  operationType: 'own-operation' | 'third-party'
  costAmount: number
  currency: string
  logisticStatus: 'pending' | 'confirmed' | 'reconfirmed' | 'completed' | 'no-show' | 'cancelled'
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  paymentDate?: Date
  closingInfo: {
    isClosed: boolean
    closedAt?: string
    closedBy?: string
    invoiceNumber?: string
    closingId?: string
  }
  reservationStatus?: string
  canClose: boolean
  passengers: {
    adults: number
    children: number
    infants: number
    total: number
  }
  notes?: string
}

export interface CommissionClosing {
  id: string
  closingType: 'salesperson' | 'agency' | 'operator'
  recipientName: string
  recipientId?: string
  periodStart: string
  periodEnd: string
  totalAmount: number
  currency: string
  itemCount: number
  invoiceNumber: string
  invoiceFile?: string
  expense?: string
  isActive: boolean
  undoneAt?: string
  undoneByName?: string
  undoReason?: string
  createdAt: string
  createdByName?: string
  itemIds: string[]
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
  isClosed?: boolean
  recipientType?: 'salesperson' | 'agency'
  operator?: string
  logisticStatus?: string
  paymentStatus?: string
  reservationStatus?: string
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

export interface OperatorSummary {
  totalAmount: number
  pendingAmount: number
  paidAmount: number
  count: number
}

export interface ExtendedUniqueValues {
  salespersons: string[]
  agencies: string[]
  tours: { id: string; name: string }[]
  operators: string[]
  commissionStatuses: { value: string; label: string }[]
  logisticStatuses: { value: string; label: string }[]
  paymentStatuses: { value: string; label: string }[]
  reservationStatuses: { value: string; label: string }[]
}

export interface CloseCommissionsRequest {
  commission_ids: string[]
  closing_type: 'salesperson' | 'agency'
  recipient_name: string
  recipient_id?: string
  period_start: string
  period_end: string
  currency: string
  adjustments?: Record<string, { amount?: number; percentage?: number; notes?: string }>
}

export interface CloseOperatorPaymentsRequest {
  payment_ids: string[]
  operator_name: string
  period_start: string
  period_end: string
  currency: string
  adjustments?: Record<string, { amount?: number; notes?: string }>
}

export interface ClosingResponse {
  closing: CommissionClosing
  expense_id: string
  message: string
}