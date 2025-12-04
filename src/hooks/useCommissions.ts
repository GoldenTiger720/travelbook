import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import { CommissionFilters, CloseCommissionsRequest, CloseOperatorPaymentsRequest } from '@/types/commission'

// Query keys
export const commissionKeys = {
  all: ['commissions'] as const,
  lists: () => [...commissionKeys.all, 'list'] as const,
  list: (filters: CommissionFilters) => [...commissionKeys.lists(), filters] as const,
  uniqueValues: () => [...commissionKeys.all, 'unique-values'] as const,
  extendedUniqueValues: () => [...commissionKeys.all, 'extended-unique-values'] as const,
  summary: (filters: CommissionFilters) => [...commissionKeys.all, 'summary', filters] as const,
  operators: () => [...commissionKeys.all, 'operators'] as const,
  operatorList: (filters: CommissionFilters) => [...commissionKeys.operators(), filters] as const,
  operatorSummary: (filters: CommissionFilters) => [...commissionKeys.operators(), 'summary', filters] as const,
  closings: () => [...commissionKeys.all, 'closings'] as const,
  closing: (id: string) => [...commissionKeys.closings(), id] as const,
}

/**
 * Hook to fetch all commissions
 */
export const useCommissions = () => {
  return useQuery({
    queryKey: commissionKeys.lists(),
    queryFn: () => commissionService.getAllCommissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch filtered commissions
 */
export const useFilteredCommissions = (filters: CommissionFilters) => {
  return useQuery({
    queryKey: commissionKeys.list(filters),
    queryFn: () => commissionService.getFilteredCommissions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch unique values for filters
 */
export const useCommissionUniqueValues = () => {
  return useQuery({
    queryKey: commissionKeys.uniqueValues(),
    queryFn: () => commissionService.getUniqueValues(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch extended unique values for all filters
 */
export const useExtendedUniqueValues = () => {
  return useQuery({
    queryKey: commissionKeys.extendedUniqueValues(),
    queryFn: () => commissionService.getExtendedUniqueValues(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch commission summary
 */
export const useCommissionSummary = (filters: CommissionFilters) => {
  return useQuery({
    queryKey: commissionKeys.summary(filters),
    queryFn: () => commissionService.getCommissionSummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch operator payments
 */
export const useOperatorPayments = (filters: CommissionFilters) => {
  return useQuery({
    queryKey: commissionKeys.operatorList(filters),
    queryFn: () => commissionService.getOperatorPayments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch operator summary
 */
export const useOperatorSummary = (filters: CommissionFilters) => {
  return useQuery({
    queryKey: commissionKeys.operatorSummary(filters),
    queryFn: () => commissionService.getOperatorSummary(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch closings
 */
export const useClosings = (closingType?: string) => {
  return useQuery({
    queryKey: [...commissionKeys.closings(), closingType],
    queryFn: () => commissionService.getClosings(closingType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to close commissions
 */
export const useCloseCommissions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CloseCommissionsRequest) => commissionService.closeCommissions(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.all })
    }
  })
}

/**
 * Hook to close operator payments
 */
export const useCloseOperatorPayments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CloseOperatorPaymentsRequest) => commissionService.closeOperatorPayments(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.all })
    }
  })
}

/**
 * Hook to undo a closing
 */
export const useUndoClosing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ closingId, reason }: { closingId: string; reason: string }) =>
      commissionService.undoClosing(closingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionKeys.all })
    }
  })
}
