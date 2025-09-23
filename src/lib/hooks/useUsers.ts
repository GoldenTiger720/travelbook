import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiCall } from '@/config/api'
import { queryKeys } from '@/lib/react-query'

// User interfaces based on actual API response
export interface User {
  id: string  // UUID format
  email: string
  full_name: string
  phone: string | null
  // Optional fields for backward compatibility and future use
  role?: string
  commission?: number
  status?: string
  login?: string
  supervisor?: string
  agency?: string
  lastLogin?: string
  avatar?: string | null
}

// API Response structure
export interface UsersApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}

export interface CreateUserData {
  full_name: string  // Updated to match API
  email: string
  phone?: string     // Made optional since it can be null
  // Optional fields that may not be supported by API yet
  role?: string
  commission?: number
  status?: string
}

export interface UpdateUserData {
  full_name: string  // Updated to match API
  email: string
  phone?: string     // Made optional since it can be null
  password?: string
  // Optional fields that may not be supported by API yet
  role?: string
  commission?: number
  status?: string
}

// Fetch users
const fetchUsers = async (): Promise<UsersApiResponse> => {
  const response = await apiCall('/api/users/', {
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Create user
const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await apiCall('/api/users/', {
    method: 'POST',
    body: JSON.stringify(userData)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Update user
const updateUser = async ({ id, ...userData }: UpdateUserData & { id: string }): Promise<User> => {
  const response = await apiCall(`/api/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Delete user
const deleteUser = async (id: string): Promise<void> => {
  const response = await apiCall(`/api/users/${id}/`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// Custom hooks
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: fetchUsers,
    select: (data) => data.results, // Extract just the users array for easier consumption
  })
}

// Hook to get full paginated response (for future pagination features)
export const useUsersPaginated = () => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: fetchUsers,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      toast.success('User created successfully!')
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error)
      toast.error('Failed to create user. Please try again.')
    }
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      toast.success('User updated successfully!')
    },
    onError: (error: Error) => {
      console.error('Error updating user:', error)
      toast.error('Failed to update user. Please try again.')
    }
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      toast.success('User deleted successfully!')
    },
    onError: (error: Error) => {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user. Please try again.')
    }
  })
}