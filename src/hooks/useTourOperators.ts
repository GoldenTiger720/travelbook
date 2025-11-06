import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tourOperatorService, TourOperator, TourOperatorFormData } from '@/services/tourOperatorService'
import { useToast } from '@/components/ui/use-toast'

const OPERATORS_QUERY_KEY = ['tour-operators']

export const useTourOperators = (isActiveOnly = false) => {
  return useQuery({
    queryKey: [...OPERATORS_QUERY_KEY, isActiveOnly],
    queryFn: () => tourOperatorService.getOperators(isActiveOnly),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

export const useCreateOperator = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: TourOperatorFormData) => tourOperatorService.createOperator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPERATORS_QUERY_KEY })
      toast({
        title: 'Success',
        description: 'Tour operator created successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create tour operator',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateOperator = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TourOperatorFormData> }) =>
      tourOperatorService.updateOperator(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPERATORS_QUERY_KEY })
      toast({
        title: 'Success',
        description: 'Tour operator updated successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update tour operator',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteOperator = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => tourOperatorService.deleteOperator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPERATORS_QUERY_KEY })
      toast({
        title: 'Success',
        description: 'Tour operator deleted successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete tour operator',
        variant: 'destructive',
      })
    },
  })
}