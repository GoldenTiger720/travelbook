import { TourOperation, LogisticsReservation, Vehicle, Driver, Guide, VehicleDistribution } from '@/types/logistics'
import { addDays, subDays } from 'date-fns'

const generateMockReservations = (): LogisticsReservation[] => {
  const reservations: LogisticsReservation[] = []
  const hotels = [
    { name: 'Hotel Santiago Centro', address: 'Av. Libertador Bernardo O\'Higgins 136, Santiago' },
    { name: 'NH Collection Plaza Santiago', address: 'Av. Vitacura 3201, Las Condes' },
    { name: 'The Ritz-Carlton Santiago', address: 'El Alcalde 15, Las Condes' },
    { name: 'Hotel Providencia', address: 'Av. Providencia 1208, Providencia' },
    { name: 'InterContinental Santiago', address: 'Av. Vitacura 2885, Las Condes' },
    { name: 'W Santiago', address: 'Isidora Goyenechea 3000, Las Condes' },
    { name: 'Hotel Plaza San Francisco', address: 'Av. Libertador Bernardo O\'Higgins 816' },
    { name: 'Sheraton Santiago Hotel', address: 'Av. Santa María 1742, Providencia' }
  ]

  const clients = [
    { name: 'John Smith', email: 'john@example.com', phone: '+1-555-0101' },
    { name: 'Maria Garcia', email: 'maria@example.com', phone: '+54-11-1234-5678' },
    { name: 'Pierre Dubois', email: 'pierre@example.com', phone: '+33-1-23-45-67-89' },
    { name: 'Liu Wei', email: 'liu@example.com', phone: '+86-138-0013-8000' },
    { name: 'Ana Silva', email: 'ana@example.com', phone: '+55-11-99999-9999' },
    { name: 'Hans Mueller', email: 'hans@example.com', phone: '+49-30-12345678' },
    { name: 'Yuki Tanaka', email: 'yuki@example.com', phone: '+81-3-1234-5678' },
    { name: 'Sophie Anderson', email: 'sophie@example.com', phone: '+61-2-1234-5678' }
  ]

  for (let i = 0; i < 25; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)]
    const hotel = hotels[Math.floor(Math.random() * hotels.length)]
    const adults = Math.floor(Math.random() * 4) + 1
    const children = Math.floor(Math.random() * 3)
    const infants = Math.floor(Math.random() * 2)
    const pricePerPassenger = 50 + Math.floor(Math.random() * 150)
    const totalValue = pricePerPassenger * (adults + children * 0.7)
    const pendingPayment = Math.random() > 0.7 ? totalValue * 0.5 : 0

    reservations.push({
      id: `RES${String(i + 1).padStart(3, '0')}`,
      reservationNumber: `R2024${String(i + 1).padStart(5, '0')}`,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      hotelName: hotel.name,
      hotelAddress: hotel.address,
      pickupLocation: hotel.name,
      passengers: {
        adults,
        children,
        infants,
        total: adults + children + infants
      },
      pricePerPassenger,
      totalValue,
      pendingPayment,
      status: Math.random() > 0.1 ? 'confirmed' : 'pending',
      specialRequests: Math.random() > 0.7 ? 'Wheelchair accessible' : undefined
    })
  }

  return reservations
}

const generateMockTours = () => [
  { id: '1', name: 'Santiago City Tour', code: 'SCL-CT01' },
  { id: '2', name: 'Casablanca Valley Wine Tour', code: 'VAL-WT01' },
  { id: '3', name: 'Circuito Chico', code: 'BAR-CC01' },
  { id: '4', name: 'Atacama Full Day Tour', code: 'ATR-FD01' },
  { id: '5', name: 'Torres del Paine Day Trip', code: 'PAT-TDP01' }
]

