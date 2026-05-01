'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'associate' | 'seller' | 'admin';
  avatar?: string;
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
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Try to find if this user just registered
    const savedReg = localStorage.getItem('safeshop-pending-registration');
    let dynamicName = 'New User';
    
    if (savedReg) {
      const regData = JSON.parse(savedReg);
      if (regData.email === email) {
        dynamicName = regData.name;
      }
    } else if (email === 'admin@smstudioapp.com') {
      dynamicName = 'Root Admin';
    } else if (email.includes('admin')) {
      dynamicName = 'Admin Master';
    }

    const isAdmin = email === 'admin@smstudioapp.com' || email.includes('admin');
    const isStandardUser = email === 'customer@gmail.com';

    const mockUser: User = {
      id: email === 'admin@smstudioapp.com' ? 'SS-ADMIN-001' : (isStandardUser ? 'SS-USER-101' : Math.random().toString(36).substr(2, 9)),
      name: dynamicName,
      email: email,
      role: isAdmin ? 'admin' : (email.includes('seller') ? 'seller' : (email.includes('associate') ? 'associate' : 'user')),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dynamicName)}&background=0052cc&color=fff`,
    };

    setUser(mockUser);
    localStorage.setItem('safeshop-user', JSON.stringify(mockUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safeshop-user');
  };

  const refreshUser = () => {
    if (!user) return;
    const globalUsers = JSON.parse(localStorage.getItem('safeshop-global-users') || '[]');
    const updated = globalUsers.find((u: any) => u.email === user.email);
    if (updated) {
      const refreshedUser: User = {
        ...user,
        role: updated.role || user.role,
        name: updated.name || user.name
      };
      setUser(refreshedUser);
      localStorage.setItem('safeshop-user', JSON.stringify(refreshedUser));
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
