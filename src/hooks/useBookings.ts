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
      console.log('useBookings retry attempt:', failureCount, error)
      return failureCount < 3
    },
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

// Create booking payment mutation
export function useCreateBookingPayment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (paymentData: {
      bookingId?: string
      customer: {
        name: string
        email: string
        phone?: string
      }
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      toast({
        title: 'Payment Processed',
        description: 'Booking payment details have been successfully processed',
      })
    },
    onError: (error) => {
      console.error('Error creating booking payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to process booking payment',
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