const generateMockVehicles = (): Vehicle[] => [
  {
    id: 'VEH001',
    name: 'Mercedes-Benz Sprinter 1',
    type: 'van',
    capacity: 19,
    licensePlate: 'ABC-123',
    status: 'available',
    currentLocation: 'Terminal Central'
  },
  {
    id: 'VEH002',
    name: 'Toyota Hiace Premium',
    type: 'van',
    capacity: 12,
    licensePlate: 'DEF-456',
    status: 'available',
    currentLocation: 'Airport'
  },
  {
    id: 'VEH003',
    name: 'Volvo Bus 9700',
    type: 'bus',
    capacity: 45,
    licensePlate: 'GHI-789',
    status: 'available',
    currentLocation: 'Main Depot'
  },
  {
    id: 'VEH004',
    name: 'Mercedes-Benz Sprinter 2',
    type: 'van',
    capacity: 19,
    licensePlate: 'JKL-012',
    status: 'maintenance',
    currentLocation: 'Workshop'
  },
  {
    id: 'VEH005',
    name: 'Ford Transit Custom',
    type: 'van',
    capacity: 8,
    licensePlate: 'MNO-345',
    status: 'available',
    currentLocation: 'Las Condes'
  }
]

const generateMockDrivers = (): Driver[] => [
  {
    id: 'DRV001',
    name: 'Carlos Rodriguez',
    phone: '+56-9-8765-4321',
    licenseNumber: 'A1-12345678',
    status: 'available'
  },
  {
    id: 'DRV002',
    name: 'Miguel Santos',
    phone: '+56-9-7654-3210',
    licenseNumber: 'A1-87654321',
    status: 'available'
  },
  {
    id: 'DRV003',
    name: 'Pedro Gonzalez',
    phone: '+56-9-6543-2109',
    licenseNumber: 'A1-11223344',
    status: 'off-duty'
  },
  {
    id: 'DRV004',
    name: 'Juan Martinez',
    phone: '+56-9-5432-1098',
    licenseNumber: 'A1-99887766',
    status: 'available'
  }
]

const generateMockGuides = (): Guide[] => [
  {
    id: 'GID001',
    name: 'Isabella Fernandez',
    phone: '+56-9-1111-2222',
    languages: ['Spanish', 'English', 'Portuguese'],
    specialties: ['History', 'Wine Tours'],
    status: 'available'
  },
  {
    id: 'GID002',
    name: 'Roberto Silva',
    phone: '+56-9-3333-4444',
    languages: ['Spanish', 'English', 'French'],
    specialties: ['City Tours', 'Cultural Tours'],
    status: 'available'
  },
  {
    id: 'GID003',
    name: 'Carmen Lopez',
    phone: '+56-9-5555-6666',
    languages: ['Spanish', 'English', 'German'],
    specialties: ['Nature Tours', 'Adventure Tours'],
    status: 'assigned'
  },
  {
    id: 'GID004',
    name: 'Diego Morales',
    phone: '+56-9-7777-8888',
    languages: ['Spanish', 'English', 'Italian'],
    specialties: ['Wine Tours', 'Gastronomy'],
    status: 'available'
  }
]

class LogisticsService {
  private mockReservations = generateMockReservations()
  private mockTours = generateMockTours()
  private mockVehicles = generateMockVehicles()
  private mockDrivers = generateMockDrivers()
  private mockGuides = generateMockGuides()
  
