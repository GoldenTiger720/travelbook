import { Reservation, ReservationFilters } from '@/types/reservation'
import { apiCall, API_ENDPOINTS } from '@/config/api'

class ReservationService {
  /**
   * Maps backend reservation data to frontend format.
   * Returns an array of Reservation objects - one for each tour in the backend reservation.
   * This allows each tour to appear separately in the UI for better filtering and analysis.
   */
  private mapBackendDataToReservations(backendReservation: any): Reservation[] {
    const tours = backendReservation.tours || []

    if (tours.length === 0) {
      throw new Error('No tour data found in reservation')
    }

    // Debug: Log the backend reservation data to verify email and phone are present
    console.log('Backend reservation data:', {
      id: backendReservation.id,
      fullName: backendReservation.fullName,
      email: backendReservation.email,
      phone: backendReservation.phone
    })

    // Determine payment status from paymentDetails
    let paymentStatus: Reservation['paymentStatus'] = 'pending'
    if (backendReservation.paymentDetails) {
      paymentStatus = backendReservation.paymentDetails.status || 'pending'
    }

    // Create a separate reservation object for each tour
    return tours.map((tour: any, index: number) => {
      // Calculate tour-specific total amount based on actual pricing and passengers
      const tourSpecificAmount = (
        (tour.adultPax || 0) * (tour.adultPrice || 0) +
        (tour.childPax || 0) * (tour.childPrice || 0) +
        (tour.infantPax || 0) * (tour.infantPrice || 0)
      )

      return {
        id: tours.length > 1 ? `${backendReservation.id}-tour-${index}` : backendReservation.id,
        bookingId: backendReservation.id, // Always store the original booking ID
        reservationNumber: backendReservation.id.split('-')[0].toUpperCase(), // Generate reservation number from id
        operationDate: new Date(tour.date),
        saleDate: new Date(backendReservation.paymentDetails?.date || backendReservation.createdAt || new Date()),
        status: backendReservation.status,
        paymentStatus: paymentStatus,
        client: {
          id: backendReservation.customer.id,
          name: backendReservation.customer.name,
          email: backendReservation.customer.email,
          phone: backendReservation.customer.phone,
          country: backendReservation.customer.country,
          idNumber: backendReservation.customer.idNumber || '',
          language: backendReservation.customer.language || '',
          cpf: backendReservation.customer.cpf || '',
          address: backendReservation.customer.address || '',
          hotel: backendReservation.customer.hotel || '',
          room: backendReservation.customer.room || '',
          comments: backendReservation.customer.comments || ''
        },
        tour: {
          id: tour.tourId || '',
          name: tour.tourName || '',
          code: tour.tourCode || '',
          destination: tour.destinationName || '',
          date: new Date(tour.date),
          pickupTime: tour.pickupTime || '',
          pickupAddress: tour.pickupAddress || ''
        },
        tourId: tour.id || '', // Backend BookingTour ID for API calls
        tourStatus: tour.tour_status || 'pending',
        passengers: {
          adults: tour.adultPax || 0,
          children: tour.childPax || 0,
          infants: tour.infantPax || 0
        },
        pricing: {
          adultPrice: tour.adultPrice || 0,
          childPrice: tour.childPrice || 0,
          infantPrice: tour.infantPrice || 0,
          totalAmount: tourSpecificAmount,
          currency: backendReservation.currency || 'CLP'
        },
        salespersonId: backendReservation.sales_person_id || undefined, // Store ID for API calls
        salesperson: backendReservation.fullName || 'Unknown', // Store name for display
        email: backendReservation.email || '',
        phone: backendReservation.phone || '',
        operator: tour.operatorName || (tour.operator !== 'own-operation' ? tour.operator : undefined),
        guide: tour.mainGuideId || undefined, // Store ID for API calls
        guideName: tour.mainGuideName || undefined, // Store name for display
        driver: tour.mainDriverId || undefined, // Store ID for API calls
        driverName: tour.mainDriverName || undefined, // Store name for display
        externalAgency: undefined, // Not present in backend data
        purchaseOrderNumber: undefined, // Not present in backend data
        notes: tour.comments || '',
        paymentDetails: backendReservation.paymentDetails || undefined, // Legacy single payment
        payments: backendReservation.allPayments || undefined, // All payments array
        acceptTerm: backendReservation.acceptTerm || false, // Whether customer accepted terms
        acceptTermDetails: backendReservation.acceptTermDetails || undefined, // Details of acceptance
        createdAt: new Date(backendReservation.createdAt || new Date()),
        updatedAt: new Date(backendReservation.updatedAt || new Date())
      }
    }).map((reservation, index) => {
      // Debug: Log the mapped reservation to verify email and phone are included
      return reservation
    })
  }

