import { api } from '@/shared/api/client';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types';

export const AuthService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await api.post<RegisterResponse>('/auth/register', data);
        return response.data;
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
    },

    getAllUsers: async (): Promise<any[]> => {
        const response = await api.get<any[]>('/users');
        return response.data;
    },

    getUserById: async (id: string): Promise<any> => {
        const response = await api.get<any>(`/users/${id}`);
        return response.data;
    },

    updateUser: async (id: string, updates: any): Promise<any> => {
        const response = await api.put<any>(`/users/${id}`, updates);
        return response.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    // Roles
    getAllRoles: async (): Promise<any[]> => {
        const response = await api.get<any[]>('/roles');
        return response.data;
    },

    createRole: async (name: string): Promise<any> => {
        const response = await api.post<any>('/roles', { name });
        return response.data;
    },

    deleteRole: async (id: string): Promise<void> => {
        await api.delete(`/roles/${id}`);
    }
};
