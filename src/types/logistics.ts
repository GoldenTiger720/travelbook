export interface LogisticsReservation {
  id: string
  reservationNumber: string
  operationDate: Date
  pickupTime?: string
  clientName: string
  clientEmail: string
  clientPhone: string
  product: string
  operator?: string
  hotelName: string
  hotelAddress: string
  pickupLocation: string
  passengers: {
    adults: number
    children: number
    infants: number
    total: number
  }
  pricePerPassenger: number
  totalValue: number
  pendingPayment: number
  status: 'confirmed' | 'pending' | 'cancelled'
  specialRequests?: string
  salesperson?: string
  assignedDriver?: string
  assignedGuide?: string
}

export interface TourOperation {
  id: string
  date: Date
  tourId: string
  tourName: string
  tourCode: string
  operator?: string // 'own-operation' or external operator name
  mainDriver?: string
  mainGuide?: string
  assistantGuide?: string
  departureTime?: string
  expectedWaitingTime: number // minutes
  vehicleId?: string
  reservations: LogisticsReservation[]
  totalPassengers: number
  status: 'planning' | 'assigned' | 'in-progress' | 'completed'
}

export interface Vehicle {
  id: string
  name: string
  type: 'bus' | 'van' | 'car'
  capacity: number
  licensePlate: string
  status: 'available' | 'assigned' | 'in-service' | 'maintenance'
  currentLocation?: string
  assignedTourId?: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  licenseNumber: string
  status: 'available' | 'assigned' | 'off-duty'
  currentTourId?: string
}

export interface Guide {
  id: string
  name: string
  phone: string
  languages: string[]
  specialties: string[]
  status: 'available' | 'assigned' | 'off-duty'
  currentTourId?: string
}

export interface PassengerListItem {
  reservationNumber: string
  clientName: string
  passengers: number
  hotelName: string
  pickupLocation: string
  specialRequests?: string
}

export interface VehicleDistribution {
  vehicleId: string
  vehicleName: string
  assignedPassengers: number
  capacity: number
  passengerList: PassengerListItem[]
}