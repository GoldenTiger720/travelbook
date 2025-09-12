import { Reservation, ReservationFilters } from '@/types/reservation'
import { addDays, subDays, startOfMonth, endOfMonth } from 'date-fns'

// Generate mock reservations
const generateMockReservations = (): Reservation[] => {
  const reservations: Reservation[] = []
  const today = new Date()
  
  const statuses: Reservation['status'][] = ['confirmed', 'pending', 'cancelled', 'completed', 'no-show']
  const paymentStatuses: Reservation['paymentStatus'][] = ['paid', 'pending', 'partial', 'refunded', 'overdue']
  
  const salespersons = ['Thiago Andrade', 'Maria Silva', 'Juan Rodriguez', 'Ana Martinez']
  const operators = ['Direct Operations', 'Partner Tours Chile', 'Andes Adventures', 'Patagonia Expeditions', 'Wine Valley Tours']
  const guides = ['Carlos Mendez', 'Sofia Lopez', 'Diego Torres', 'Laura Garcia', '']
  const drivers = ['Pedro Sanchez', 'Miguel Rodriguez', 'Roberto Silva', 'Fernando Costa', '']
  const agencies = ['Travel Plus', 'World Tours', 'Adventure Agency', 'Sunset Travel', '']
  
  const tours = [
    { id: '1', name: 'Santiago City Tour', code: 'SCL-CT01', destination: 'Santiago' },
    { id: '2', name: 'Casablanca Valley Wine Tour', code: 'VAL-WT01', destination: 'Valparaíso' },
    { id: '3', name: 'Circuito Chico', code: 'BAR-CC01', destination: 'Bariloche' },
    { id: '4', name: 'La Cueva del Viejo Volcán', code: 'BAR-LC01', destination: 'Bariloche' },
    { id: '5', name: 'Atacama Full Day Tour', code: 'ATR-FD01', destination: 'Atacama Desert' },
    { id: '6', name: 'Moai Discovery Tour', code: 'EIS-MD01', destination: 'Easter Island' },
    { id: '7', name: 'Torres del Paine Day Trip', code: 'PAT-TDP01', destination: 'Patagonia' },
    { id: '8', name: 'Seven Lakes Route', code: 'BAR-7L01', destination: 'Bariloche' }
  ]
  
  const clients = [
    { name: 'John Smith', email: 'john@example.com', phone: '+1234567890', country: 'USA', idNumber: 'P123456789' },
    { name: 'Maria Garcia', email: 'maria@example.com', phone: '+5491234567', country: 'Argentina', idNumber: 'DNI12345678' },
    { name: 'Pierre Dubois', email: 'pierre@example.com', phone: '+33123456789', country: 'France', idNumber: 'FR987654321' },
    { name: 'Liu Wei', email: 'liu@example.com', phone: '+861234567890', country: 'China', idNumber: 'CN456789123' },
    { name: 'Ana Silva', email: 'ana@example.com', phone: '+5511987654321', country: 'Brazil', idNumber: 'CPF12345678900' },
    { name: 'Hans Mueller', email: 'hans@example.com', phone: '+491234567890', country: 'Germany', idNumber: 'DE321654987' },
    { name: 'Yuki Tanaka', email: 'yuki@example.com', phone: '+811234567890', country: 'Japan', idNumber: 'JP789456123' },
    { name: 'Sophie Anderson', email: 'sophie@example.com', phone: '+61234567890', country: 'Australia', idNumber: 'AU654321789' },
    { name: 'Carlos Rodriguez', email: 'carlos@example.com', phone: '+56912345678', country: 'Chile', idNumber: 'RUT12345678-9' },
    { name: 'Emma Johnson', email: 'emma@example.com', phone: '+44123456789', country: 'UK', idNumber: 'UK987321654' }
  ]
  
  const hotels = [
    'Hotel Santiago Centro', 'Icon Hotel', 'Llao Llao Hotel', 'Desert Camp', 'Easter Island Lodge',
    'Patagonia Base', 'Wine Valley Resort', 'Mountain View Hotel', 'City Plaza Hotel', 'Beach Resort'
  ]
  
  // Generate 150 reservations
  for (let i = 0; i < 150; i++) {
    const operationDate = addDays(today, Math.floor(Math.random() * 60) - 30) // -30 to +30 days
    const saleDate = subDays(operationDate, Math.floor(Math.random() * 30) + 1) // 1-30 days before operation
    const tour = tours[Math.floor(Math.random() * tours.length)]
    const client = clients[Math.floor(Math.random() * clients.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]
    
    const adults = Math.floor(Math.random() * 4) + 1
    const children = Math.floor(Math.random() * 3)
    const infants = Math.floor(Math.random() * 2)
    
    const currencies = ['CLP', 'USD', 'EUR', 'BRL', 'ARS']
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    
    let adultPrice, childPrice, infantPrice
    switch(currency) {
      case 'USD':
        adultPrice = 50 + Math.floor(Math.random() * 150)
        childPrice = 25 + Math.floor(Math.random() * 75)
        infantPrice = 0
        break
      case 'EUR':
        adultPrice = 45 + Math.floor(Math.random() * 135)
        childPrice = 22 + Math.floor(Math.random() * 68)
        infantPrice = 0
        break
      case 'BRL':
        adultPrice = 250 + Math.floor(Math.random() * 750)
        childPrice = 125 + Math.floor(Math.random() * 375)
        infantPrice = 0
        break
      case 'ARS':
        adultPrice = 15000 + Math.floor(Math.random() * 45000)
        childPrice = 7500 + Math.floor(Math.random() * 22500)
        infantPrice = 0
        break
      default: // CLP
        adultPrice = 25000 + Math.floor(Math.random() * 75000)
        childPrice = 12500 + Math.floor(Math.random() * 37500)
        infantPrice = 0
    }
    
    const totalAmount = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice)
    
    const operator = operators[Math.floor(Math.random() * operators.length)]
    const guide = guides[Math.floor(Math.random() * guides.length)]
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const agency = agencies[Math.floor(Math.random() * agencies.length)]
    
    reservations.push({
      id: `RES${String(i + 1).padStart(6, '0')}`,
      reservationNumber: `R${new Date().getFullYear()}${String(i + 1).padStart(5, '0')}`,
      operationDate,
      saleDate,
      status,
      paymentStatus,
      client,
      tour: {
        ...tour,
        date: operationDate,
        pickupTime: `${6 + Math.floor(Math.random() * 10)}:${Math.random() > 0.5 ? '00' : '30'}`,
        pickupAddress: hotels[Math.floor(Math.random() * hotels.length)]
      },
      passengers: {
        adults,
        children,
        infants
      },
      pricing: {
        adultPrice,
        childPrice,
        infantPrice,
        totalAmount,
        currency
      },
      salesperson: salespersons[Math.floor(Math.random() * salespersons.length)],
      operator,
      guide: guide || undefined,
      driver: driver || undefined,
      externalAgency: agency || undefined,
      purchaseOrderNumber: Math.random() > 0.3 ? `PO${String(i + 1).padStart(6, '0')}` : undefined,
      notes: Math.random() > 0.7 ? 'Special dietary requirements' : undefined,
      createdAt: saleDate,
      updatedAt: saleDate
    })
  }
  
  return reservations
}

