import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/config/api'
import type { Vehicle, CreateVehicleData, UpdateVehicleData } from '@/types/vehicle'

// Query keys
export const VEHICLE_QUERY_KEYS = {
  all: ['vehicles'] as const,
  lists: () => [...VEHICLE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: any) => [...VEHICLE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...VEHICLE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...VEHICLE_QUERY_KEYS.details(), id] as const,
}

// API functions
const fetchVehicles = async (): Promise<Vehicle[]> => {
  console.log('🚗 Fetching vehicles from API')
  const response = await apiCall('/api/settings/vehicle/', {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.results || data
}

const createVehicle = async (vehicleData: CreateVehicleData): Promise<Vehicle> => {
  const response = await apiCall('/api/settings/vehicle/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehicleData),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

const updateVehicle = async (vehicleData: UpdateVehicleData): Promise<Vehicle> => {
  const { id, ...updateData } = vehicleData

  const response = await apiCall(`/api/settings/vehicle/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

const deleteVehicle = async (id: string): Promise<void> => {
  const response = await apiCall(`/api/settings/vehicle/${id}/`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// React Query hooks
export const useVehicles = () => {
  console.log('🔄 useVehicles hook called')
  return useQuery({
    queryKey: VEHICLE_QUERY_KEYS.lists(),
    queryFn: fetchVehicles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Don't throw errors, let the component handle them gracefully
    throwOnError: false,
    // Return empty array on error to prevent UI breaking
    select: (data) => data || [],
  })
}

export const useCreateVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      // Invalidate and refetch vehicles list
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.lists(),
      })
    },
    onError: (error) => {
      console.error('Error creating vehicle:', error)
    },
  })
}

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: (data) => {
      // Update the vehicle in the cache
      queryClient.setQueryData(
        VEHICLE_QUERY_KEYS.detail(data.id),
        data
      )
      // Invalidate vehicles list
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.lists(),
      })
    },
    onError: (error) => {
      console.error('Error updating vehicle:', error)
    },
  })
}

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      // Invalidate and refetch vehicles list
      queryClient.invalidateQueries({
        queryKey: VEHICLE_QUERY_KEYS.lists(),
      })
    },
    onError: (error) => {
      console.error('Error deleting vehicle:', error)
    },
  })
}