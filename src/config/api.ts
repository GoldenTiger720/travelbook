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
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile/update',
    CHANGE_PASSWORD: '/api/user/change-password',
    UPLOAD_AVATAR: '/api/user/avatar',
  },
  
  // Reservations endpoints
  RESERVATIONS: {
    LIST: '/api/reservations',
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
    LIST: '/api/customers',
    CREATE: '/api/customers',
    GET: (id: string) => `/api/customers/${id}`,
    UPDATE: (id: string) => `/api/customers/${id}`,
    DELETE: (id: string) => `/api/customers/${id}`,
    SEARCH: '/api/customers/search',
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
    DASHBOARD: '/api/financial/dashboard',
    TRANSACTIONS: '/api/financial/transactions',
    INVOICES: '/api/financial/invoices',
    INVOICE: (id: string) => `/api/financial/invoices/${id}`,
    PAYMENTS: '/api/financial/payments',
    PAYMENT: (id: string) => `/api/financial/payments/${id}`,
    REPORTS: '/api/financial/reports',
  },
  
  // Sales Commissions endpoints
  COMMISSIONS: {
    LIST: '/api/commissions',
    CALCULATE: '/api/commissions/calculate',
    GET: (id: string) => `/api/commissions/${id}`,
    APPROVE: (id: string) => `/api/commissions/${id}/approve`,
    PAY: (id: string) => `/api/commissions/${id}/pay`,
  },
  
  // Logistics endpoints
  LOGISTICS: {
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

// Helper function for API calls with error handling
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildUrl(endpoint);
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers,
    },
  };
  
  // Add auth token if it exists
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
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