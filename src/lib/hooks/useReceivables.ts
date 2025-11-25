import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { apiCall, API_ENDPOINTS } from '@/config/api'
import type { Receivable } from '@/types/financial'
import type { RecipeFormData } from '@/components/FinancialPage/AddRecipeDialog'
import Swal from 'sweetalert2'

// Query keys for receivables
export const receivablesKeys = {
  all: ['receivables'] as const,
  list: (startDate: string, endDate: string) => [...receivablesKeys.all, 'list', startDate, endDate] as const,
}

// Fetch receivables
const fetchReceivables = async (startDate: Date, endDate: Date): Promise<Receivable[]> => {
  const params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
  const response = await apiCall(API_ENDPOINTS.FINANCIAL.RECEIVABLES + params)
  if (!response.ok) {
    throw new Error('Failed to fetch receivables')
  }
  return response.json()
}

// Create recipe API call
interface CreateRecipeParams {
  recipeData: RecipeFormData
  bookings: Array<{ id: string; customer: { name: string } }>
}

const createRecipe = async ({ recipeData }: CreateRecipeParams): Promise<void> => {
  const installmentAmount = recipeData.amount / recipeData.installment

  for (let i = 0; i < recipeData.installment; i++) {
    const installmentDueDate = new Date(recipeData.dueDate)
    installmentDueDate.setMonth(installmentDueDate.getMonth() + i)

    const bookingPaymentData = {
      date: recipeData.paymentDate,
      due_date: format(installmentDueDate, 'yyyy-MM-dd'),
      method: recipeData.method,
      installment: i + 1,
      total_installments: recipeData.installment,
      amount_paid: installmentAmount,
      status: recipeData.status,
      description: recipeData.description || '',
      notes: recipeData.notes || '',
      copy_comments: true,
      include_payment: true,
      quote_comments: '',
      send_purchase_order: false,
      send_quotation_access: false
    }

    const response = await apiCall(`/api/bookings/${recipeData.bookingId}/payments/`, {
      method: 'POST',
      body: JSON.stringify(bookingPaymentData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || errorData.error || 'Failed to create recipe')
    }
  }
}

// Hook to fetch receivables
export function useReceivables(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: receivablesKeys.list(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
    queryFn: () => fetchReceivables(startDate, endDate),
  })
}

// Hook to create recipe with optimistic update
export function useCreateRecipe(
  startDate: Date,
  endDate: Date,
  bookings: Array<{ id: string; customer: { name: string; email?: string }; totalAmount?: number; currency?: string }>
) {
  const queryClient = useQueryClient()
  const queryKey = receivablesKeys.list(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))

  return useMutation({
    mutationFn: (recipeData: RecipeFormData) => createRecipe({ recipeData, bookings }),

    // Optimistic update - immediately add to the table
    onMutate: async (recipeData: RecipeFormData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const previousReceivables = queryClient.getQueryData<Receivable[]>(queryKey)

      // Find the booking to get customer name
      const booking = bookings.find(b => b.id === recipeData.bookingId)
      const customerName = booking?.customer?.name || 'Unknown Customer'

      // Create optimistic receivable entries for each installment
      const installmentAmount = recipeData.amount / recipeData.installment
      const optimisticReceivables: Receivable[] = []

      for (let i = 0; i < recipeData.installment; i++) {
        const installmentDueDate = new Date(recipeData.dueDate)
        installmentDueDate.setMonth(installmentDueDate.getMonth() + i)

        optimisticReceivables.push({
          id: Date.now() + i, // Temporary ID
          bookingId: recipeData.bookingId,
          customerName,
          amount: installmentAmount,
          currency: recipeData.currency,
          dueDate: format(installmentDueDate, 'yyyy-MM-dd'),
          status: recipeData.status,
          method: recipeData.method,
          percentage: 100 / recipeData.installment,
        })
      }

      // Optimistically update the cache
      queryClient.setQueryData<Receivable[]>(queryKey, (old) => {
        return old ? [...optimisticReceivables, ...old] : optimisticReceivables
      })

      // Return context with the snapshot
      return { previousReceivables }
    },

    // On success, show SweetAlert and refetch to get real data
    onSuccess: (_data, recipeData) => {
      // Show success SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Recipe Created!',
        text: recipeData.installment > 1
          ? `${recipeData.installment} installments have been created successfully.`
          : 'Your recipe has been created successfully.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      })

      // Invalidate to refetch with real data from server
      queryClient.invalidateQueries({ queryKey })
    },

    // On error, rollback to previous state and show error
    onError: (error: Error, _recipeData, context) => {
      // Rollback to previous state
      if (context?.previousReceivables) {
        queryClient.setQueryData(queryKey, context.previousReceivables)
      }

      // Show error SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create recipe. Please try again.',
        confirmButtonColor: '#3085d6',
      })
    },
  })
}
