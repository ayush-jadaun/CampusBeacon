import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login as loginAction, signup as signupAction, logout as logoutAction, verifyToken, updateUser as updateUserAction } from '@/store/slices/authSlice';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  graduationYear?: number;
  branch?: string;
  year?: number;
  profilePicture?: string;
  isVerified?: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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
  registrationNumber: string;
  branch: string;
  year: number;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated, token, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Verify token on app start
    if (token) {
      dispatch(verifyToken());
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginAction({ email, password }));
    if (loginAction.rejected.match(result)) {
      throw new Error(result.payload as string || 'Login failed');
    }
  };

  const signup = async (data: SignupData) => {
    const result = await dispatch(signupAction(data));
    if (signupAction.rejected.match(result)) {
      throw new Error(result.payload as string || 'Signup failed');
    }
  };

  const googleSignIn = async (idToken: string) => {
    // This will be implemented with API call
    throw new Error('Google Sign-In not implemented yet');
  };

  const logout = async () => {
    await dispatch(logoutAction());
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch(updateUserAction(userData));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
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
