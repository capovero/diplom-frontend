import axios from 'axios';
import {
    UserResponse,
    UserProfileResponse,
    AdminProfileResponse,
    ProjectResponse,
    ProjectPaginationResponse,
    DonationResponse,
    DonationUser,
    ReviewResponse,
    CategoryDto,
    UpdateResponse
} from '../types/index.ts';

// We no longer need a baseURL here: axios will call "/api/..." which Vite proxies to :5209
axios.defaults.withCredentials = true;

// ==================== Users API ====================
export const usersApi = {
    register: (data: { userName: string; email: string; password: string }) =>
        axios.post<UserResponse>('/api/users/register', data),

    login: (data: { userName: string; password: string }) =>
        axios.post<{ token: string }>('/api/users/login', data),

    logout: () =>
        axios.post('/api/users/logout'),

    getProfile: () =>
        axios.get<UserProfileResponse>('/api/users/me'),

    updateProfile: (data: { userName?: string; email?: string }) =>
        axios.put<UserResponse>('/api/users', data),

    deleteAccount: () =>
        axios.delete<void>('/api/users'),

    // Admin
    getAll: () =>
        axios.get<UserResponse[]>('/api/users'),

    getById: (id: string) =>
        axios.get<AdminProfileResponse>(`/api/users/${id}`),

    deleteById: (id: string) =>
        axios.delete<void>(`/api/users/${id}`),
};

// ==================== Projects API ====================
export const projectsApi = {
    getAll: (
        filter?: { title?: string; categoryId?: number; status?: string },
        pageNumber = 1,
        pageSize = 10
    ) =>
        axios.get<ProjectPaginationResponse>('/api/projects', {
            params: {
                'filter.Title': filter?.title,
                'filter.CategoryId': filter?.categoryId,
                'filter.Status': filter?.status,
                pageNumber,
                pageSize,
            }
        }),

    getById: (id: number) =>
        axios.get<ProjectResponse>(`/api/projects/${id}`,
            // { withCredentials: false }
        ),

    create: (data: FormData) =>
        axios.post<ProjectResponse>('/api/projects', data),

    getMyProjects: () =>
        axios.get<ProjectResponse[]>('/api/projects/my'),

    delete: (id: number) =>
        axios.delete<void>(`/api/projects/${id}`),

    updateStatus: (id: number, dto: { status: number }) =>
        axios.patch<void>(`/api/projects/${id}/status`, dto),

    update: (id: number, formData: FormData) =>
        +    axios.put<ProjectResponse>(`/api/projects/${id}`, formData),
};

// ==================== Donations API ====================
export const donationsApi = {
    create: (projectId: number, amount: number) =>
        axios.post<DonationResponse>('/api/donation/create-donate', null, {
            params: { projectId, amount },
        }),

    getForCreatorProject: (projectId: number) =>
        axios.get<DonationResponse[]>('/api/donation/donations-for-creator-project', {
            params: { projectId },
        }),

    getPersonal: () =>
        axios.get<DonationUser[]>('/api/donation/personal-donations'),

    adminGetForProject: (projectId: number) =>
        axios.get<DonationResponse[]>('/api/donation/admin-get-project-donations', {
            params: { projectId },
        }),

    adminGetForUser: (userId: string) =>
        axios.get<DonationUser[]>('/api/donation/personal-donations-user-for-admin', {
            params: { userId },
        }),
};

// ==================== Reviews API ====================
export const reviewsApi = {
    create: (review: { projectId: number; rating: number; comment: string }) =>
        axios.post<ReviewResponse>('/api/reviews/createReview', review),

    update: (reviewId: number, update: { rating: number; comment: string }) =>
        axios.put<void>('/api/reviews/updateReview', update, {
            params: { productId: reviewId },
        }),

    delete: (reviewId: number) =>
        axios.delete<void>('/api/reviews/deleteReview', {
            params: { productId: reviewId },
        }),

    getByProject: (projectId: number) =>
        axios.get<ReviewResponse[]>('/api/reviews/one-project-reviews', {
            params: { projectId },
        }),
};

// ==================== Categories API ====================
export const categoriesApi = {
    // получить список всех категорий
    getAll: () =>
        axios.get<CategoryDto[]>('/api/categories/getAll'),

    // создать новую категорию (JSON: { name })
    create: (name: string) =>
        axios.post<CategoryDto>(
            '/api/categories/create',
            { name }   // теперь отправляем { "name": "..." }

        ),


    update: (id: number, name: string) =>
        axios.put<CategoryDto>(
            `/api/categories/update?id=${id}`,
            { name }
        ),

    // удалить категорию по id
    delete: (id: number) =>
        axios.delete<void>(`/api/categories/delete?id=${id}`)
};


// ==================== Updates API ====================
export const updatesApi = {
    create: (dto: { content: string; projectId: number }) =>
        axios.post<UpdateResponse>('/api/update/create-update', dto),

    getByProject: (projectId: number) =>
        axios.get<UpdateResponse[]>('/api/update/get-updates', {
            params: { projectId },
            withCredentials: false,
        }),

    delete: (id: number) =>
        axios.delete<void>(`/api/update/${id}`),

    update: (id: number, dto: { content: string; projectId: number }) =>
        axios.put<UpdateResponse>(`/api/update/${id}`, dto),

    createForAdmin: (dto: { content: string; projectId: number }) =>
        axios.post<UpdateResponse>('/api/update/create-update-for-admin', dto),

    deleteForAdmin: (id: number) =>
        axios.delete<void>('/api/update/delete-update-for-admin', {
            params: { id },
        }),

    updateForAdmin: (id: number, dto: { content: string; projectId: number }) =>
        axios.put<UpdateResponse>('/api/update/update-update-for-admin', dto, {
            params: { id },
        }),
};
