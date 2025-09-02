import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authService, { SignInData, SignUpData, ForgotPasswordData, ResetPasswordData, AuthResponse, AuthError, MessageResponse } from '@/services/authService';
import { queryKeys } from '@/lib/react-query';

// Helper function to format error messages
const formatErrorMessages = (error: AuthError): { fields: Record<string, string[]>, general: string } => {
  const fields: Record<string, string[]> = {};
  let general = '';

  if (error.errors) {
    // Extract field-specific errors
    Object.entries(error.errors).forEach(([field, messages]) => {
      if (messages && messages.length > 0) {
        fields[field] = messages;
      }
    });
  }

  if (error.message) {
    general = error.message;
  } else if (Object.keys(fields).length === 0) {
    general = 'An error occurred. Please try again.';
  }

  return { fields, general };
};

// Hook for sign up
export const useSignUp = (onFieldErrors?: (errors: Record<string, string[]>) => void) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, AuthError, SignUpData>({
    mutationFn: async (data: SignUpData) => {
      const response = await authService.signUp(data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      
      // Show success message with user's name
      toast.success(`Welcome ${data.user.fullName}! Account created successfully!`);
      
      // Navigate to dashboard since successful signup includes tokens
      navigate('/');
    },
    onError: (error: AuthError) => {
      const { fields, general } = formatErrorMessages(error);
      
      // Pass field errors to the component
      if (onFieldErrors && Object.keys(fields).length > 0) {
        onFieldErrors(fields);
      }
      
      // Show general error or all field errors as toast
      if (Object.keys(fields).length > 0) {
        // Show each field error in a toast
        Object.entries(fields).forEach(([field, messages]) => {
          messages.forEach(message => {
            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`, {
              style: {
                background: '#ef4444',
                color: 'white',
              },
            });
          });
        });
      } else if (general) {
        toast.error(general, {
          style: {
            background: '#ef4444',
            color: 'white',
          },
        });
      }
    },
  });
};

// Hook for sign in
export const useSignIn = (onFieldErrors?: (errors: Record<string, string[]>) => void) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, AuthError, SignInData>({
    mutationFn: async (data: SignInData) => {
      const response = await authService.signIn(data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      
      // Show success message with user's name
      toast.success(`Welcome back, ${data.user.fullName}!`);
      
      // Navigate to dashboard
      navigate('/');
    },
    onError: (error: AuthError) => {
      const { fields, general } = formatErrorMessages(error);
      
      // Pass field errors to the component
      if (onFieldErrors && Object.keys(fields).length > 0) {
        onFieldErrors(fields);
      }
      
      // Show general error or all field errors as toast
      if (Object.keys(fields).length > 0) {
        // Show each field error in a toast
        Object.entries(fields).forEach(([field, messages]) => {
          messages.forEach(message => {
            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`, {
              style: {
                background: '#ef4444',
                color: 'white',
              },
            });
          });
        });
      } else if (general) {
        toast.error(general, {
          style: {
            background: '#ef4444',
            color: 'white',
          },
        });
      }
    },
  });
};

// Hook for sign out - immediate action
export const useSignOut = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = () => {
    // Perform immediate logout
    authService.signOut();
    
    // Clear all React Query cache immediately
    queryClient.clear();
    
    // Show success message
    toast.success('Signed out successfully');
    
    // Navigate to sign in page immediately
    navigate('/signin');
  };

  return {
    signOut,
    isPending: false // Always false since logout is immediate
  };
};

// Hook for forgot password
export const useForgotPassword = () => {
  return useMutation<MessageResponse, AuthError, ForgotPasswordData>({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await authService.forgotPassword(data);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset email sent! Check your inbox.');
    },
    onError: (error: AuthError) => {
      const { fields, general } = formatErrorMessages(error);
      
      if (Object.keys(fields).length > 0) {
        // Show each field error
        Object.entries(fields).forEach(([field, messages]) => {
          messages.forEach(message => {
            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`, {
              style: {
                background: '#ef4444',
                color: 'white',
              },
            });
          });
        });
      } else {
        toast.error(general || 'Failed to send reset email. Please try again.', {
          style: {
            background: '#ef4444',
            color: 'white',
          },
        });
      }
    },
  });
};

// Hook for Google OAuth sign in
export const useGoogleSignIn = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, string>({
    mutationFn: async (googleToken: string) => {
      const response = await authService.signInWithGoogle(googleToken);
      if (!response.success) {
        throw new Error(response.message || 'Google sign in failed');
      }
      return response;
    },
    onSuccess: (data) => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      
      // Show success message
      toast.success('Successfully signed in with Google!');
      
      // Navigate to dashboard
      navigate('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sign in with Google');
    },
  });
};

// Hook for reset password
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation<MessageResponse, AuthError, ResetPasswordData>({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await authService.resetPassword(data);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset successfully!');
      // Navigate to sign in page
      navigate('/signin');
    },
    onError: (error: AuthError) => {
      const { fields, general } = formatErrorMessages(error);
      
      if (Object.keys(fields).length > 0) {
        // Show each field error
        Object.entries(fields).forEach(([field, messages]) => {
          messages.forEach(message => {
            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`, {
              style: {
                background: '#ef4444',
                color: 'white',
              },
            });
          });
        });
      } else {
        toast.error(general || 'Failed to reset password. Please try again.', {
          style: {
            background: '#ef4444',
            color: 'white',
          },
        });
      }
    },
  });
};

// Hook for verify email
export const useVerifyEmail = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, AuthError, string>({
    mutationFn: async (token: string) => {
      const response = await authService.verifyEmail(token);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      
      toast.success(data.message || 'Email verified successfully!');
      
      // Navigate to dashboard or sign in based on auth status
      if (authService.isAuthenticated()) {
        navigate('/');
      } else {
        navigate('/signin');
      }
    },
    onError: (error: AuthError) => {
      const { fields, general } = formatErrorMessages(error);
      
      if (Object.keys(fields).length > 0) {
        // Show each field error
        Object.entries(fields).forEach(([field, messages]) => {
          messages.forEach(message => {
            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`, {
              style: {
                background: '#ef4444',
                color: 'white',
              },
            });
          });
        });
      } else {
        toast.error(general || 'Failed to verify email. The link may be expired.', {
          style: {
            background: '#ef4444',
            color: 'white',
          },
        });
      }
    },
  });
};

// Hook for refresh token
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error>({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error: Error) => {
      console.error('Token refresh failed:', error);
      // Tokens are cleared in the service
    },
  });
};

// Hook to get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
  });
};

// Hook to check authentication status
export const useIsAuthenticated = () => {
  return authService.isAuthenticated();
};