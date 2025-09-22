import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import customerService, { CreateCustomerData, Customer } from '@/services/customerService'
import { toast } from 'sonner'

// Query keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: any) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  search: (query: string) => [...customerKeys.all, 'search', query] as const,
}

// Fetch customers with optional filters
export function useCustomers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.getCustomers(params),
  })
}

// Fetch single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  })
}

// Search customers
export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: () => customerService.searchCustomers(query),
    enabled: !!query.trim(),
  })
}

// Create customer mutation
export function useCreateCustomer(onFieldErrors?: (errors: Record<string, string[]>) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCustomerData) => customerService.createCustomer(data),
    onSuccess: (response) => {
      // Invalidate and refetch customer lists
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })

      // Debug: Log the actual response structure
      console.log('Customer creation response:', response)

      // Handle different possible response structures
      const customerName = response?.customer?.name || response?.name || 'Customer'
      toast.success('Customer created successfully', {
        description: `${customerName} has been added to your customer directory.`
      })
    },
    onError: (error: any) => {
      console.error('Create customer error:', error)

      // Handle field-specific errors
      if (error.errors && onFieldErrors) {
        onFieldErrors(error.errors)
        toast.error('Please fix the errors in the form')
        return
      }

      // Handle general errors
      const errorMessage = error.message || 'Failed to create customer'
      toast.error('Error creating customer', {
        description: errorMessage
      })
    },
  })
}

// Update customer mutation
export function useUpdateCustomer(onFieldErrors?: (errors: Record<string, string[]>) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerData> }) =>
      customerService.updateCustomer(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate and refetch customer lists and specific customer
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })

      // Handle different possible response structures
      const customerName = response?.customer?.name || response?.name || 'Customer'
      toast.success('Customer updated successfully', {
        description: `${customerName} has been updated.`
      })
    },
    onError: (error: any) => {
      console.error('Update customer error:', error)

      // Handle field-specific errors
      if (error.errors && onFieldErrors) {
        onFieldErrors(error.errors)
        toast.error('Please fix the errors in the form')
        return
      }

      // Handle general errors
      const errorMessage = error.message || 'Failed to update customer'
      toast.error('Error updating customer', {
        description: errorMessage
      })
    },
  })
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: (response) => {
      // Invalidate and refetch customer lists
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })

      toast.success('Customer deleted successfully', {
        description: response.message || 'Customer has been removed from your directory.'
      })
    },
    onError: (error: any) => {
      console.error('Delete customer error:', error)

      const errorMessage = error.message || 'Failed to delete customer'
      toast.error('Error deleting customer', {
        description: errorMessage
      })
    },
  })
}