import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { apiCall, API_ENDPOINTS } from '@/config/api'
import type { Expense, ExpenseFormData } from '@/types/financial'
import { useToast } from '@/components/ui/use-toast'

// Query keys for expenses
export const expensesKeys = {
  all: ['expenses'] as const,
  list: (startDate: string, endDate: string) => [...expensesKeys.all, 'list', startDate, endDate] as const,
  payables: (startDate: string, endDate: string) => ['payables', startDate, endDate] as const,
}

// Fetch expenses
const fetchExpenses = async (startDate: Date, endDate: Date): Promise<Expense[]> => {
  const params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
  const response = await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSES + params)
  if (!response.ok) {
    throw new Error('Failed to fetch expenses')
  }
  const data = await response.json()
  // Ensure amounts are numbers
  return (Array.isArray(data) ? data : []).map((expense: Expense) => ({
    ...expense,
    amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
  }))
}

// Fetch payables (expenses + commissions)
const fetchPayables = async (startDate: Date, endDate: Date) => {
  const params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
  const response = await apiCall(API_ENDPOINTS.FINANCIAL.PAYABLES + params)
  if (!response.ok) {
    throw new Error('Failed to fetch payables')
  }
  return response.json()
}

// Create expense API call
const createExpense = async (expenseData: ExpenseFormData): Promise<Expense> => {
  const hasAttachment = expenseData.attachment instanceof File

  let requestOptions: RequestInit

  if (hasAttachment) {
    const formData = new FormData()
    if (expenseData.person_id) formData.append('person', expenseData.person_id)
    formData.append('expense_type', expenseData.expense_type)
    formData.append('category', expenseData.category)
    formData.append('amount', String(expenseData.amount))
    formData.append('currency', expenseData.currency)
    formData.append('due_date', expenseData.due_date)
    if (expenseData.payment_date) formData.append('payment_date', expenseData.payment_date)
    if (expenseData.recurrence) formData.append('recurrence', expenseData.recurrence)
    if (expenseData.description) formData.append('description', expenseData.description)
    if (expenseData.notes) formData.append('notes', expenseData.notes)
    if (expenseData.payment_account) formData.append('payment_account', expenseData.payment_account)
    formData.append('attachment', expenseData.attachment)

    requestOptions = {
      method: 'POST',
      body: formData
    }
  } else {
    const backendData = {
      person: expenseData.person_id || null,
      expense_type: expenseData.expense_type,
      category: expenseData.category,
      amount: expenseData.amount,
      currency: expenseData.currency,
      due_date: expenseData.due_date,
      payment_date: expenseData.payment_date || null,
      recurrence: expenseData.recurrence || 'once',
      description: expenseData.description || null,
      notes: expenseData.notes || null,
      payment_account: expenseData.payment_account || null,
    }

    requestOptions = {
      method: 'POST',
      body: JSON.stringify(backendData)
    }
  }

  const response = await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSES, requestOptions)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || errorData.error || 'Failed to create expense')
  }
  return response.json()
}

// Update expense API call
const updateExpense = async ({ id, data }: { id: string; data: ExpenseFormData }): Promise<Expense> => {
  const hasAttachment = data.attachment instanceof File

  let requestOptions: RequestInit

  if (hasAttachment) {
    const formData = new FormData()
    if (data.person_id) formData.append('person', data.person_id)
    formData.append('expense_type', data.expense_type)
    formData.append('category', data.category)
    formData.append('amount', String(data.amount))
    formData.append('currency', data.currency)
    formData.append('due_date', data.due_date)
    if (data.payment_date) formData.append('payment_date', data.payment_date)
    if (data.recurrence) formData.append('recurrence', data.recurrence)
    if (data.description) formData.append('description', data.description)
    if (data.notes) formData.append('notes', data.notes)
    if (data.payment_account) formData.append('payment_account', data.payment_account)
    formData.append('attachment', data.attachment)

    requestOptions = {
      method: 'PUT',
      body: formData
    }
  } else {
    const backendData = {
      person: data.person_id || null,
      expense_type: data.expense_type,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      due_date: data.due_date,
      payment_date: data.payment_date || null,
      recurrence: data.recurrence || 'once',
      description: data.description || null,
      notes: data.notes || null,
      payment_account: data.payment_account || null,
    }

    requestOptions = {
      method: 'PUT',
      body: JSON.stringify(backendData)
    }
  }

  const response = await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSE(id), requestOptions)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || errorData.error || 'Failed to update expense')
  }
  return response.json()
}

// Delete expense API call
const deleteExpense = async (id: string): Promise<void> => {
  const response = await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSE(id), {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Failed to delete expense')
  }
}

// Hook to fetch expenses
export function useExpenses(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: expensesKeys.list(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
    queryFn: () => fetchExpenses(startDate, endDate),
  })
}

// Hook to fetch payables
export function usePayables(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: expensesKeys.payables(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
    queryFn: () => fetchPayables(startDate, endDate),
  })
}

// Hook to create expense with optimistic update
export function useCreateExpense(startDate: Date, endDate: Date) {
  const queryClient = useQueryClient()
  const expensesQueryKey = expensesKeys.list(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
  const payablesQueryKey = expensesKeys.payables(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))

  return useMutation({
    mutationFn: createExpense,

    // Optimistic update
    onMutate: async (expenseData: ExpenseFormData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: expensesQueryKey })

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData<Expense[]>(expensesQueryKey)

      // Create optimistic expense entry
      const optimisticExpense: Expense = {
        id: `temp-${Date.now()}`,
        person_id: expenseData.person_id,
        person_name: '',
        expense_type: expenseData.expense_type,
        category: expenseData.category,
        description: expenseData.description,
        amount: expenseData.amount,
        currency: expenseData.currency,
        due_date: expenseData.due_date,
        payment_date: expenseData.payment_date,
        payment_account_id: expenseData.payment_account,
        recurrence: expenseData.recurrence || 'once',
        notes: expenseData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_overdue: false,
        payment_status: expenseData.payment_date ? 'paid' : 'pending',
      }

      // Optimistically update the cache
      queryClient.setQueryData<Expense[]>(expensesQueryKey, (old) => {
        return old ? [optimisticExpense, ...old] : [optimisticExpense]
      })

      return { previousExpenses }
    },

    // On success, invalidate queries to refetch with real data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey })
      queryClient.invalidateQueries({ queryKey: payablesQueryKey })
      queryClient.invalidateQueries({ queryKey: ['financial', 'dashboard'] })
    },

    // On error, rollback to previous state
    onError: (_error, _expenseData, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(expensesQueryKey, context.previousExpenses)
      }
    },
  })
}

// Hook to update expense
export function useUpdateExpense(startDate: Date, endDate: Date) {
  const queryClient = useQueryClient()
  const expensesQueryKey = expensesKeys.list(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
  const payablesQueryKey = expensesKeys.payables(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))

  return useMutation({
    mutationFn: updateExpense,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey })
      queryClient.invalidateQueries({ queryKey: payablesQueryKey })
      queryClient.invalidateQueries({ queryKey: ['financial', 'dashboard'] })
    },
  })
}

// Hook to delete expense
export function useDeleteExpense(startDate: Date, endDate: Date) {
  const queryClient = useQueryClient()
  const expensesQueryKey = expensesKeys.list(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
  const payablesQueryKey = expensesKeys.payables(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))

  return useMutation({
    mutationFn: deleteExpense,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey })
      queryClient.invalidateQueries({ queryKey: payablesQueryKey })
      queryClient.invalidateQueries({ queryKey: ['financial', 'dashboard'] })
    },
  })
}
