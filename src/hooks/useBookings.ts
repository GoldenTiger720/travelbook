import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService, BookingData, BookingResponse } from '@/services/bookingService'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters?: any) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
}

// Fetch bookings list
export function useBookings(filters?: any) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => bookingService.listBookings(filters),
  })
}

// Fetch single booking
export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingService.getBooking(id),
    enabled: !!id,
  })
}

// Create booking mutation
export function useCreateBooking() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: BookingData) => bookingService.createBooking(data),
    onSuccess: (newBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      toast({
        title: 'Booking Created',
        description: `Booking ${newBooking.bookingNumber} created successfully`,
      })
      // Navigate back to quotes list after successful creation
      navigate('/my-quotes')
    },
    onError: (error) => {
      console.error('Error creating booking:', error)
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      })
    },
  })
}

// Update booking mutation
export function useUpdateBooking() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookingData> }) =>
      bookingService.updateBooking(id, data),
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(updatedBooking.id) })
      toast({
        title: 'Success',
        description: 'Booking updated successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update booking',
        variant: 'destructive',
      })
    },
  })
}

// Delete booking mutation
export function useDeleteBooking() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => bookingService.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive',
      })
    },
  })
}

// Convert quote to booking mutation
export function useConvertQuoteToBooking() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: BookingData) => bookingService.createBooking(data),
    onSuccess: (newBooking) => {
      // Invalidate both quotes and bookings
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      
      toast({
        title: 'Booking Created',
        description: `Quote has been converted to booking ${newBooking.bookingNumber}`,
      })
    },
    onError: (error) => {
      console.error('Error converting to booking:', error)
      toast({
        title: 'Error',
        description: 'Failed to convert quote to booking',
        variant: 'destructive',
      })
    },
  })
}