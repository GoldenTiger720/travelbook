import { Commission, CommissionFilters, CommissionSummary } from '@/types/commission'
import { API_ENDPOINTS, apiCall } from '@/config/api'

// Backend response interface
interface BackendCommission {
  id: string
  reservation_number: string
  sale_date: string
  operation_date: string
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
  salesperson_name?: string
  external_agency?: string
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
    paymentDate?: string
  }
  notes?: string
}

// Map backend data to frontend format
const mapBackendCommission = (data: BackendCommission): Commission => {
  return {
    id: data.id,
    reservationNumber: data.reservation_number,
    saleDate: new Date(data.sale_date),
    operationDate: new Date(data.operation_date),
    tour: data.tour,
    client: data.client,
    salesperson: data.salesperson_name,
    externalAgency: data.external_agency,
    passengers: data.passengers,
    pricing: data.pricing,
    commission: {
      ...data.commission,
      paymentDate: data.commission.paymentDate ? new Date(data.commission.paymentDate) : undefined
    },
    notes: data.notes
  }
}

class CommissionService {
  async getAllCommissions(): Promise<Commission[]> {
    try {
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.LIST, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch commissions')
      }

      const data = await response.json()
      return data.map(mapBackendCommission)
    } catch (error) {
      console.error('Error fetching commissions:', error)
      throw error
    }
  }

  async getFilteredCommissions(filters: CommissionFilters): Promise<Commission[]> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()

      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate.toISOString())
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate.toISOString())
      }
      if (filters.dateType) {
        queryParams.append('dateType', filters.dateType)
      }
      if (filters.tour) {
        queryParams.append('tour', filters.tour)
      }
      if (filters.salesperson) {
        queryParams.append('salesperson', filters.salesperson)
      }
      if (filters.externalAgency) {
        queryParams.append('externalAgency', filters.externalAgency)
      }
      if (filters.commissionStatus) {
        queryParams.append('commissionStatus', filters.commissionStatus)
      }
      if (filters.searchTerm) {
        queryParams.append('searchTerm', filters.searchTerm)
      }

      const endpoint = `${API_ENDPOINTS.COMMISSIONS.LIST}?${queryParams.toString()}`
      const response = await apiCall(endpoint, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch filtered commissions')
      }

      const data = await response.json()
      return data.map(mapBackendCommission)
    } catch (error) {
      console.error('Error fetching filtered commissions:', error)
      throw error
    }
  }

  async getCommissionSummary(commissions?: Commission[]): Promise<CommissionSummary> {
    try {
      // If commissions are passed, we can calculate client-side
      // Otherwise, fetch from backend API
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.SUMMARY, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch commission summary')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching commission summary:', error)
      throw error
    }
  }

  async getUniqueValues() {
    try {
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.UNIQUE_VALUES, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch unique values')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching unique values:', error)
      throw error
    }
  }

  formatCurrency(amount: number, currency: string): string {
    const symbols: { [key: string]: string } = {
      CLP: 'CLP$',
      USD: 'USD$',
      EUR: '€',
      BRL: 'R$',
      ARS: 'ARS$'
    }
    return `${symbols[currency] || currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
}

export const commissionService = new CommissionService()