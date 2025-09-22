import { API_ENDPOINTS, apiCall } from '@/config/api';

// Types
export interface CreateCustomerData {
  name: string;
  id_number: string;
  email: string;
  phone: string;
  language: string;
  country: string;
  cpf: string;
  address: string;
}

export interface Customer {
  id: string;
  created_by: string;
  name: string;
  email: string;
  phone: string;
  language: string;
  country: string;
  id_number: string;
  cpf: string;
  address: string;
  company: string;
  location: string;
  status: 'active' | 'inactive' | 'vip';
  total_bookings: number;
  total_spent: string;
  last_booking: string | null;
  notes: string;
  avatar: string;
  created_at: string;
  updated_at: string;
  bookings: any[];
  reservations: any[];
}

export interface CustomerResponse {
  customer: Customer;
  message?: string;
}

export interface CustomerError {
  message?: string;
  errors?: {
    name?: string[];
    id_number?: string[];
    email?: string[];
    phone?: string[];
    language?: string[];
    country?: string[];
    cpf?: string[];
    address?: string[];
    [key: string]: string[] | undefined;
  };
}

export interface CustomerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

// Customer Service
class CustomerService {
  // Parse error response
  private parseErrorResponse(response: any): CustomerError {
    // Check if response has field-specific errors
    if (response && typeof response === 'object') {
      // If it's already in the correct format (field: string[])
      const hasFieldErrors = Object.keys(response).some(key =>
        Array.isArray(response[key])
      );

      if (hasFieldErrors) {
        return { errors: response };
      }

      // If it has an errors field
      if (response.errors) {
        return { errors: response.errors, message: response.message };
      }

      // If it only has a message
      if (response.message) {
        return { message: response.message };
      }
    }

    return { message: 'An unexpected error occurred' };
  }

  // Create new customer
  async createCustomer(data: CreateCustomerData): Promise<CustomerResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.CUSTOMERS.CREATE, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Check if response was successful (2xx status)
      if (response.ok) {
        return result;
      }

      // If not successful, throw error with proper structure
      throw this.parseErrorResponse(result);
    } catch (error: any) {
      // If error is from fetch/network
      if (error instanceof Error) {
        throw error;
      }
      // If error is already parsed
      if (error.errors || error.message) {
        throw error;
      }
      // Parse and throw
      throw this.parseErrorResponse(error);
    }
  }

  // Get customer list
  async getCustomers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }): Promise<CustomerListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.CUSTOMERS.LIST}?${queryParams.toString()}`
        : API_ENDPOINTS.CUSTOMERS.LIST;

      const response = await apiCall(endpoint, {
        method: 'GET',
      });

      const result = await response.json();

      if (response.ok) {
        return result;
      }

      throw this.parseErrorResponse(result);
    } catch (error: any) {
      console.error('Get customers error:', error);
      throw error;
    }
  }

  // Get single customer
  async getCustomer(id: string): Promise<Customer> {
    try {
      const response = await apiCall(API_ENDPOINTS.CUSTOMERS.GET(id), {
        method: 'GET',
      });

      const result = await response.json();

      if (response.ok) {
        return result;
      }

      throw this.parseErrorResponse(result);
    } catch (error: any) {
      console.error('Get customer error:', error);
      throw error;
    }
  }

  // Update customer
  async updateCustomer(id: string, data: Partial<CreateCustomerData>): Promise<CustomerResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.CUSTOMERS.UPDATE(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return result;
      }

      throw this.parseErrorResponse(result);
    } catch (error: any) {
      console.error('Update customer error:', error);
      throw error;
    }
  }

  // Delete customer
  async deleteCustomer(id: string): Promise<{ message: string }> {
    try {
      const response = await apiCall(API_ENDPOINTS.CUSTOMERS.DELETE(id), {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        return result;
      }

      throw this.parseErrorResponse(result);
    } catch (error: any) {
      console.error('Delete customer error:', error);
      throw error;
    }
  }

  // Search customers
  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const response = await apiCall(`${API_ENDPOINTS.CUSTOMERS.SEARCH}?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      });

      const result = await response.json();

      if (response.ok) {
        return result.customers || result;
      }

      throw this.parseErrorResponse(result);
    } catch (error: any) {
      console.error('Search customers error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new CustomerService();