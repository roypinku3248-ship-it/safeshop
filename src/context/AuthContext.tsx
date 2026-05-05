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
      // 1. Special case for Admin Master
      if (email === 'admin@smstudioapp.com' && password === 'admin123') {
        const adminUser: User = {
          id: 'SS-ADMIN-MASTER',
          name: 'Root Admin',
          email: email,
          role: 'admin',
          joined_at: new Date().toISOString(),
          avatar: `https://ui-avatars.com/api/?name=Admin&background=0052cc&color=fff`,
        };
        setUser(adminUser);
        localStorage.setItem('safeshop-user', JSON.stringify(adminUser));
        return;
      }

      // 2. Strict Check: Verify email AND password in database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error('Invalid Email or Password. Please try again.');
      }

      // 3. Login Successful
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
      console.error('Login Failed:', err.message);
      throw err;
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