  async getAllReservations(): Promise<Reservation[]> {
    try {
      // First fetch basic data (users and tours for filters)
      const basicResponse = await apiCall(API_ENDPOINTS.RESERVATIONS.LIST, {
        method: 'GET',
      })

      if (!basicResponse.ok) {
        throw new Error(`HTTP error! status: ${basicResponse.status}`)
      }

      const basicData = await basicResponse.json()

      // Store the raw data for filter options
      if (basicData.success && basicData.data) {
        // Store users, tours, and tour operators data in sessionStorage for filter options
        sessionStorage.setItem('reservationFilterData', JSON.stringify({
          users: basicData.data.users || [],
          tours: basicData.data.tours || [],
          tourOperators: basicData.data.tourOperators || []
        }))
      }

      // Now fetch confirmed reservations
      return await this.getConfirmedReservations()
    } catch (error) {
      console.error('Error fetching reservations from backend:', error)
      throw error
    }
  }

  async getConfirmedReservations(): Promise<Reservation[]> {
    try {
      const response = await apiCall(API_ENDPOINTS.RESERVATIONS.CONFIRMED, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Map backend confirmed reservations to frontend format
      // Each backend reservation may have multiple tours, so flatten the array
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data.flatMap((reservation: any) => this.mapBackendDataToReservations(reservation))
      }

      return []
    } catch (error) {
      console.error('Error fetching confirmed reservations from backend:', error)
      throw error
    }
  }

  /**
   * Get all reservations for calendar view (regardless of status)
   * @returns Promise<Reservation[]> All reservations from all statuses
   */
  async getAllReservationsForCalendar(): Promise<Reservation[]> {
    try {
      const response = await apiCall(API_ENDPOINTS.RESERVATIONS.ALL, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Map backend all reservations to frontend format
      // Each backend reservation may have multiple tours, so flatten the array
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data.flatMap((reservation: any) => this.mapBackendDataToReservations(reservation))
      }

      return []
    } catch (error) {
      console.error('Error fetching all reservations for calendar from backend:', error)
      throw error
    }
  }

  getFilterOptions() {
    try {
      const filterDataString = sessionStorage.getItem('reservationFilterData')
      if (!filterDataString) {
        return {
          users: [],
          tours: [],
          tourOperators: [],
          salespersons: [],
          guides: [],
          drivers: [],
          agencies: []
        }
      }

      const filterData = JSON.parse(filterDataString)
      const users = filterData.users || []
      const tours = filterData.tours || []
      const tourOperators = filterData.tourOperators || []

      return {
        users,
        tours,
        tourOperators,
        salespersons: users.filter((u: any) => u.role === 'salesperson'),
        guides: users.filter((u: any) => u.role === 'guide' || u.role === 'assistant_guide'),
        drivers: users.filter((u: any) => u.role === 'driver'),
        agencies: users.filter((u: any) => u.role === 'agency')
      }
    } catch (error) {
      console.error('Error getting filter options:', error)
      return {
        users: [],
        tours: [],
        tourOperators: [],
        salespersons: [],
        guides: [],
        drivers: [],
        agencies: []
      }
    }
  }
  
