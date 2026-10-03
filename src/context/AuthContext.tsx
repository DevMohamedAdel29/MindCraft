import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile } from '../types/database';
import { db } from '../services/db';

interface AuthContextType {
  user: Profile | null;
  role: 'admin' | 'student' | null;
  isLoading: boolean;
  loading: boolean;
  isAdminAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<Profile>;
  register: (fullName: string, email: string, studentId: string, password?: string, gradeLevel?: string) => Promise<Profile>;
  logout: () => void;
  lockAdminSession: () => void;
  updateUser: (updates: Partial<Profile>) => Promise<Profile>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const refreshUser = useCallback(() => {
    const current = db.getCurrentUser();
    setUser(current);
    setIsAdminAuthenticated(db.isAdminSessionValid());
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const restored = await db.restoreSession();
        if (active) { setUser(restored); setIsAdminAuthenticated(db.isAdminSessionValid()); }
      } finally { if (active) setIsLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const login = async (email: string, password?: string): Promise<Profile> => {
    setIsLoading(true);
    try {
      const profile = await db.login(email, password);
      setUser(profile);
      setIsAdminAuthenticated(db.isAdminSessionValid());
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    studentId: string,
    password?: string,
    gradeLevel?: string
  ): Promise<Profile> => {
    setIsLoading(true);
    try {
      const profile = await db.register(fullName, email, studentId, password, gradeLevel);
      setUser(profile);
      setIsAdminAuthenticated(false);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    db.logout();
    setUser(null);
    setIsAdminAuthenticated(false);
  };

  const lockAdminSession = () => {
    db.invalidateAdminSession();
    setIsAdminAuthenticated(false);
    // If current user is admin, clearing admin session forces re-login
    if (user && user.role === 'admin') {
      db.setCurrentUser(null);
      setUser(null);
    }
  };

  const updateUser = async (updates: Partial<Profile>): Promise<Profile> => {
    if (!user) throw new Error('No active user session');
    const updated = db.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        loading: isLoading,
        isAdminAuthenticated,
        login,
        register,
        logout,
        lockAdminSession,
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
