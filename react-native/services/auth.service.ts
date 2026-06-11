import api, { ApiResponse } from '@/services/api';
import { storage } from '@/utils/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileData {
  name?: string;
  semester?: string;
  branch?: string;
  hostel?: string;
}

export interface User {
  id: number;
  email: string;
  name?: string | null;
  registration_number?: string | null;
  semester?: string | null;
  branch?: string | null;
  hostel?: string | null;
  graduation_year?: number | null;
  isVerified?: boolean;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type AuthResponse = ApiResponse<{ user: User; token?: string }>;
export type SignupResponse = ApiResponse<{ userId: number }>;
export type MessageResponse = ApiResponse<null>;

const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login with:', credentials.email);
      const response = await api.post<AuthResponse>('/users/login', credentials);
      console.log('✅ Login response:', response.data);

      if (response.data.success) {
        if (response.data.data.token) {
          await storage.setAuthToken(response.data.data.token);
        }
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Signup
  async signup(data: SignupData): Promise<SignupResponse> {
    try {
      console.log('📝 Attempting signup with:', data.email);
      const response = await api.post<SignupResponse>('/users/signup', data);
      console.log('✅ Signup response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Signup error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  // Google OAuth
  async googleAuth(idToken: string): Promise<AuthResponse> {
    try {
      console.log('🔑 Attempting Google OAuth');
      const response = await api.post<AuthResponse>('/users/google-auth', {
        idToken,
      });

      if (response.data.success) {
        if (response.data.data.token) {
          await storage.setAuthToken(response.data.data.token);
        }
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Google auth error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Google authentication failed');
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/users/logout');
      await storage.removeAuthToken();
      await storage.removeUserData();
    } catch (error: any) {
      // Even if API call fails, clear local storage
      await storage.removeAuthToken();
      await storage.removeUserData();
      console.error('⚠️ Logout error (cleared local storage anyway):', error.message);
    }
  },

  // Verify Email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>(`/users/verify-email?token=${token}`);

      if (response.data.success) {
        if (response.data.data.token) {
          await storage.setAuthToken(response.data.data.token);
        }
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Email verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  // Forgot Password
  async forgotPassword(email: string): Promise<MessageResponse> {
    try {
      const response = await api.post<MessageResponse>('/users/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('❌ Forgot password error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
    try {
      const response = await api.post<MessageResponse>('/users/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Reset password error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  // Get Current User
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>('/users/current');

      if (response.data.success) {
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Get current user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch current user');
    }
  },

  // Update Profile
  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    try {
      const response = await api.put<AuthResponse>('/users/update', data);

      if (response.data.success) {
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Update profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
};

export default authService;
