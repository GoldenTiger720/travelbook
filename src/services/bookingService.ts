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
  shareableLink?: string
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
  customer: {
    id?: string
    name: string
    email: string
    phone?: string
    language?: string
    country?: string
    idNumber?: string
    cpf?: string
    address?: string
    company?: string
    location?: string
    status?: string
    totalBookings?: number
    totalSpent?: number
    lastBooking?: string
    notes?: string
    avatar?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }
  tours: Array<{
    id: string
    tourId: string
    tourName: string
    tourCode: string
    date: Date | string
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
    createdAt?: Date | string
    updatedAt?: Date | string
  }>
  tourDetails: {
    destination: string
    tourType: string
    startDate: Date | string
    endDate: Date | string
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
  validUntil: Date | string
  additionalNotes?: string
  hasMultipleAddresses?: boolean
  termsAccepted: {
    accepted: boolean
    acceptedBy?: string
    acceptedAt?: Date | string
  }
  quotationComments?: string
  includePayment?: boolean
  copyComments?: boolean
  sendPurchaseOrder?: boolean
  sendQuotationAccess?: boolean
  shareableLink?: string
  paymentDetails?: {
    date?: Date | string
    method?: string
    percentage?: number
    amountPaid?: number
    comments?: string
    status?: string
    receiptFile?: File | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }
  createdBy?: {
    id: string
    email: string
    fullName: string
    phone?: string
    company?: string
  }
  createdAt: Date | string
  updatedAt: Date | string
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
          shareableLink: bookingData.shareableLink,
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

  // Public method for shared quotes - tries multiple endpoints
  async getSharedBooking(shareId: string): Promise<BookingResponse | null> {
    try {
      // Try the regular booking endpoint first
      const response = await apiCall(`${this.endpoint}/${shareId}`, {
        method: 'GET',
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Try alternative public endpoint
          try {
            const publicResponse = await apiCall(`/api/public/booking/${shareId}`, {
              method: 'GET',
            })

            if (!publicResponse.ok) {
              return null
            }

            const publicData = await publicResponse.json()
            return {
              ...publicData,
              createdAt: new Date(publicData.createdAt),
              updatedAt: new Date(publicData.updatedAt),
            }
          } catch (publicError) {
            console.error('Error fetching booking from public endpoint:', publicError)
            return null
          }
        }
        throw new Error(`Failed to get shared booking: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }
    } catch (error) {
      console.error('Error getting shared booking:', error)
      return null
    }
  }

  async updateBooking(id: string, bookingData: Partial<BookingData>): Promise<BookingResponse> {
    try {
      // Format the data to match the backend expectations
      const formattedData = {
        ...bookingData,
        tourDetails: bookingData.tourDetails ? {
          ...bookingData.tourDetails,
          startDate: bookingData.tourDetails.startDate instanceof Date
            ? bookingData.tourDetails.startDate.toISOString()
            : bookingData.tourDetails.startDate,
          endDate: bookingData.tourDetails.endDate instanceof Date
            ? bookingData.tourDetails.endDate.toISOString()
            : bookingData.tourDetails.endDate,
        } : undefined,
        validUntil: bookingData.validUntil instanceof Date
          ? bookingData.validUntil.toISOString()
          : bookingData.validUntil,
        paymentDetails: bookingData.paymentDetails ? {
          ...bookingData.paymentDetails,
          date: bookingData.paymentDetails.date instanceof Date
            ? bookingData.paymentDetails.date.toISOString()
            : bookingData.paymentDetails.date,
        } : undefined,
      }

      const response = await apiCall(`${this.endpoint}/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(formattedData),
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

  async createBookingPayment(paymentData: {
    bookingId?: string
    quotationId?: string
    customer: {
      name: string
      email: string
      phone?: string
    }
    tours?: any[]
    tourDetails?: any
    pricing?: any
    paymentDetails: {
      date?: Date
      method?: string
      percentage?: number
      amountPaid?: number
      comments?: string
      status?: string
      receiptFile?: File | null
    }
    bookingOptions: {
      includePayment: boolean
      copyComments: boolean
      sendPurchaseOrder: boolean
      quotationComments?: string
      sendQuotationAccess?: boolean
    }
  }): Promise<{
    success: boolean
    message: string
    data: {
      bookingId: string
      reservationId: string
      purchaseOrderId?: string
      paymentId?: string
      status: 'confirmed'
    }
  }> {
    try {
      const response = await apiCall('/api/booking/payment/', {
        method: 'POST',
        body: JSON.stringify({
          ...paymentData,
          paymentDetails: {
            ...paymentData.paymentDetails,
            date: paymentData.paymentDetails.date?.toISOString(),
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create booking payment: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating booking payment:', error)
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

      const response = await apiCall(endpoint, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Failed to list bookings: ${response.statusText}`)
      }

      const response_data = await response.json()
      
      // Handle the actual API response structure: { success, message, data, statistics, count, timestamp }
      let bookings = []
      
      if (response_data.success && response_data.data) {
        bookings = Array.isArray(response_data.data) ? response_data.data : [response_data.data]
      } else if (Array.isArray(response_data)) {
        // Fallback for direct array response
        bookings = response_data
      }
      
      return bookings.map((booking: any) => ({
        ...booking,
        createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
        updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : new Date(),
        tours: booking.tours ? booking.tours.map((tour: any) => ({
          ...tour,
          date: tour.date ? new Date(tour.date) : new Date(),
          createdAt: tour.createdAt ? new Date(tour.createdAt) : new Date(),
          updatedAt: tour.updatedAt ? new Date(tour.updatedAt) : new Date(),
        })) : [],
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