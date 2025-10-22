import { useQuery } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import { CommissionFilters } from '@/types/commission'

// Query keys
export const commissionKeys = {
  all: ['commissions'] as const,
  lists: () => [...commissionKeys.all, 'list'] as const,
  list: (filters: CommissionFilters) => [...commissionKeys.lists(), filters] as const,
  uniqueValues: () => [...commissionKeys.all, 'unique-values'] as const,
  summary: (filters: CommissionFilters) => [...commissionKeys.all, 'summary', filters] as const,
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
 * Hook to fetch commission summary
 */
export const useCommissionSummary = (filters: CommissionFilters) => {
  return useQuery({
    queryKey: commissionKeys.summary(filters),
    queryFn: () => commissionService.getCommissionSummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
