import { TourOperation, Vehicle, Driver, Guide, VehicleDistribution } from '@/types/logistics'
import { apiCall, API_ENDPOINTS } from '@/config/api'

class LogisticsService {
  async getBasicData(): Promise<any> {
    try {
      const response = await apiCall(API_ENDPOINTS.LOGISTICS.BASIC, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching logistics basic data:', error)
      throw error
    }
  }

  async getTourOperations(date: Date): Promise<TourOperation[]> {
    try {
      const response = await apiCall(`${API_ENDPOINTS.LOGISTICS.SHIPMENTS}?date=${date.toISOString()}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.operations || []
    } catch (error) {
      console.error('Error fetching tour operations:', error)
      return []
    }
  }

  async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await apiCall(API_ENDPOINTS.LOGISTICS.CARRIERS, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.vehicles || []
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      return []
    }
  }

  async getDrivers(): Promise<Driver[]> {
    try {
      const response = await apiCall(`${API_ENDPOINTS.LOGISTICS.CARRIERS}/drivers`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.drivers || []
    } catch (error) {
      console.error('Error fetching drivers:', error)
      return []
    }
  }

  async getGuides(): Promise<Guide[]> {
    try {
      const response = await apiCall(`${API_ENDPOINTS.LOGISTICS.CARRIERS}/guides`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.guides || []
    } catch (error) {
      console.error('Error fetching guides:', error)
      return []
    }
  }

  async getVehicleDistribution(operationId: string): Promise<VehicleDistribution[]> {
    try {
      const response = await apiCall(`${API_ENDPOINTS.LOGISTICS.SHIPMENT(operationId)}/distribution`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.distributions || []
    } catch (error) {
      console.error('Error fetching vehicle distribution:', error)
      return []
    }
  }

  async getTourOperationById(operationId: string): Promise<TourOperation | null> {
    try {
      const response = await apiCall(API_ENDPOINTS.LOGISTICS.SHIPMENT(operationId), {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.operation || null
    } catch (error) {
      console.error('Error fetching tour operation:', error)
      return null
    }
  }

  async updateTourOperation(operationId: string, updates: Partial<TourOperation>): Promise<TourOperation | null> {
    try {
      const response = await apiCall(API_ENDPOINTS.LOGISTICS.SHIPMENT(operationId), {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.operation || null
    } catch (error) {
      console.error('Error updating tour operation:', error)
      throw error
    }
  }

  async assignVehicleToOperation(operationId: string, vehicleId: string): Promise<boolean> {
    try {
      const response = await apiCall(`${API_ENDPOINTS.LOGISTICS.SHIPMENT(operationId)}/assign-vehicle`, {
        method: 'POST',
        body: JSON.stringify({ vehicleId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error assigning vehicle:', error)
      throw error
    }
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
