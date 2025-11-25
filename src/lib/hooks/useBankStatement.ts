import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { apiCall, API_ENDPOINTS } from '@/config/api'
import type {
  BankTransfer,
  BankTransferFormData,
  BankStatement,
} from '@/types/financial'

// Query keys factory
export const bankStatementKeys = {
  all: ['bankStatement'] as const,
  statement: (startDate: string, endDate: string, accountId?: string) =>
    [...bankStatementKeys.all, 'statement', startDate, endDate, accountId] as const,
  transfers: {
    all: ['transfers'] as const,
    list: (startDate: string, endDate: string, accountId?: string) =>
      [...bankStatementKeys.transfers.all, 'list', startDate, endDate, accountId] as const,
    detail: (id: string) => [...bankStatementKeys.transfers.all, 'detail', id] as const,
  },
}

// Fetch bank statement data
const fetchBankStatement = async (
  startDate: Date,
  endDate: Date,
  accountId?: string
): Promise<BankStatement> => {
  let params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
  if (accountId) {
    params += `&account=${accountId}`
  }
  const response = await apiCall(API_ENDPOINTS.FINANCIAL.BANK_STATEMENT + params)
  if (!response.ok) {
    throw new Error('Failed to fetch bank statement')
  }
  return response.json()
}

// Fetch bank transfers
const fetchTransfers = async (
  startDate: Date,
  endDate: Date,
  accountId?: string
): Promise<BankTransfer[]> => {
  let params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
  if (accountId) {
    params += `&account=${accountId}`
  }
  const response = await apiCall(API_ENDPOINTS.FINANCIAL.TRANSFERS + params)
  if (!response.ok) {
    throw new Error('Failed to fetch transfers')
  }
  return response.json()
}

// Create a new bank transfer
const createTransfer = async (data: BankTransferFormData): Promise<BankTransfer> => {
  // Handle file upload if receipt is present
  let body: FormData | string
  let headers: HeadersInit = {}

  if (data.receipt) {
    const formData = new FormData()
    formData.append('source_account', data.source_account)
    formData.append('source_currency', data.source_currency)
    formData.append('source_amount', data.source_amount.toString())
    formData.append('destination_account', data.destination_account)
    formData.append('destination_currency', data.destination_currency)
    formData.append('destination_amount', data.destination_amount.toString())
    formData.append('exchange_rate', data.exchange_rate.toString())
    formData.append('transfer_date', data.transfer_date)
    if (data.description) formData.append('description', data.description)
    if (data.reference_number) formData.append('reference_number', data.reference_number)
    if (data.status) formData.append('status', data.status)
    formData.append('receipt', data.receipt)
    body = formData
  } else {
    body = JSON.stringify({
      source_account: data.source_account,
      source_currency: data.source_currency,
      source_amount: data.source_amount,
      destination_account: data.destination_account,
      destination_currency: data.destination_currency,
      destination_amount: data.destination_amount,
      exchange_rate: data.exchange_rate,
      transfer_date: data.transfer_date,
      description: data.description,
      reference_number: data.reference_number,
      status: data.status || 'completed',
    })
    headers = { 'Content-Type': 'application/json' }
  }

  const response = await apiCall(API_ENDPOINTS.FINANCIAL.TRANSFERS, {
    method: 'POST',
    headers,
    body,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Failed to create transfer')
  }

  return response.json()
}

// Delete a bank transfer
const deleteTransfer = async (id: string): Promise<void> => {
  const response = await apiCall(API_ENDPOINTS.FINANCIAL.TRANSFER(id), {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete transfer')
  }
}

// Hook: Fetch bank statement
export function useBankStatement(startDate: Date, endDate: Date, accountId?: string) {
  return useQuery({
    queryKey: bankStatementKeys.statement(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
      accountId
    ),
    queryFn: () => fetchBankStatement(startDate, endDate, accountId),
  })
}

// Hook: Fetch bank transfers
export function useBankTransfers(startDate: Date, endDate: Date, accountId?: string) {
  return useQuery({
    queryKey: bankStatementKeys.transfers.list(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
      accountId
    ),
    queryFn: () => fetchTransfers(startDate, endDate, accountId),
  })
}

// Hook: Create bank transfer with optimistic update
export function useCreateTransfer(startDate: Date, endDate: Date, accountId?: string) {
  const queryClient = useQueryClient()
  const statementQueryKey = bankStatementKeys.statement(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd'),
    accountId
  )
  const transfersQueryKey = bankStatementKeys.transfers.list(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd'),
    accountId
  )

  return useMutation({
    mutationFn: createTransfer,
    onMutate: async (newTransfer) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: transfersQueryKey })
      await queryClient.cancelQueries({ queryKey: statementQueryKey })

      // Snapshot previous values
      const previousTransfers = queryClient.getQueryData<BankTransfer[]>(transfersQueryKey)
      const previousStatement = queryClient.getQueryData<BankStatement>(statementQueryKey)

      // Create optimistic transfer
      const optimisticTransfer: BankTransfer = {
        id: `temp-${Date.now()}`,
        source_account: newTransfer.source_account,
        source_account_id: newTransfer.source_account,
        source_account_name: 'Loading...',
        source_currency: newTransfer.source_currency,
        source_amount: newTransfer.source_amount,
        destination_account: newTransfer.destination_account,
        destination_account_id: newTransfer.destination_account,
        destination_account_name: 'Loading...',
        destination_currency: newTransfer.destination_currency,
        destination_amount: newTransfer.destination_amount,
        exchange_rate: newTransfer.exchange_rate,
        transfer_date: newTransfer.transfer_date,
        description: newTransfer.description,
        reference_number: newTransfer.reference_number,
        status: newTransfer.status || 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_cross_currency: newTransfer.source_currency !== newTransfer.destination_currency,
      }

      // Optimistically update transfers list
      queryClient.setQueryData<BankTransfer[]>(transfersQueryKey, (old) => {
        return old ? [optimisticTransfer, ...old] : [optimisticTransfer]
      })

      return { previousTransfers, previousStatement }
    },
    onSuccess: () => {
      // Invalidate both queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: transfersQueryKey })
      queryClient.invalidateQueries({ queryKey: statementQueryKey })
    },
    onError: (_error, _newTransfer, context) => {
      // Rollback on error
      if (context?.previousTransfers) {
        queryClient.setQueryData(transfersQueryKey, context.previousTransfers)
      }
      if (context?.previousStatement) {
        queryClient.setQueryData(statementQueryKey, context.previousStatement)
      }
    },
  })
}

// Hook: Delete bank transfer
export function useDeleteTransfer(startDate: Date, endDate: Date, accountId?: string) {
  const queryClient = useQueryClient()
  const statementQueryKey = bankStatementKeys.statement(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd'),
    accountId
  )
  const transfersQueryKey = bankStatementKeys.transfers.list(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd'),
    accountId
  )

  return useMutation({
    mutationFn: deleteTransfer,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: transfersQueryKey })

      // Snapshot previous values
      const previousTransfers = queryClient.getQueryData<BankTransfer[]>(transfersQueryKey)

      // Optimistically remove the transfer
      queryClient.setQueryData<BankTransfer[]>(transfersQueryKey, (old) => {
        return old ? old.filter((t) => t.id !== id) : []
      })

      return { previousTransfers }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transfersQueryKey })
      queryClient.invalidateQueries({ queryKey: statementQueryKey })
    },
    onError: (_error, _id, context) => {
      if (context?.previousTransfers) {
        queryClient.setQueryData(transfersQueryKey, context.previousTransfers)
      }
    },
  })
}
