import { Reservation, ReservationFilters } from '@/types/reservation'
import { apiCall, API_ENDPOINTS } from '@/config/api'

class ReservationService {
  private mapBackendDataToReservation(backendReservation: any): Reservation {
    // Get the first tour from the tours array for now
    const firstTour = backendReservation.tours[0]
    
    return {
      id: backendReservation.id,
      reservationNumber: backendReservation.id.split('-')[0].toUpperCase(), // Generate reservation number from id
      operationDate: new Date(firstTour.date),
      saleDate: new Date(backendReservation.createdAt),
      status: backendReservation.status,
      paymentStatus: this.determinePaymentStatus(backendReservation.allPayments, backendReservation.pricing.amount),
      client: {
        name: backendReservation.customer.name,
        email: backendReservation.customer.email,
        phone: backendReservation.customer.phone,
        country: backendReservation.customer.country,
        idNumber: backendReservation.customer.idNumber || ''
      },
      tour: {
        id: firstTour.tourId,
        name: firstTour.tourName,
        code: firstTour.tourCode,
        destination: backendReservation.tourDetails.destination,
        date: new Date(firstTour.date),
        pickupTime: firstTour.pickupTime,
        pickupAddress: firstTour.pickupAddress
      },
      passengers: {
        adults: firstTour.adultPax,
        children: firstTour.childPax,
        infants: firstTour.infantPax
      },
      pricing: {
        adultPrice: firstTour.adultPrice,
        childPrice: firstTour.childPrice,
        infantPrice: firstTour.infantPrice,
        totalAmount: backendReservation.pricing.amount,
        currency: backendReservation.pricing.currency
      },
      salesperson: backendReservation.createdBy.fullName || backendReservation.assignedTo,
      operator: firstTour.operator !== 'own-operation' ? firstTour.operator : undefined,
      guide: undefined, // Not present in backend data
      driver: undefined, // Not present in backend data
      externalAgency: backendReservation.agency,
      purchaseOrderNumber: undefined, // Not present in backend data
      notes: backendReservation.additionalNotes || firstTour.comments,
      createdAt: new Date(backendReservation.createdAt),
      updatedAt: new Date(backendReservation.updatedAt)
    }
  }

  private determinePaymentStatus(payments: any[], totalAmount: number): Reservation['paymentStatus'] {
    if (!payments || payments.length === 0) {
      return 'pending'
    }
    
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    
    if (totalPaid >= totalAmount) {
      return 'paid'
    } else if (totalPaid > 0) {
      return 'partial'
    } else {
      return 'pending'
    }
  }

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const response = await apiCall(API_ENDPOINTS.RESERVATIONS.LIST, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Store the raw data for filter options
      if (data.success && data.data) {
        // Store users and tours data in sessionStorage for filter options
        sessionStorage.setItem('reservationFilterData', JSON.stringify({
          users: data.data.users || [],
          tours: data.data.tours || []
        }))
      }

      // For now, return empty array as we don't have reservation data in this endpoint
      // This endpoint only provides users and tours for filters
      return []
    } catch (error) {
      console.error('Error fetching reservations from backend:', error)
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
          salespersons: [],
          guides: [],
          drivers: [],
          agencies: []
        }
      }

      const filterData = JSON.parse(filterDataString)
      const users = filterData.users || []
      const tours = filterData.tours || []

      return {
        users,
        tours,
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
      if (data.success && data.data) {
        return this.mapBackendDataToReservation(data.data)
      }
      
      return data ? this.mapBackendDataToReservation(data) : null
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
}

export const reservationService = new ReservationService()