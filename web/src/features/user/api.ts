import { api } from '@/shared/api/client';

export interface UserConfig {
    id?: string;
    userId?: string;
    hiddenGameIds: string[];
    config?: Record<string, any>;
}

export const userApi = {
    getConfig: async (): Promise<UserConfig> => {
        try {
            const response = await api.get<UserConfig>('/config');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Return default if not found
                return { hiddenGameIds: [] };
            }
            throw error;
        }
    },

    saveConfig: async (config: UserConfig): Promise<UserConfig> => {
        const response = await api.post<UserConfig>('/config', config);
        return response.data;
    }
};
