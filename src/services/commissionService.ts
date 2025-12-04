import {
  Commission,
  CommissionFilters,
  CommissionSummary,
  OperatorPayment,
  OperatorSummary,
  CommissionClosing,
  ExtendedUniqueValues,
  CloseCommissionsRequest,
  CloseOperatorPaymentsRequest,
  ClosingResponse
} from '@/types/commission'
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
  closing_info: {
    isClosed: boolean
    closedAt?: string
    closedBy?: string
    invoiceNumber?: string
    closingId?: string
  }
  reservation_status?: string
  payment_status?: string
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
    closingInfo: data.closing_info,
    reservationStatus: data.reservation_status,
    paymentStatus: data.payment_status,
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
      if (filters.isClosed !== undefined) {
        queryParams.append('isClosed', String(filters.isClosed))
      }
      if (filters.operator) {
        queryParams.append('operator', filters.operator)
      }
      if (filters.logisticStatus) {
        queryParams.append('logisticStatus', filters.logisticStatus)
      }
      if (filters.paymentStatus) {
        queryParams.append('paymentStatus', filters.paymentStatus)
      }
      if (filters.reservationStatus) {
        queryParams.append('reservationStatus', filters.reservationStatus)
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

  async getExtendedUniqueValues(): Promise<ExtendedUniqueValues> {
    try {
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.EXTENDED_UNIQUE_VALUES, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch extended unique values')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching extended unique values:', error)
      throw error
    }
  }

  // Operator Payment methods
  async getOperatorPayments(filters: CommissionFilters): Promise<OperatorPayment[]> {
    try {
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
      if (filters.operator) {
        queryParams.append('operator', filters.operator)
      }
      if (filters.logisticStatus) {
        queryParams.append('logisticStatus', filters.logisticStatus)
      }
      if (filters.isClosed !== undefined) {
        queryParams.append('isClosed', String(filters.isClosed))
      }
      if (filters.searchTerm) {
        queryParams.append('searchTerm', filters.searchTerm)
      }

      const endpoint = `${API_ENDPOINTS.COMMISSIONS.OPERATORS}?${queryParams.toString()}`
      const response = await apiCall(endpoint, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch operator payments')
      }

      const data = await response.json()
      return data.map((item: any) => ({
        ...item,
        saleDate: new Date(item.sale_date),
        operationDate: new Date(item.operation_date),
        operatorName: item.operator_name,
        operationType: item.operation_type,
        costAmount: item.cost_amount,
        logisticStatus: item.logistic_status,
        paymentDate: item.payment_date ? new Date(item.payment_date) : undefined,
        closingInfo: item.closing_info,
        reservationStatus: item.reservation_status,
        canClose: item.can_close,
        reservationNumber: item.reservation_number,
      }))
    } catch (error) {
      console.error('Error fetching operator payments:', error)
      throw error
    }
  }

  async getOperatorSummary(filters: CommissionFilters): Promise<OperatorSummary> {
    try {
      const queryParams = new URLSearchParams()
      if (filters.isClosed !== undefined) {
        queryParams.append('isClosed', String(filters.isClosed))
      }

      const endpoint = `${API_ENDPOINTS.COMMISSIONS.OPERATORS_SUMMARY}?${queryParams.toString()}`
      const response = await apiCall(endpoint, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch operator summary')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching operator summary:', error)
      throw error
    }
  }

  // Closing methods
  async closeCommissions(request: CloseCommissionsRequest): Promise<ClosingResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.CLOSE, {
        method: 'POST',
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to close commissions')
      }

      return await response.json()
    } catch (error) {
      console.error('Error closing commissions:', error)
      throw error
    }
  }

  async closeOperatorPayments(request: CloseOperatorPaymentsRequest): Promise<ClosingResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.OPERATORS_CLOSE, {
        method: 'POST',
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to close operator payments')
      }

      return await response.json()
    } catch (error) {
      console.error('Error closing operator payments:', error)
      throw error
    }
  }

  async getClosings(closingType?: string): Promise<CommissionClosing[]> {
    try {
      let endpoint = API_ENDPOINTS.COMMISSIONS.CLOSINGS
      if (closingType) {
        endpoint += `?closingType=${closingType}`
      }

      const response = await apiCall(endpoint, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch closings')
      }

      const data = await response.json()
      return data.map((item: any) => ({
        id: item.id,
        closingType: item.closing_type,
        recipientName: item.recipient_name,
        recipientId: item.recipient_id,
        periodStart: item.period_start,
        periodEnd: item.period_end,
        totalAmount: item.total_amount,
        currency: item.currency,
        itemCount: item.item_count,
        invoiceNumber: item.invoice_number,
        invoiceFile: item.invoice_file,
        expense: item.expense,
        isActive: item.is_active,
        undoneAt: item.undone_at,
        undoneByName: item.undone_by_name,
        undoReason: item.undo_reason,
        createdAt: item.created_at,
        createdByName: item.created_by_name,
        itemIds: item.item_ids,
      }))
    } catch (error) {
      console.error('Error fetching closings:', error)
      throw error
    }
  }

  async getClosingDetail(closingId: string): Promise<CommissionClosing & { items: (Commission | OperatorPayment)[] }> {
    try {
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.CLOSING_DETAIL(closingId), {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch closing detail')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching closing detail:', error)
      throw error
    }
  }

  async undoClosing(closingId: string, reason: string): Promise<{ message: string; items_reopened: number }> {
    try {
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.CLOSING_UNDO(closingId), {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to undo closing')
      }

      return await response.json()
    } catch (error) {
      console.error('Error undoing closing:', error)
      throw error
    }
  }

  async downloadInvoice(closingId: string): Promise<void> {
    try {
      const response = await apiCall(API_ENDPOINTS.COMMISSIONS.CLOSING_INVOICE(closingId), {
        method: 'GET',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to download invoice')
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `invoice_${closingId}.pdf`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      throw error
    }
  }
}

export const commissionService = new CommissionService()