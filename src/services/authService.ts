import { API_ENDPOINTS, apiCall } from '@/config/api';

// Types
export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      fullName: string;
      email: string;
      avatar?: string;
    };
    token: string;
    refreshToken?: string;
  };
}

// Auth Service
class AuthService {
  // Sign in user
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.SIGN_IN, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      // Store token if successful
      if (result.success && result.data?.token) {
        localStorage.setItem('authToken', result.data.token);
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }
        if (result.data.user) {
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
  
  // Sign up new user
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.SIGN_UP, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      // Store token if successful auto-login
      if (result.success && result.data?.token) {
        localStorage.setItem('authToken', result.data.token);
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }
        if (result.data.user) {
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
      }
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
  
  // Sign out user
  async signOut(): Promise<void> {
    try {
      await apiCall(API_ENDPOINTS.AUTH.SIGN_OUT, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
  
  // Request password reset
  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }
  
  // Reset password with token
  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
  
  // Verify email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }
  
  // Refresh auth token
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      
      const result = await response.json();
      
      // Update stored tokens
      if (result.success && result.data?.token) {
        localStorage.setItem('authToken', result.data.token);
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
  
  // Get current user
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  
  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

// Export singleton instance
export default new AuthService();