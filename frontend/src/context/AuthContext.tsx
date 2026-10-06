import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { LoginInput, RegisterInput, User } from '../types/auth.types';
import { authApi } from '../services/authApi';
import { ApiError } from '../services/apiClient';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<User>;
  register: (payload: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (err: unknown) {
      // 401 means unauthenticated guest, which is expected on first visit or after logout
      setUser(null);
      if (err instanceof ApiError && err.status !== 401) {
        // Log unexpected server/network errors without crashing UI
        console.warn('Session refresh encountered non-401 error:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (credentials: LoginInput): Promise<User> => {
    const loggedInUser = await authApi.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload: RegisterInput): Promise<User> => {
    const registeredUser = await authApi.register(payload);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
