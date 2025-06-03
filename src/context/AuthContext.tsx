// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import type { UserProfileResponse, AdminProfileResponse } from '../types/index.ts';
import type { AxiosError } from 'axios';

//
// Обновляем интерфейс контекста: добавляем role и mockAdminLogin
//
interface AuthContextType {
  user: (UserProfileResponse | AdminProfileResponse) | null;
  loading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  register: (userName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  mockAdminLogin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Пользователь может быть либо “обычным” UserProfileResponse, либо AdminProfileResponse
  const [user, setUser] = useState<(UserProfileResponse | AdminProfileResponse) | null>(null);
  const [loading, setLoading] = useState(true);

  // При первом монтировании пытаемся подгрузить профиль (если уже есть кука)
  useEffect(() => {
    (async () => {
      try {
        const resp = await usersApi.getProfile();
        // Предполагаем, что сервер отдаёт UserProfileResponse, у которого может не быть поля `role`
        setUser(resp.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Обычная авторизация (через бэкенд)
  const login = async (userName: string, password: string) => {
    try {
      // Шлём request на /api/users/login
      await usersApi.login({ userName, password });
      // Ждём чуть-чуть, чтобы cookie установилась
      await new Promise(resolve => setTimeout(resolve, 100));
      // После этого делаем запрос профиля
      const resp = await usersApi.getProfile();
      setUser(resp.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
          axiosError.response?.data?.message ||
          'Не удалось выполнить вход. Проверьте данные и повторите попытку'
      );
    }
  };

  // Регистрация
  const register = async (userName: string, email: string, password: string) => {
    await usersApi.register({ userName, email, password });
    // После регистрации можно перейти на страницу логина, если нужно
  };

  // Выход
  const logout = () => {
    usersApi.logout();
    setUser(null);
  };

  // “Фейковый” вход администратора — просто притворяемся, что сервер ответил, и вручную задаём роль = 'ADMIN'
  const mockAdminLogin = () => {
    // Здесь создадим минимальный “AdminProfileResponse”:
    // у него должны быть все поля UserProfileResponse + поле role: string
    const fakeAdmin: AdminProfileResponse = {
      id: '00000000-0000-0000-0000-000000000000',
      userName: 'administrator',
      email: 'administrator@example.com',
      role: 'ADMIN',
      projects: [] // пустой список проектов, он может заполняться при запросах
    };
    setUser(fakeAdmin);
  };

  return (
      <AuthContext.Provider value={{ user, loading, login, register, logout, mockAdminLogin }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
