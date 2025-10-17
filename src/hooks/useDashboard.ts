import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
}

// Fetch dashboard data
export function useDashboardData() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data doesn't need to be super fresh
    refetchOnMount: true,
    retry: (failureCount) => {
      return failureCount < 3
    },
  })
}
