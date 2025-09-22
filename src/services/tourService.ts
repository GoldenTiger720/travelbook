import { API_ENDPOINTS, apiCall } from '@/config/api';

// Types for tour creation
export interface CreateTourData {
  name: string;
  destination: string;
  capacity: number;
  departureTime: string;
  adultPrice: number;
  childPrice: number;
  startingPoint: string;
  description: string;
  active: boolean;
}

export interface TourResponse {
  tour: any;
  message?: string;
}

export interface TourError {
  message?: string;
  errors?: {
    name?: string[];
    destination?: string[];
    capacity?: string[];
    departureTime?: string[];
    adultPrice?: string[];
    childPrice?: string[];
    startingPoint?: string[];
    description?: string[];
  };
}

class TourService {
  // Create a new tour
  async createTour(data: CreateTourData): Promise<TourResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.TOURS.CREATE, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: TourError = await response.json();
        throw new Error(errorData.message || 'Failed to create tour');
      }

      const result: TourResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating tour:', error);
      throw error;
    }
  }

  // Get all tours
  async getTours(): Promise<any[]> {
    try {
      const response = await apiCall(API_ENDPOINTS.TOURS.LIST, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tours');
      }

      const data = await response.json();
      return data.tours || data;
    } catch (error) {
      console.error('Error fetching tours:', error);
      throw error;
    }
  }

  // Update a tour
  async updateTour(id: string, data: Partial<CreateTourData>): Promise<TourResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.TOURS.UPDATE(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: TourError = await response.json();
        throw new Error(errorData.message || 'Failed to update tour');
      }

      const result: TourResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating tour:', error);
      throw error;
    }
  }

  // Delete a tour
  async deleteTour(id: string): Promise<void> {
    try {
      const response = await apiCall(API_ENDPOINTS.TOURS.DELETE(id), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tour');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      throw error;
    }
  }
}

export const tourService = new TourService();