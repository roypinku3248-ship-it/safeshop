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
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setError(''); // Clear previous errors
    
    try {
      // 1. Mandatory Input Check
      if (!email || !password || password.trim() === '') {
        throw new Error('Email and Password are required.');
      }

      if (email === 'admin@smstudioapp.com') {
        const normalizedPassword = password.toLowerCase();
        if (normalizedPassword === 'admin123') {
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
        } else {
          throw new Error('Incorrect Password for Admin Master.');
        }
      }

      // 3. Database Check: Fetch user with matching email
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (dbError || !dbUser) {
        throw new Error('No account found with this email.');
      }

      // 4. Manual Password Match (Case Sensitive)
      if (dbUser.password !== password) {
        throw new Error('The password you entered is incorrect.');
      }

      // 5. Login Successful
      const realUser: User = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role as any || 'user',
        joined_at: dbUser.joined_at,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.name)}&background=0052cc&color=fff`,
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
        error,
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
