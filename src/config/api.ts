// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGN_IN: '/api/auth/signin',
    SIGN_UP: '/api/auth/signup',
    SIGN_OUT: '/api/auth/signout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    GOOGLE: '/api/auth/google',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/user/profile',
    AVATAR: '/api/user/profile/avatar',
    CHANGE_PASSWORD: '/api/user/change-password',
  },
  
  // Reservations endpoints
  RESERVATIONS: {
    LIST: '/api/reservations/basic/',
    CONFIRMED: '/api/reservation/confirm/',
    ALL: '/api/reservation/all/',
    CREATE: '/api/reservations',
    GET: (id: string) => `/api/reservations/${id}`,
    UPDATE: (id: string) => `/api/reservations/${id}`,
    DELETE: (id: string) => `/api/reservations/${id}`,
    SEARCH: '/api/reservations/search',
  },

  // Quotes endpoints
  QUOTES: {
    LIST: '/api/quotes',
    CREATE: '/api/quotes',
    GET: (id: string) => `/api/quotes/${id}`,
    UPDATE: (id: string) => `/api/quotes/${id}`,
    DELETE: (id: string) => `/api/quotes/${id}`,
    SHARE: (id: string) => `/api/quotes/${id}/share`,
    GET_SHARED: (shareId: string) => `/api/quotes/share/${shareId}`,
  },
  
  // Customers endpoints
  CUSTOMERS: {
    LIST: '/api/customers/',
    CREATE: '/api/customers/',
    GET: (id: string) => `/api/customers/${id}/`,
    UPDATE: (id: string) => `/api/customers/${id}/`,
    DELETE: (id: string) => `/api/customers/${id}/`,
    SEARCH: '/api/customers/search/',
  },
  
  // Services endpoints
  SERVICES: {
    LIST: '/api/services',
    CREATE: '/api/services',
    GET: (id: string) => `/api/services/${id}`,
    UPDATE: (id: string) => `/api/services/${id}`,
    DELETE: (id: string) => `/api/services/${id}`,
    CATEGORIES: '/api/services/categories',
  },
  
  // Tours endpoints
  TOURS: {
    LIST: '/api/tours',
    CREATE: '/api/tours',
    GET: (id: string) => `/api/tours/${id}`,
    UPDATE: (id: string) => `/api/tours/${id}`,
    DELETE: (id: string) => `/api/tours/${id}`,
    SEARCH: '/api/tours/search',
    AVAILABILITY: (id: string) => `/api/tours/${id}/availability`,
  },
  
  // Financial endpoints
  FINANCIAL: {
    DASHBOARD: '/api/financial/dashboard/',
    RECEIVABLES: '/api/financial/receivables/',
    PAYABLES: '/api/financial/payables/',
    EXPENSES: '/api/financial/expenses/',
    EXPENSE: (id: string) => `/api/financial/expenses/${id}/`,
    EXPENSE_SUMMARY: '/api/financial/expenses/summary/',
    ACCOUNTS: '/api/financial/accounts/',
    ACCOUNT: (id: string) => `/api/financial/accounts/${id}/`,
    BANK_STATEMENT: '/api/financial/bank-statement/',
    TRANSFERS: '/api/financial/transfers/',
    TRANSFER: (id: string) => `/api/financial/transfers/${id}/`,
    INCOME_STATEMENT: '/api/financial/reports/income-statement/',
    CASH_FLOW: '/api/financial/reports/cash-flow/',
  },
  
  // Sales Commissions endpoints
  COMMISSIONS: {
    LIST: '/api/commissions/',
    UNIQUE_VALUES: '/api/commissions/unique-values/',
    EXTENDED_UNIQUE_VALUES: '/api/commissions/extended-unique-values/',
    SUMMARY: '/api/commissions/summary/',
    CLOSE: '/api/commissions/close/',
    GET: (id: string) => `/api/commissions/${id}/`,
    APPROVE: (id: string) => `/api/commissions/${id}/approve/`,
    PAY: (id: string) => `/api/commissions/${id}/pay/`,
    // Operator payments
    OPERATORS: '/api/commissions/operators/',
    OPERATORS_UNIQUE_VALUES: '/api/commissions/operators/unique-values/',
    OPERATORS_SUMMARY: '/api/commissions/operators/summary/',
    OPERATORS_CLOSE: '/api/commissions/operators/close/',
    // Closings
    CLOSINGS: '/api/commissions/closings/',
    CLOSING_DETAIL: (id: string) => `/api/commissions/closings/${id}/`,
    CLOSING_UNDO: (id: string) => `/api/commissions/closings/${id}/undo/`,
    CLOSING_INVOICE: (id: string) => `/api/commissions/closings/${id}/invoice/`,
    // Financial Forecast
    FORECAST: '/api/commissions/forecast/',
    // Closure Status
    CLOSURE_STATUS: (bookingId: string) => `/api/commissions/closure-status/${bookingId}/`,
    // Adjustment Requests
    ADJUSTMENT_REQUEST: '/api/commissions/adjustments/request/',
    ADJUSTMENT_PENDING: '/api/commissions/adjustments/pending/',
    ADJUSTMENT_APPROVE: (id: string) => `/api/commissions/adjustments/${id}/approve/`,
    ADJUSTMENT_REJECT: (id: string) => `/api/commissions/adjustments/${id}/reject/`,
  },
  
  // Logistics endpoints
  LOGISTICS: {
    BASIC: '/api/logistics/basic/',
    SHIPMENTS: '/api/logistics/shipments',
    SHIPMENT: (id: string) => `/api/logistics/shipments/${id}`,
    TRACKING: (trackingId: string) => `/api/logistics/tracking/${trackingId}`,
    CARRIERS: '/api/logistics/carriers',
  },
  
  // Reports endpoints
  REPORTS: {
    GENERATE: '/api/reports/generate',
    LIST: '/api/reports',
    GET: (id: string) => `/api/reports/${id}`,
    DOWNLOAD: (id: string) => `/api/reports/${id}/download`,
    TEMPLATES: '/api/reports/templates',
  },
  
  // Settings endpoints
  SETTINGS: {
    GET: '/api/settings',
    UPDATE: '/api/settings',
    PREFERENCES: '/api/settings/preferences',
    NOTIFICATIONS: '/api/settings/notifications',
    DESTINATIONS: {
      LIST: '/api/settings/destinations',
      CREATE: '/api/settings/destinations',
      GET: (id: string) => `/api/settings/destinations/${id}`,
      UPDATE: (id: string) => `/api/settings/destinations/${id}`,
      DELETE: (id: string) => `/api/settings/destinations/${id}`,
    },
    CATEGORIES: {
      LIST: '/api/settings/system/categories/',
      CREATE: '/api/settings/system/categories/',
      GET: (id: string) => `/api/settings/system/categories/${id}/`,
      UPDATE: (id: string) => `/api/settings/system/categories/${id}/`,
      DELETE: (id: string) => `/api/settings/system/categories/${id}/`,
    },
  },
  
  // Support endpoints
  SUPPORT: {
    TICKETS: '/api/support/tickets',
    CREATE_TICKET: '/api/support/tickets',
    GET_TICKET: (id: string) => `/api/support/tickets/${id}`,
    UPDATE_TICKET: (id: string) => `/api/support/tickets/${id}`,
    FAQ: '/api/support/faq',
  },
  
  // Dashboard endpoints
  DASHBOARD: {
    ALL_DATA: '/api/dashboard/all-data/',
    STATS: '/api/dashboard/stats',
    CHARTS: '/api/dashboard/charts',
    RECENT_ACTIVITY: '/api/dashboard/recent-activity',
    NOTIFICATIONS: '/api/dashboard/notifications',
  },
};

