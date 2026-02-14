import { api } from '@/src/shared/api/client';
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
};
