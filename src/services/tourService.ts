import { API_ENDPOINTS, apiCall } from '@/config/api';

// Destination object structure
export interface TourDestination {
  id: string;
  name: string;
  country: string;
  region: string;
  language: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Backend tour data structure
export interface Tour {
  id: string;
  name: string;
  destination: TourDestination;
  description: string;
  adult_price: string;
  child_price: string;
  currency: string;
  starting_point: string;
  departure_time: string;
  capacity: number;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Tour list response from backend
export interface TourListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tour[];
}

// Types for tour creation (frontend form data)
export interface CreateTourData {
  name: string;
  destination: string;
  capacity: number;
  departureTime: string;
  adultPrice: number;
  childPrice: number;
  startingPoint: string;
  description: string;
  currency: string;
  active: boolean;
}

export interface TourResponse {
  tour: Tour;
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
  async getTours(): Promise<Tour[]> {
    try {
      const response = await apiCall(API_ENDPOINTS.TOURS.LIST, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tours');
      }

      const data: TourListResponse = await response.json();
      return data.results || [];
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