// Helper function to build full URL
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Track if we're currently refreshing to avoid multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Helper function to refresh the access token
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN), {
    method: 'POST',
    headers: {
      ...API_CONFIG.HEADERS,
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    // Refresh token is invalid or expired
    localStorage.clear();
    window.location.href = '/signin';
    throw new Error('Refresh token expired');
  }

  const data = await response.json();

  // Store new tokens
  if (data.access) {
    localStorage.setItem('accessToken', data.access);
  }
  if (data.refresh) {
    localStorage.setItem('refreshToken', data.refresh);
  }

  return data.access;
};

// Helper function for API calls with error handling and automatic token refresh
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildUrl(endpoint);

  // Don't set Content-Type header for FormData - browser will set it automatically with boundary
  const isFormData = options.body instanceof FormData;

  const config: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : API_CONFIG.HEADERS),
      ...options.headers,
    },
  };

  // Add access token if it exists
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    // Check for token expiration errors (401 Unauthorized)
    if (response.status === 401) {
      try {
        const errorData = await response.clone().json();

        // Check if this is a token expiration error
        const isTokenExpired =
          errorData.code === 'token_not_valid' ||
          errorData.detail?.includes('token') ||
          errorData.detail?.includes('expired') ||
          (errorData.messages && Array.isArray(errorData.messages) &&
            errorData.messages.some((msg: any) =>
              msg.message === 'Token is expired' || msg.token_type === 'access'
            ));

        if (isTokenExpired) {
          // Don't try to refresh if we're already on the refresh endpoint
          if (endpoint === API_ENDPOINTS.AUTH.REFRESH_TOKEN) {
            localStorage.clear();
            window.location.href = '/signin';
            throw new Error('Refresh token expired');
          }

          // Try to refresh the token
          try {
            // If already refreshing, wait for that promise
            if (isRefreshing && refreshPromise) {
              await refreshPromise;
            } else {
              // Start refreshing
              isRefreshing = true;
              refreshPromise = refreshAccessToken();
              await refreshPromise;
              isRefreshing = false;
              refreshPromise = null;
            }

            // Retry the original request with new token
            const newToken = localStorage.getItem('accessToken');
            if (newToken) {
              config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${newToken}`,
              };
              return await fetch(url, config);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            isRefreshing = false;
            refreshPromise = null;
            localStorage.clear();
            window.location.href = '/signin';
            throw new Error('Session expired, please login again');
          }
        }
      } catch (parseError) {
        // If we can't parse the error JSON, check if it's a 401
        // and try to refresh anyway
        if (response.status === 401 && endpoint !== API_ENDPOINTS.AUTH.REFRESH_TOKEN) {
          try {
            if (isRefreshing && refreshPromise) {
              await refreshPromise;
            } else {
              isRefreshing = true;
              refreshPromise = refreshAccessToken();
              await refreshPromise;
              isRefreshing = false;
              refreshPromise = null;
            }

            const newToken = localStorage.getItem('accessToken');
            if (newToken) {
              config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${newToken}`,
              };
              return await fetch(url, config);
            }
          } catch (refreshError) {
            isRefreshing = false;
            refreshPromise = null;
            localStorage.clear();
            window.location.href = '/signin';
            throw new Error('Session expired, please login again');
          }
        }
      }
    }

    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Export for use in components
export default {
  config: API_CONFIG,
  endpoints: API_ENDPOINTS,
  buildUrl,
  apiCall,
};