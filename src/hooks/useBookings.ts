import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService, BookingData, BookingResponse } from '@/services/bookingService'
import { useToast } from '@/components/ui/use-toast'

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
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    retry: (failureCount, error) => {
      return failureCount < 3
    },
  })
}

// Fetch single booking from cached list data
export function useBooking(id: string) {
  const { data: bookings = [], isLoading: listLoading, error: listError } = useBookings()

  // Find the booking in the cached list data
  const booking = bookings.find(booking => booking.id === id)

  return {
    data: booking || null,
    isLoading: listLoading,
    error: listError
  }
}

// Fetch shared booking (public access)
export function useSharedBooking(shareId: string) {
  return useQuery({
    queryKey: ['sharedBooking', shareId],
    queryFn: () => bookingService.getSharedBooking(shareId),
    enabled: !!shareId,
    retry: (failureCount, error) => {
      return failureCount < 2 // Only retry once for shared bookings
    },
  })
}

// Create booking mutation
export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BookingData) => bookingService.createBooking(data),
    onSuccess: (newBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      // Success handling is done in the component
    },
    onError: (error) => {
      console.error('Error creating booking:', error)
      // Error handling is done in the component to show custom messages
    },
  })
}

// Update booking mutation
export function useUpdateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookingData> }) =>
      bookingService.updateBooking(id, data),
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(updatedBooking.id) })
      // Success handling is done in the component
    },
    onError: (error) => {
      console.error('Error updating booking:', error)
      // Error handling is done in the component to show custom messages
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

// Create booking payment mutation (converts quotation to confirmed reservation)
export function useCreateBookingPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentData: {
      bookingId?: string
      quotationId?: string
      customer: {
        name: string
        email: string
        phone?: string
      }
      tours?: any[]
      tourDetails?: any
      pricing?: any
      paymentDetails: {
        date?: Date
        method?: string
        percentage?: number
        amountPaid?: number
        comments?: string
        status?: string
        receiptFile?: File | null
      }
      bookingOptions: {
        includePayment: boolean
        copyComments: boolean
        sendPurchaseOrder: boolean
        quotationComments?: string
        sendQuotationAccess?: boolean
      }
    }) => bookingService.createBookingPayment(paymentData),
    onSuccess: () => {
      // Invalidate bookings cache to refresh All Reservations
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      // Note: Success handling is done in component for better UX control
    },
    onError: (error) => {
      console.error('Error converting quotation to booking:', error)
      // Note: Error handling is done in component for better UX control
    },
  })
}

// Update booking payment mutation (updates existing booking payment with PUT request)
export function useUpdateBookingPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, paymentData }: {
      bookingId: string
      paymentData: {
        customer: {
          name: string
          email: string
          phone?: string
        }
        tours?: any[]
        tourDetails?: any
        pricing?: any
        paymentDetails: {
          date?: Date
          method?: string
          percentage?: number
          amountPaid?: number
          comments?: string
          status?: string
          receiptFile?: File | null
        }
        bookingOptions: {
          includePayment: boolean
          copyComments: boolean
          sendPurchaseOrder: boolean
          quotationComments?: string
          sendQuotationAccess?: boolean
        }
      }
    }) => bookingService.updateBookingPayment(bookingId, paymentData),
    onSuccess: () => {
      // Invalidate bookings cache to refresh All Reservations
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      // Note: Success handling is done in component for better UX control
    },
    onError: (error) => {
      console.error('Error updating booking payment:', error)
      // Note: Error handling is done in component for better UX control
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
        description: `Quote has been converted to booking ${newBooking.id}`,
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