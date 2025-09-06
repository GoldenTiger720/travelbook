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
  bookingNumber?: string
  status?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  customer?: {
    name?: string
    email?: string
    phone?: string
    company?: string
  }
  tourDetails?: {
    destination?: string
    tourType?: string
    startDate?: Date | string
    endDate?: Date | string
    passengers?: number
    passengerBreakdown?: {
      adults: number
      children: number
      infants: number
    }
  }
  pricing?: {
    amount?: number
    currency?: string
    breakdown?: Array<{
      item: string
      quantity: number
      unitPrice: number
      total: number
    }>
  }
  leadSource?: string
  assignedTo?: string
  agency?: string
  validUntil?: Date | string
  additionalNotes?: string
  termsAccepted?: {
    accepted: boolean
  }
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
      let endpoint = this.endpoint
      
      // Only add query parameters if filters exist and have valid properties
      if (filters && Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, String(value))
          }
        })
        const queryString = queryParams.toString()
        if (queryString) {
          endpoint = `${this.endpoint}?${queryString}`
        }
      }
      
      console.log('Making request to:', endpoint)
      
      const response = await apiCall(endpoint, {
        method: 'GET',
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to list bookings: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Received data:', data)
      
      // Handle both array and single object responses
      const bookings = Array.isArray(data) ? data : [data]
      
      return bookings.map((booking: any) => ({
        ...booking,
        createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
        updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : new Date(),
        tourDetails: booking.tourDetails ? {
          ...booking.tourDetails,
          startDate: booking.tourDetails.startDate ? new Date(booking.tourDetails.startDate) : new Date(),
          endDate: booking.tourDetails.endDate ? new Date(booking.tourDetails.endDate) : new Date(),
        } : undefined,
        validUntil: booking.validUntil ? new Date(booking.validUntil) : new Date(),
      }))
    } catch (error) {
      console.error('Error listing bookings:', error)
      throw error
    }
  }
}

export const bookingService = new BookingService()
export type { BookingData, BookingResponse }