class ReservationService {
  private reservations: Reservation[] = generateMockReservations()
  private apiUrl = '/api/reservations'
  
  async getAllReservations(): Promise<Reservation[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      // Fallback to mock data if API call fails
      return this.reservations
    }
  }
  
  async getFilteredReservations(filters: ReservationFilters): Promise<Reservation[]> {
    let filtered = [...this.reservations]
    
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
    const salespersons = new Set<string>()
    const operators = new Set<string>()
    const guides = new Set<string>()
    const drivers = new Set<string>()
    const agencies = new Set<string>()
    const tours = new Map<string, string>()
    
    this.reservations.forEach(r => {
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
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      return await response.json()
    } catch (error) {
      console.warn('API not available for single reservation, using mock data:', error)
      // Fallback to mock data
      return this.reservations.find(r => r.id === id) || null
    }
  }

  async createReservation(reservationData: any): Promise<Reservation> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      return await response.json()
    } catch (error) {
      console.warn('API not available for creating reservation:', error)
      throw error
    }
  }

  async updateReservation(id: string, updates: any): Promise<Reservation> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      return await response.json()
    } catch (error) {
      console.warn('API not available for updating reservation:', error)
      throw error
    }
  }

  async deleteReservation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.warn('API not available for deleting reservation:', error)
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