  async getFilteredReservations(filters: ReservationFilters): Promise<Reservation[]> {
    // Get all reservations from backend first
    const allReservations = await this.getAllReservations()
    let filtered = [...allReservations]
    
    // Date range filter
    if (filters.startDate && filters.endDate) {
      const dateField = filters.dateType === 'operation' ? 'operationDate' : 'saleDate'
      filtered = filtered.filter(r => {
        const date = r[dateField]
        return date >= filters.startDate! && date <= filters.endDate!
      })
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status)
    }
    
    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      filtered = filtered.filter(r => r.paymentStatus === filters.paymentStatus)
    }
    
    // Salesperson filter
    if (filters.salesperson && filters.salesperson !== 'all') {
      filtered = filtered.filter(r => r.salesperson === filters.salesperson)
    }
    
    // Tour filter
    if (filters.tour && filters.tour !== 'all') {
      filtered = filtered.filter(r => r.tour.id === filters.tour)
    }
    
    // Guide filter
    if (filters.guide && filters.guide !== 'all') {
      filtered = filtered.filter(r => r.guide === filters.guide)
    }
    
    // Driver filter
    if (filters.driver && filters.driver !== 'all') {
      filtered = filtered.filter(r => r.driver === filters.driver)
    }
    
    // Operator filter
    if (filters.operator && filters.operator !== 'all') {
      filtered = filtered.filter(r => r.operator === filters.operator)
    }
    
    // External agency filter
    if (filters.externalAgency && filters.externalAgency !== 'all') {
      filtered = filtered.filter(r => r.externalAgency === filters.externalAgency)
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        r.reservationNumber.toLowerCase().includes(search) ||
        r.client.name.toLowerCase().includes(search) ||
        r.client.email.toLowerCase().includes(search) ||
        r.tour.name.toLowerCase().includes(search) ||
        r.purchaseOrderNumber?.toLowerCase().includes(search)
      )
    }
    
    // Sort by operation date descending
    filtered.sort((a, b) => b.operationDate.getTime() - a.operationDate.getTime())
    
    return filtered
  }
  
  async getUniqueValues() {
    // Get all reservations from backend first
    const allReservations = await this.getAllReservations()
    
    const salespersons = new Set<string>()
    const operators = new Set<string>()
    const guides = new Set<string>()
    const drivers = new Set<string>()
    const agencies = new Set<string>()
    const tours = new Map<string, string>()
    
    allReservations.forEach(r => {
      salespersons.add(r.salesperson)
      if (r.operator) operators.add(r.operator)
      if (r.guide) guides.add(r.guide)
      if (r.driver) drivers.add(r.driver)
      if (r.externalAgency) agencies.add(r.externalAgency)
      tours.set(r.tour.id, r.tour.name)
    })
    
    return {
      salespersons: Array.from(salespersons).sort(),
      operators: Array.from(operators).sort(),
      guides: Array.from(guides).sort(),
      drivers: Array.from(drivers).sort(),
      agencies: Array.from(agencies).sort(),
      tours: Array.from(tours.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
    }
  }
  
  async getReservationById(id: string): Promise<Reservation | null> {
    try {
      const response = await apiCall(API_ENDPOINTS.RESERVATIONS.GET(id), {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Map the backend data structure to frontend format
      // Returns the first tour if multiple tours exist
      if (data.success && data.data) {
        const reservations = this.mapBackendDataToReservations(data.data)
        return reservations.length > 0 ? reservations[0] : null
      }

      const reservations = data ? this.mapBackendDataToReservations(data) : []
      return reservations.length > 0 ? reservations[0] : null
    } catch (error) {
      console.error('Error fetching reservation from backend:', error)
      throw error
    }
  }

  async createReservation(reservationData: any): Promise<Reservation> {
    try {
      const response = await apiCall(API_ENDPOINTS.RESERVATIONS.CREATE, {
        method: 'POST',
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  async updateReservation(id: string, updates: any): Promise<Reservation> {
    try {
      const response = await apiCall(API_ENDPOINTS.RESERVATIONS.UPDATE(id), {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating reservation:', error)
      throw error
    }
  }

  async deleteReservation(id: string): Promise<boolean> {
    try {
      const response = await apiCall(API_ENDPOINTS.RESERVATIONS.DELETE(id), {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting reservation:', error)
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
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`
  }

  /**
   * Cancel a booking tour with cancellation details
   * @param tourId - The ID of the tour to cancel
   * @param cancellationData - Cancellation reason, fee, and observation
   */
  async cancelBookingTour(tourId: string, cancellationData: {
    reason: string
    fee: number
    observation: string
  }): Promise<any> {
    try {
      const response = await apiCall(`/api/reservations/booking-tour/${tourId}/cancel/`, {
        method: 'POST',
        body: JSON.stringify(cancellationData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error cancelling booking tour:', error)
      throw error
    }
  }

  /**
   * Check in a booking tour
   * @param tourId - The ID of the tour to check in
   */
  async checkinBookingTour(tourId: string): Promise<any> {
    try {
      const response = await apiCall(`/api/reservations/booking-tour/${tourId}/checkin/`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error checking in booking tour:', error)
      throw error
    }
  }

  /**
   * Mark a booking tour as no-show
   * @param tourId - The ID of the tour to mark as no-show
   */
  async noshowBookingTour(tourId: string): Promise<any> {
    try {
      const response = await apiCall(`/api/reservations/booking-tour/${tourId}/noshow/`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error marking booking tour as no-show:', error)
      throw error
    }
  }
}

export const reservationService = new ReservationService()