  async getTourOperations(date: Date): Promise<TourOperation[]> {
    const operations: TourOperation[] = []
    
    // Generate 3-5 tour operations for the selected date
    const numOperations = Math.floor(Math.random() * 3) + 3
    
    for (let i = 0; i < numOperations; i++) {
      const tour = this.mockTours[i % this.mockTours.length]
      const reservationsForTour = this.mockReservations
        .filter((_, idx) => idx % numOperations === i)
        .slice(0, Math.floor(Math.random() * 8) + 3)
      
      const totalPassengers = reservationsForTour.reduce((sum, res) => sum + res.passengers.total, 0)
      
      operations.push({
        id: `OP${date.getTime()}${i}`,
        date,
        tourId: tour.id,
        tourName: tour.name,
        tourCode: tour.code,
        mainDriver: Math.random() > 0.5 ? this.mockDrivers[i % this.mockDrivers.length]?.name : undefined,
        mainGuide: Math.random() > 0.3 ? this.mockGuides[i % this.mockGuides.length]?.name : undefined,
        assistantGuide: Math.random() > 0.7 ? this.mockGuides[(i + 1) % this.mockGuides.length]?.name : undefined,
        departureTime: Math.random() > 0.4 ? `${8 + i * 2}:00` : undefined,
        expectedWaitingTime: 5 + Math.floor(Math.random() * 10), // 5-15 minutes
        vehicleId: Math.random() > 0.4 ? this.mockVehicles[i % this.mockVehicles.length]?.id : undefined,
        reservations: reservationsForTour,
        totalPassengers,
        status: Math.random() > 0.7 ? 'assigned' : 'planning'
      })
    }
    
    return operations
  }
  
  async getVehicles(): Promise<Vehicle[]> {
    return this.mockVehicles
  }
  
  async getDrivers(): Promise<Driver[]> {
    return this.mockDrivers
  }
  
  async getGuides(): Promise<Guide[]> {
    return this.mockGuides
  }
  
  async getVehicleDistribution(operationId: string): Promise<VehicleDistribution[]> {
    // Mock distribution logic - in real app this would be calculated based on operation
    const operation = await this.getTourOperationById(operationId)
    if (!operation) return []
    
    const distributions: VehicleDistribution[] = []
    let remainingPassengers = operation.totalPassengers
    let reservationIndex = 0
    
    for (const vehicle of this.mockVehicles.filter(v => v.status === 'available')) {
      if (remainingPassengers <= 0) break
      
      const assignedPassengers = Math.min(remainingPassengers, vehicle.capacity)
      const passengerList = operation.reservations
        .slice(reservationIndex, reservationIndex + Math.ceil(assignedPassengers / 2))
        .map(res => ({
          reservationNumber: res.reservationNumber,
          clientName: res.clientName,
          passengers: res.passengers.total,
          hotelName: res.hotelName,
          pickupLocation: res.pickupLocation,
          specialRequests: res.specialRequests
        }))
      
      distributions.push({
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        assignedPassengers,
        capacity: vehicle.capacity,
        passengerList
      })
      
      remainingPassengers -= assignedPassengers
      reservationIndex += passengerList.length
    }
    
    return distributions
  }
  
  async getTourOperationById(operationId: string): Promise<TourOperation | null> {
    // Mock implementation - in real app this would query the database
    const today = new Date()
    const operations = await this.getTourOperations(today)
    return operations.find(op => op.id === operationId) || null
  }
  
  async updateTourOperation(operationId: string, updates: Partial<TourOperation>): Promise<TourOperation | null> {
    // Mock implementation - in real app this would update the database
    console.log('Updating tour operation:', operationId, updates)
    return null
  }
  
  async assignVehicleToOperation(operationId: string, vehicleId: string): Promise<boolean> {
    // Mock implementation
    console.log('Assigning vehicle', vehicleId, 'to operation', operationId)
    return true
  }
  
  generateWhatsAppMessage(vehicleDistribution: VehicleDistribution): string {
    const message = `🚐 *${vehicleDistribution.vehicleName}* - Passenger List\n\n` +
      `👥 Total Passengers: ${vehicleDistribution.assignedPassengers}/${vehicleDistribution.capacity}\n\n` +
      vehicleDistribution.passengerList.map((passenger, index) => 
        `${index + 1}. *${passenger.clientName}* (${passenger.passengers} pax)\n` +
        `   📍 ${passenger.hotelName}\n` +
        `   🎫 ${passenger.reservationNumber}` +
        (passenger.specialRequests ? `\n   ℹ️ ${passenger.specialRequests}` : '') +
        '\n'
      ).join('\n') +
      `\n📱 Generated via Zenith Travel Ops`
    
    return encodeURIComponent(message)
  }
}

export const logisticsService = new LogisticsService()