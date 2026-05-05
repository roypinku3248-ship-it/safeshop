'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'associate' | 'seller' | 'admin';
  avatar?: string;
  joined_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('safeshop-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // 1. Fetch real user data from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        throw new Error('User not found in database.');
      }

      // 2. Map the database data to our User object
      const realUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as any || 'user',
        joined_at: data.joined_at,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0052cc&color=fff`,
      };

      setUser(realUser);
      localStorage.setItem('safeshop-user', JSON.stringify(realUser));
    } catch (err: any) {
      console.error('Login Error:', err.message);
      // Fallback for demo purposes if DB fetch fails
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'SafeShop User',
        email: email,
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=User&background=0052cc&color=fff`,
      };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safeshop-user');
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const refreshedUser: User = {
          ...user,
          role: data.role as any || user.role,
          name: data.name || user.name
        };
        setUser(refreshedUser);
        localStorage.setItem('safeshop-user', JSON.stringify(refreshedUser));
      }
    } catch (e) {
      console.error('Refresh error', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
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
