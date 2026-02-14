import { api } from '@/shared/api/client';
import { GameConfig, SupportedGame } from './context';

export const gameApi = {
  getAll: async (): Promise<GameConfig[]> => {
    const response = await api.get<GameConfig[]>('/game-configs');
    return response.data;
  },

  getByGame: async (dbId: string): Promise<GameConfig> => {
    const response = await api.get<GameConfig>(`/game-configs/${dbId}`);
    return response.data;
  },

  save: async (config: GameConfig): Promise<GameConfig> => {
    const response = await api.post<GameConfig>('/game-configs', config);
    return response.data;
  },

  delete: async (dbId: string): Promise<void> => {
    await api.delete(`/game-configs/${dbId}`);
  }
};
