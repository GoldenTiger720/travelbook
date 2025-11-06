import { apiCall, API_ENDPOINTS } from '@/config/api'

export interface TourOperator {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  commission_rate: number
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TourOperatorFormData {
  name: string
  contact_person?: string
  email?: string
  phone?: string
  website?: string
  commission_rate?: number
}

class TourOperatorService {
  async getOperators(isActiveOnly: boolean = false): Promise<TourOperator[]> {
    try {
      const url = isActiveOnly
        ? '/api/tours/operators/?is_active=true'
        : '/api/tours/operators/'

      const response = await apiCall(url, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching tour operators:', error)
      throw error
    }
  }

  async createOperator(operatorData: TourOperatorFormData): Promise<TourOperator> {
    try {
      const response = await apiCall('/api/tours/operators/', {
        method: 'POST',
        body: JSON.stringify(operatorData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error creating tour operator:', error)
      throw error
    }
  }

  async updateOperator(id: string, operatorData: Partial<TourOperatorFormData>): Promise<TourOperator> {
    try {
      const response = await apiCall(`/api/tours/operators/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(operatorData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error updating tour operator:', error)
      throw error
    }
  }

  async deleteOperator(id: string): Promise<void> {
    try {
      const response = await apiCall(`/api/tours/operators/${id}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting tour operator:', error)
      throw error
    }
  }

  async toggleOperatorStatus(id: string, isActive: boolean): Promise<TourOperator> {
    return this.updateOperator(id, { is_active: isActive })
  }
}

export const tourOperatorService = new TourOperatorService()