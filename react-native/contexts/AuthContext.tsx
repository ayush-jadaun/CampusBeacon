import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  graduationYear: number;
  profilePicture?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await storage.getAuthToken();
      const userData = await storage.getUserData();

      if (token && userData) {
        setUser(userData as User);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // This will be implemented with API call
    setIsLoading(true);
    try {
      // API call will be made here
      // For now, this is a placeholder
      throw new Error('Not implemented');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    // This will be implemented with API call
    setIsLoading(true);
    try {
      // API call will be made here
      throw new Error('Not implemented');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (idToken: string) => {
    // This will be implemented with API call
    setIsLoading(true);
    try {
      // API call will be made here
      throw new Error('Not implemented');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await storage.removeAuthToken();
      await storage.removeUserData();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      storage.setUserData(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    googleSignIn,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
