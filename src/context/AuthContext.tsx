import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import type { UserProfileResponse } from '../types';

interface AuthContextType {
  user: UserProfileResponse | null;
  loading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  register: (userName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // При старте пробуем подтянуть профиль, если есть кука
  useEffect(() => {
    (async () => {
      try {
        const resp = await usersApi.getProfile();
        setUser(resp.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (userName: string, password: string) => {
    try {
      await usersApi.login({ userName, password });

      // Добавить задержку для применения куки
      await new Promise(resolve => setTimeout(resolve, 100));

      const resp = await usersApi.getProfile();
      setUser(resp.data);
    } catch (error) {
      // Обработка ошибок
    }
  };

  const register = async (userName: string, email: string, password: string) => {
    await usersApi.register({ userName, email, password });
    // После регистрации можно сразу залогинить или редирект на логин
  };

  const logout = () => {
    usersApi.logout();
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, loading, login, register, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
