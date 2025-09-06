import { apiCall } from '@/config/api';

interface BookingData {
  customer: {
    name: string
    email: string
    phone?: string
    language?: string
    country?: string
    idNumber?: string
    cpf?: string
    address?: string
  }
  tours: any[]
  tourDetails: {
    destination: string
    tourType: string
    startDate: Date
    endDate: Date
    passengers: number
    passengerBreakdown: {
      adults: number
      children: number
      infants: number
    }
    hotel?: string
    room?: string
  }
  pricing: {
    amount: number
    currency: string
    breakdown: Array<{
      item: string
      quantity: number
      unitPrice: number
      total: number
    }>
  }
  leadSource: string
  assignedTo: string
  agency?: string
  status: string
  validUntil: Date
  additionalNotes?: string
  hasMultipleAddresses?: boolean
  termsAccepted: {
    accepted: boolean
  }
  quotationComments?: string
  includePayment?: boolean
  copyComments?: boolean
  sendPurchaseOrder?: boolean
  sendQuotationAccess?: boolean
  paymentDetails?: {
    date?: Date
    method?: string
    percentage?: number
    amountPaid?: number
    comments?: string
    status?: string
    receiptFile?: File | null
  }
}

interface BookingResponse {
  id: string
  bookingNumber: string
  status: string
  createdAt: Date
  updatedAt: Date
}

class BookingService {
  private endpoint = '/api/booking'

  async createBooking(bookingData: BookingData): Promise<BookingResponse> {
    try {
      const response = await apiCall(this.endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...bookingData,
          tourDetails: {
            ...bookingData.tourDetails,
            startDate: bookingData.tourDetails.startDate.toISOString(),
            endDate: bookingData.tourDetails.endDate.toISOString(),
          },
          validUntil: bookingData.validUntil.toISOString(),
          paymentDetails: bookingData.paymentDetails ? {
            ...bookingData.paymentDetails,
            date: bookingData.paymentDetails.date?.toISOString(),
          } : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create booking: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  async getBooking(id: string): Promise<BookingResponse | null> {
    try {
      const response = await apiCall(`${this.endpoint}/${id}`, {
        method: 'GET',
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to get booking: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }
    } catch (error) {
      console.error('Error getting booking:', error)
      throw error
    }
  }

  async updateBooking(id: string, bookingData: Partial<BookingData>): Promise<BookingResponse> {
    try {
      const response = await apiCall(`${this.endpoint}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update booking: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  }

  async deleteBooking(id: string): Promise<boolean> {
    try {
      const response = await apiCall(`${this.endpoint}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete booking: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting booking:', error)
      throw error
    }
  }

  async listBookings(filters?: any): Promise<BookingResponse[]> {
    try {
      const queryParams = new URLSearchParams(filters).toString()
      const endpoint = queryParams ? `${this.endpoint}?${queryParams}` : this.endpoint
      
      const response = await apiCall(endpoint, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Failed to list bookings: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map((booking: any) => ({
        ...booking,
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt),
      }))
    } catch (error) {
      console.error('Error listing bookings:', error)
      throw error
    }
  }
}

export const bookingService = new BookingService()
export type { BookingData, BookingResponse }