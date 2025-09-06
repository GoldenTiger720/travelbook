import { QueryClient } from '@tanstack/react-query';

// Helper function to handle token expiration errors
const handleTokenExpiration = (error: any) => {
  // Check if error is a token expiration error
  if (error?.message === 'Token expired') {
    console.log('Token expiration detected in React Query, user already redirected');
    return;
  }
  
  // Additional check for any missed token expiration errors
  if (error?.response && error.response.status === 401) {
    console.log('401 Unauthorized detected, clearing localStorage and redirecting');
    localStorage.clear();
    window.location.href = '/signin';
  }
};

// Create a client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on token expiration
        if (error?.message === 'Token expired') {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: handleTokenExpiration,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on token expiration
        if (error?.message === 'Token expired') {
          return false;
        }
        return false;
      },
      onError: handleTokenExpiration,
    },
  },
});

// Query keys factory for better organization
export const queryKeys = {
  all: [''] as const,
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  reservations: {
    all: ['reservations'] as const,
    lists: () => [...queryKeys.reservations.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.reservations.lists(), { filters }] as const,
    details: () => [...queryKeys.reservations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reservations.details(), id] as const,
  },
  quotes: {
    all: ['quotes'] as const,
    lists: () => [...queryKeys.quotes.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.quotes.lists(), { filters }] as const,
    details: () => [...queryKeys.quotes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.quotes.details(), id] as const,
  },
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.customers.lists(), { filters }] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
  },
};

// Type for mutation error
export interface MutationError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}