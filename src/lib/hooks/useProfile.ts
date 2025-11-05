import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiCall, API_ENDPOINTS } from '@/config/api';
import { queryKeys } from '@/lib/react-query';
import { BackendUser } from '@/services/authService';

// Profile update data interface (fullName and phone only)
export interface UpdateProfileData {
  fullName: string;
  phone?: string;
}

// Avatar update data interface
export interface UpdateAvatarData {
  avatar: string; // Base64 encoded image
}

// Password change data interface
export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// Update profile function (fullName and phone only)
const updateProfile = async (data: UpdateProfileData): Promise<BackendUser> => {
  const response = await apiCall(API_ENDPOINTS.USER.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  const result = await response.json();

  // Update localStorage with new user data
  if (result) {
    localStorage.setItem('user', JSON.stringify(result));
  }

  return result;
};

// Update avatar function (avatar only)
const updateAvatar = async (data: UpdateAvatarData): Promise<BackendUser> => {
  const response = await apiCall(API_ENDPOINTS.USER.AVATAR, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update avatar');
  }

  const result = await response.json();

  // Update localStorage with new user data
  if (result) {
    localStorage.setItem('user', JSON.stringify(result));
  }

  return result;
};

// Change password function
const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  const response = await apiCall(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    // Handle field-specific errors
    if (error.old_password) {
      throw new Error(error.old_password[0] || 'Invalid old password');
    }
    if (error.new_password) {
      throw new Error(error.new_password[0] || 'Invalid new password');
    }
    if (error.confirm_password) {
      throw new Error(error.confirm_password[0] || 'Passwords do not match');
    }
    if (error.error) {
      throw new Error(error.error);
    }
    throw new Error(error.message || 'Failed to change password');
  }

  return response.json();
};

// Hook for updating profile (fullName and phone)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<BackendUser, Error, UpdateProfileData>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile', {
        style: {
          background: '#ef4444',
          color: 'white',
        },
      });
    },
  });
};

// Hook for updating avatar
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation<BackendUser, Error, UpdateAvatarData>({
    mutationFn: updateAvatar,
    onSuccess: (data) => {
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      toast.success('Avatar updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update avatar', {
        style: {
          background: '#ef4444',
          color: 'white',
        },
      });
    },
  });
};

// Hook for changing password
export const useChangePassword = () => {
  return useMutation<{ message: string }, Error, ChangePasswordData>({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password', {
        style: {
          background: '#ef4444',
          color: 'white',
        },
      });
    },
  });
};
