import { API_ENDPOINTS, apiCall } from '@/config/api';

// Types for destination management
export interface CreateDestinationData {
  name: string;
  country: string;
  region: string;
  language: string;
  status: 'active' | 'inactive';
}

export interface UpdateDestinationData extends Partial<CreateDestinationData> {}

export interface Destination {
  id: string | number;
  name: string;
  country: string;
  region: string;
  cities: string[];
  toursCount: number;
  status: 'active' | 'inactive';
  description: string;
  coordinates: string;
  timezone: string;
  language: string;
}

export interface DestinationResponse {
  destination: Destination;
  message?: string;
}

export interface DestinationError {
  message?: string;
  errors?: {
    name?: string[];
    country?: string[];
    region?: string[];
    language?: string[];
    timezone?: string[];
    coordinates?: string[];
    cities?: string[];
    description?: string[];
  };
}

class DestinationService {
  // Get all destinations
  async getDestinations(): Promise<Destination[]> {
    try {
      const response = await apiCall(API_ENDPOINTS.SETTINGS.DESTINATIONS.LIST, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch destinations');
      }

      const data = await response.json();
      return data.destinations || data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  }

  // Create a new destination
  async createDestination(data: CreateDestinationData): Promise<DestinationResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.SETTINGS.DESTINATIONS.CREATE, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: DestinationError = await response.json();
        throw new Error(errorData.message || 'Failed to create destination');
      }

      const result: DestinationResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating destination:', error);
      throw error;
    }
  }

  // Update a destination
  async updateDestination(id: string, data: UpdateDestinationData): Promise<DestinationResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.SETTINGS.DESTINATIONS.UPDATE(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: DestinationError = await response.json();
        throw new Error(errorData.message || 'Failed to update destination');
      }

      const result: DestinationResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating destination:', error);
      throw error;
    }
  }

  // Delete a destination
  async deleteDestination(id: string): Promise<void> {
    try {
      const response = await apiCall(API_ENDPOINTS.SETTINGS.DESTINATIONS.DELETE(id), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete destination');
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
      throw error;
    }
  }

  // Get a single destination by ID
  async getDestination(id: string): Promise<Destination> {
    try {
      const response = await apiCall(API_ENDPOINTS.SETTINGS.DESTINATIONS.GET(id), {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch destination');
      }

      const data = await response.json();
      return data.destination || data;
    } catch (error) {
      console.error('Error fetching destination:', error);
      throw error;
    }
  }
}

export const destinationService = new DestinationService();