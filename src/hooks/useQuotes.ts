import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteService } from '@/services/quoteService'
import { Quote, QuoteFilters } from '@/types/quote'
import { useToast } from '@/components/ui/use-toast'

// Query keys
export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (filters: QuoteFilters) => [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
}

// Fetch quotes with filters
export function useQuotes(filters: QuoteFilters) {
  return useQuery({
    queryKey: quoteKeys.list(filters),
    queryFn: () => quoteService.getQuotes(filters),
  })
}

// Fetch single quote
export function useQuote(id: string) {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: () => quoteService.getQuoteById(id),
    enabled: !!id,
  })
}

// Create quote mutation
export function useCreateQuote() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: Omit<Quote, 'id' | 'quoteNumber' | 'metadata'>) => 
      quoteService.createQuote(data),
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      toast({
        title: 'Success',
        description: `Quote ${newQuote.quoteNumber} created successfully`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create quote',
        variant: 'destructive',
      })
    },
  })
}

// Update quote mutation
export function useUpdateQuote() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) =>
      quoteService.updateQuote(id, data),
    onSuccess: (updatedQuote) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(updatedQuote.id) })
      toast({
        title: 'Success',
        description: 'Quote updated successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update quote',
        variant: 'destructive',
      })
    },
  })
}

// Delete quote mutation
export function useDeleteQuote() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => quoteService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      toast({
        title: 'Success',
        description: 'Quote deleted successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete quote',
        variant: 'destructive',
      })
    },
  })
}

// Duplicate quote mutation
export function useDuplicateQuote() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => quoteService.duplicateQuote(id),
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      toast({
        title: 'Success',
        description: `Quote duplicated successfully`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to duplicate quote',
        variant: 'destructive',
      })
    },
  })
}

// Generate shareable link mutation
export function useGenerateShareableLink() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => quoteService.generateShareableLink(id),
    onSuccess: async (link) => {
      await navigator.clipboard.writeText(link)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      toast({
        title: 'Link Generated',
        description: 'Shareable link copied to clipboard',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to generate link',
        variant: 'destructive',
      })
    },
  })
}

// Send quote by email mutation
export function useSendQuoteByEmail() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      quoteService.sendQuoteByEmail(id, email),
    onSuccess: (_, variables) => {
      toast({
        title: 'Email Sent',
        description: `Quote sent to ${variables.email}`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive',
      })
    },
  })
}