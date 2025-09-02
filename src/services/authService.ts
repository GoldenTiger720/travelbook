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

export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  company: string | null;
  isVerified: boolean;
  dateJoined: string;
  avatar: string | null;
  bio: string | null;
  language: string;
  timezone: string;
}

export interface AuthResponse {
  user: BackendUser;
  access: string;
  refresh: string;
}

export interface MessageResponse {
  message: string;
  success?: boolean;
}

export interface AuthError {
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    fullName?: string[];
    [key: string]: string[] | undefined;
  };
}

// Auth Service
class AuthService {
  // Parse error response
  private parseErrorResponse(response: any): AuthError {
    // Check if response has field-specific errors
    if (response && typeof response === 'object') {
      // If it's already in the correct format (field: string[])
      const hasFieldErrors = Object.keys(response).some(key => 
        Array.isArray(response[key])
      );
      
      if (hasFieldErrors) {
        return { errors: response };
      }
      
      // If it has an errors field
      if (response.errors) {
        return { errors: response.errors, message: response.message };
      }
      
      // If it only has a message
      if (response.message) {
        return { message: response.message };
      }
    }
    
    return { message: 'An unexpected error occurred' };
  }

  // Sign in user
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.SIGN_IN, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      // Check if response was successful (2xx status)
      if (response.ok) {
        // Store tokens and user data separately
        if (result.access) {
          localStorage.setItem('accessToken', result.access);
        }
        if (result.refresh) {
          localStorage.setItem('refreshToken', result.refresh);
        }
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        return result;
      }
      
      // If not successful, throw error with proper structure
      throw this.parseErrorResponse(result);
    } catch (error: any) {
      // If error is from fetch/network
      if (error instanceof Error) {
        throw error;
      }
      // If error is already parsed
      if (error.errors || error.message) {
        throw error;
      }
      // Parse and throw
      throw this.parseErrorResponse(error);
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
      
      // Check if response was successful (2xx status)
      if (response.ok) {
        // Store tokens and user data if auto-login is enabled
        if (result.access) {
          localStorage.setItem('accessToken', result.access);
        }
        if (result.refresh) {
          localStorage.setItem('refreshToken', result.refresh);
        }
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        return result;
      }
      
      // If not successful, throw error with proper structure
      throw this.parseErrorResponse(result);
    } catch (error: any) {
      // If error is from fetch/network
      if (error instanceof Error) {
        throw error;
      }
      // If error is already parsed
      if (error.errors || error.message) {
        throw error;
      }
      // Parse and throw
      throw this.parseErrorResponse(error);
    }
  }
  
  // Sign out user - immediate logout
  signOut(): void {
    // Clear ALL localStorage values immediately
    localStorage.clear();
    
    // Make API call in background without waiting for response
    apiCall(API_ENDPOINTS.AUTH.SIGN_OUT, {
      method: 'POST',
    }).catch(error => {
      console.warn('Background signout API call failed (user already logged out locally):', error);
    });
  }
  
  // Request password reset
  async forgotPassword(data: ForgotPasswordData): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return result;
      }
      
      throw this.parseErrorResponse(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }
  
  // Reset password with token
  async resetPassword(data: ResetPasswordData): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return result;
      }
      
      throw this.parseErrorResponse(result);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
  
  // Verify email
  async verifyEmail(token: string): Promise<MessageResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return result;
      }
      
      throw this.parseErrorResponse(result);
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
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      const result = await response.json();
      
      // Check if response was successful
      if (response.ok) {
        // Update stored tokens
        if (result.access) {
          localStorage.setItem('accessToken', result.access);
        }
        if (result.refresh) {
          localStorage.setItem('refreshToken', result.refresh);
        }
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        return result;
      }
      
      throw this.parseErrorResponse(result);
    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear auth tokens on refresh failure (but preserve other localStorage data)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  }
  
  // Google OAuth authentication
  async signInWithGoogle(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.GOOGLE, {
        method: 'POST',
        body: JSON.stringify({ token: googleToken }),
      });
      
      const result = await response.json();
      
      // Check if response was successful
      if (response.ok) {
        // Store tokens and user data
        if (result.access) {
          localStorage.setItem('accessToken', result.access);
        }
        if (result.refresh) {
          localStorage.setItem('refreshToken', result.refresh);
        }
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        return result;
      }
      
      throw this.parseErrorResponse(result);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
  
  // Get current user
  getCurrentUser(): BackendUser | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as BackendUser;
    } catch {
      return null;
    }
  }
  
  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  
  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

// Export singleton instance
export default new AuthService();