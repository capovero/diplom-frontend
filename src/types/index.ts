// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  goalAmount: number;
  collectedAmount: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';
  category: string;
  categoryId: string;
  averageRating: number;
  creator: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Donation types
export interface Donation {
  id: string;
  amount: number;
  projectId: string;
  projectTitle: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
}

// Review types
export interface Review {
  id: string;
  text: string;
  rating: number;
  userId: string;
  userName: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// Update types
export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}