import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isMockUser: boolean;
  isMockAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  mockLogin: () => void;
  mockAdminLogin: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockUser, setIsMockUser] = useState(false);
  const [isMockAdmin, setIsMockAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Здесь сейчас используются мок-данные; нужно заменить на fetch/axios-запрос к эндпоинту '/api/users/me'.
      // TODO: Добавить обработку loading/error для реального API.
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const mockLogin = () => {
    setUser({
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'USER'
    });
    setIsMockUser(true);
    setIsMockAdmin(false);
  };

  const mockAdminLogin = () => {
    setUser({
      id: 'mock-admin-id',
      name: 'Mock Admin',
      email: 'admin@example.com',
      role: 'ADMIN'
    });
    setIsMockAdmin(true);
    setIsMockUser(false);
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Здесь сейчас используются мок-данные; нужно заменить на fetch/axios-запрос к эндпоинту '/api/auth/login'.
      // TODO: Добавить обработку loading/error для реального API.
      // const response = await axios.post('/api/auth/login', { email, password });
      // localStorage.setItem('token', response.data.token);
      // setUser(response.data.user);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      // TODO: Здесь сейчас используются мок-данные; нужно заменить на fetch/axios-запрос к эндпоинту '/api/auth/register'.
      // TODO: Добавить обработку loading/error для реального API.
      // const response = await axios.post('/api/auth/register', { username, email, password });
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsMockUser(false);
    setIsMockAdmin(false);
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    try {
      // TODO: Здесь сейчас используются мок-данные; нужно заменить на fetch/axios-запрос к эндпоинту '/api/users/profile'.
      // TODO: Добавить обработку loading/error для реального API.
      // const response = await axios.put('/api/users/profile', data);
      // setUser(response.data);
    } catch (error) {
      throw new Error('Profile update failed');
    }
  };

  const deleteAccount = async () => {
    try {
      // TODO: Здесь сейчас используются мок-данные; нужно заменить на fetch/axios-запрос к эндпоинту '/api/users/me'.
      // TODO: Добавить обработку loading/error для реального API.
      // await axios.delete('/api/users/me');
      logout();
    } catch (error) {
      throw new Error('Account deletion failed');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        isMockUser,
        isMockAdmin,
        login, 
        register,
        logout,
        mockLogin,
        mockAdminLogin,
        updateProfile,
        deleteAccount
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