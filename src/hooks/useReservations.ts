import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservationService } from '@/services/reservationService'
import { ReservationFilters } from '@/types/reservation'
import { useToast } from '@/components/ui/use-toast'

// Query keys
export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (filters?: ReservationFilters) => [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
  uniqueValues: () => [...reservationKeys.all, 'uniqueValues'] as const,
}

// Fetch all reservations
export function useReservations() {
  return useQuery({
    queryKey: reservationKeys.lists(),
    queryFn: () => reservationService.getAllReservations(),
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    retry: (failureCount, error) => {
      return failureCount < 3
    },
  })
}

// Fetch filtered reservations
export function useFilteredReservations(filters: ReservationFilters) {
  return useQuery({
    queryKey: reservationKeys.list(filters),
    queryFn: () => reservationService.getFilteredReservations(filters),
    enabled: !!filters,
    staleTime: 0,
  })
}

// Fetch unique values for filters
export function useReservationUniqueValues() {
  return useQuery({
    queryKey: reservationKeys.uniqueValues(),
    queryFn: () => reservationService.getUniqueValues(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch single reservation
export function useReservation(id: string) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationService.getReservationById(id),
    enabled: !!id,
  })
}

// Create reservation mutation
export function useCreateReservation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: any) => reservationService.createReservation(data),
    onSuccess: (newReservation) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })
      toast({
        title: 'Reservation Created',
        description: `Reservation ${newReservation.reservationNumber} created successfully`,
      })
    },
    onError: (error) => {
      console.error('Error creating reservation:', error)
      toast({
        title: 'Error',
        description: 'Failed to create reservation',
        variant: 'destructive',
      })
    },
  })
}

// Update reservation mutation
export function useUpdateReservation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      reservationService.updateReservation(id, data),
    onSuccess: (updatedReservation) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(updatedReservation.id) })
      toast({
        title: 'Success',
        description: 'Reservation updated successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update reservation',
        variant: 'destructive',
      })
    },
  })
}

// Delete reservation mutation
export function useDeleteReservation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => reservationService.deleteReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })
      toast({
        title: 'Success',
        description: 'Reservation deleted successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete reservation',
        variant: 'destructive',
      })
    },
  })
}