import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ needsVerification?: boolean; email?: string } | void>;
  register: (name: string, email: string, password: string) => Promise<{ email: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; department?: string; avatar?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await axiosInstance.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
      }
    } catch (error: any) {
      setIsLoading(false);
      if (error.response?.data?.needsVerification) {
        return { needsVerification: true, email: error.response.data.email };
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', { name, email, password });
      return { email: res.data.email };
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (email: string) => {
    try {
      await axiosInstance.post('/auth/resend-otp', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend verification code');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset link');
    }
  };

  const resetPassword = async (email: string, otp: string, password: string) => {
    try {
      await axiosInstance.post('/auth/reset-password', { email, otp, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const updateProfile = async (data: { name?: string; department?: string; avatar?: string }) => {
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await axiosInstance.put('/auth/change-password', { currentPassword, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOTP,
        resendOTP,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
