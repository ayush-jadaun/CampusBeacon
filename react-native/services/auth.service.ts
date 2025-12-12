import api from './api';
import { storage } from '../utils/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      registrationNumber: string;
      graduationYear: number;
      profilePicture?: string;
      isVerified: boolean;
    };
    token?: string;
  };
}

const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/login', credentials);

      if (response.data.success && response.data.data.token) {
        // Store token and user data
        await storage.setAuthToken(response.data.data.token);
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Signup
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/signup', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  // Google OAuth
  async googleAuth(idToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/google-auth', {
        idToken,
      });

      if (response.data.success && response.data.data.token) {
        // Store token and user data
        await storage.setAuthToken(response.data.data.token);
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google authentication failed');
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/user/logout');
      await storage.removeAuthToken();
      await storage.removeUserData();
    } catch (error: any) {
      // Even if API call fails, clear local storage
      await storage.removeAuthToken();
      await storage.removeUserData();
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  // Verify Email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>(`/user/verify-email/${token}`);

      if (response.data.success && response.data.data.token) {
        await storage.setAuthToken(response.data.data.token);
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  // Forgot Password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/user/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/user/reset-password/${token}`, {
        password: newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  // Get Profile
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>('/user/profile');

      if (response.data.success) {
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // Update Profile
  async updateProfile(data: Partial<SignupData>): Promise<AuthResponse> {
    try {
      const response = await api.put<AuthResponse>('/user/profile', data);

      if (response.data.success) {
        await storage.setUserData(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
};

export default authService;
