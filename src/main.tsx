import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// Настройка базового URL для axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5209';

// Добавление токена в заголовки запросов
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Обработка ошибок ответа
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Вместо прямого перенаправления можно использовать управление состоянием
            // Например, установить флаг isAuthenticated в false
        }
        return Promise.reject(error);
    }
);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Не удалось найти корневой элемент');

const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
