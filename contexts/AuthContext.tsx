import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  signup: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication is disabled. We hardcode a premium user to grant full access.
  const user: User = useMemo(() => ({
    email: 'demo@example.com',
    role: 'premium'
  }), []);

  const loading = false;
  
  // Dummy functions to avoid errors if called from somewhere in the app.
  const login = useCallback(async (email: string) => {
    console.log("Authentication is disabled. Login action skipped.");
  }, []);

  const signup = useCallback(async (email: string) => {
     console.log("Authentication is disabled. Signup action skipped.");
  }, []);

  const logout = useCallback(() => {
     console.log("Authentication is disabled. Logout action skipped.");
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    logout
  }), [user, login, signup, logout]); // loading is static

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
