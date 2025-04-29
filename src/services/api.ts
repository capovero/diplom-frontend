import axios from 'axios';

// Projects API
export const projectsApi = {
  // Public endpoints
  getAllActive: () => axios.get('/api/projects/active'),
  search: (query: string, page: number) => axios.get(`/api/projects/search?q=${query}&page=${page}`),
  getById: (id: string) => axios.get(`/api/projects/${id}`),
  
  // Authenticated endpoints
  create: (data: FormData) => axios.post('/api/projects', data),
  getPersonal: () => axios.get('/api/projects/personal'),
  delete: (id: string) => axios.delete(`/api/projects/${id}`),
  
  // Admin endpoints
  adminSearch: (query: string, page: number) => axios.get(`/api/admin/projects/search?q=${query}&page=${page}`),
  updateStatus: (id: string, status: string) => axios.patch(`/api/admin/projects/${id}/status`, { status }),
  adminDelete: (id: string) => axios.delete(`/api/admin/projects/${id}`)
};

// Donations API
export const donationsApi = {
  create: (projectId: string, amount: number) => axios.post('/api/donations', { projectId, amount }),
  getForProject: (projectId: string) => axios.get(`/api/donations/project/${projectId}`),
  getPersonal: () => axios.get('/api/donations/personal'),
  
  // Admin endpoints
  adminGetForProject: (projectId: string) => axios.get(`/api/admin/donations/project/${projectId}`),
  adminGetForUser: (userId: string) => axios.get(`/api/admin/donations/user/${userId}`)
};

// Categories API
export const categoriesApi = {
  getAll: () => axios.get('/api/categories'),
  
  // Admin endpoints
  create: (name: string) => axios.post('/api/admin/categories', { name }),
  update: (id: string, name: string) => axios.put(`/api/admin/categories/${id}`, { name }),
  delete: (id: string) => axios.delete(`/api/admin/categories/${id}`)
};

// Reviews API
export const reviewsApi = {
  create: (projectId: string, data: { rating: number; text: string }) => 
    axios.post(`/api/reviews/${projectId}`, data),
  update: (reviewId: string, data: { rating: number; text: string }) => 
    axios.put(`/api/reviews/${reviewId}`, data),
  delete: (reviewId: string) => axios.delete(`/api/reviews/${reviewId}`),
  getForProject: (projectId: string) => axios.get(`/api/reviews/project/${projectId}`)
};

// Updates API
export const updatesApi = {
  create: (projectId: string, data: { title: string; content: string }) => 
    axios.post(`/api/updates/${projectId}`, data),
  getForProject: (projectId: string) => axios.get(`/api/updates/project/${projectId}`),
  update: (updateId: string, data: { title: string; content: string }) => 
    axios.put(`/api/updates/${updateId}`, data),
  
  // Admin endpoints
  adminUpdate: (updateId: string, data: { title: string; content: string }) => 
    axios.put(`/api/admin/updates/${updateId}`, data),
  adminDelete: (updateId: string) => axios.delete(`/api/admin/updates/${updateId}`)
};

// Users API
export const usersApi = {
  getAll: () => axios.get('/api/users'),
  getById: (id: string) => axios.get(`/api/users/${id}`),
  update: (data: { name?: string; email?: string }) => axios.put('/api/users/profile', data),
  delete: () => axios.delete('/api/users/me'),
  
  // Admin endpoints
  adminGetUser: (id: string) => axios.get(`/api/admin/users/${id}`),
  adminDeleteUser: (id: string) => axios.delete(`/api/admin/users/${id}`)
};

// Configure axios defaults
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);