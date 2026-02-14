import { api } from '@/shared/api/client';

export interface Workout {
  id?: string;
  userId?: string;
  gameId: string;
  title: string;
  description?: string;
  category: string; // Warmup, Training, etc.
  duration: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  tags: string[];
  exercises: any[];
  notes?: string;
  createdAt?: string;
}

export interface TrainingSession {
  id?: string;
  userId?: string;
  gameId: string;
  workoutId: string;
  title: string;
  date: string; // ISO String
  duration: string;
  logs: any[];
  status: 'COMPLETED' | 'ABORTED';
  notes?: string;
}

export interface RankedSession {
  id?: string;
  userId?: string;
  gameId: string;
  mode: string; // e.g. "Solo/Duo"
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  pointsChange: number; // e.g. +20, -15
  agent?: string;
  map?: string;
  kda?: string;
  score?: string; // "13-11"
  notes?: string;
  date: string;
}

export interface Vod {
  id?: string;
  userId?: string;
  gameId: string;
  title: string;
  url: string;
  duration: string;
  date: string;
  tags: string[];
  isReplay: boolean;
  notes?: string;
  comments?: any[];
  createdAt?: string;
}

export const dashboardApi = {
  // Workouts (Plans/Routines)
  getWorkouts: async (): Promise<Workout[]> => {
    const response = await api.get<Workout[]>('/workouts');
    return response.data;
  },
  getWorkoutById: async (id: string): Promise<Workout> => {
    const response = await api.get<Workout>(`/workouts/${id}`);
    return response.data;
  },
  createWorkout: async (workout: Workout): Promise<Workout> => {
    const response = await api.post<Workout>('/workouts', workout);
    return response.data;
  },
  updateWorkout: async (id: string, workout: Workout): Promise<Workout> => {
    const response = await api.put<Workout>(`/workouts/${id}`, workout);
    return response.data;
  },
  deleteWorkout: async (id: string): Promise<void> => {
    await api.delete(`/workouts/${id}`);
  },

  // Training Sessions (Executions/History)
  getTrainingSessions: async (): Promise<TrainingSession[]> => {
    const response = await api.get<TrainingSession[]>('/training-sessions');
    return response.data;
  },
  getTrainingSessionById: async (id: string): Promise<TrainingSession> => {
    const response = await api.get<TrainingSession>(`/training-sessions/${id}`);
    return response.data;
  },
  createTrainingSession: async (session: TrainingSession): Promise<TrainingSession> => {
    const response = await api.post<TrainingSession>('/training-sessions', session);
    return response.data;
  },
  deleteTrainingSession: async (id: string): Promise<void> => {
    await api.delete(`/training-sessions/${id}`);
  },

  // Ranked
  getRankedSessions: async (): Promise<RankedSession[]> => {
    const response = await api.get<RankedSession[]>('/ranked-sessions');
    return response.data;
  },

  getRankedSessionById: async (id: string): Promise<RankedSession> => {
    const response = await api.get<RankedSession>(`/ranked-sessions/${id}`);
    return response.data;
  },

  createRankedSession: async (session: RankedSession): Promise<RankedSession> => {
    const response = await api.post<RankedSession>('/ranked-sessions', session);
    return response.data;
  },

  updateRankedSession: async (id: string, session: RankedSession): Promise<RankedSession> => {
      const response = await api.put<RankedSession>(`/ranked-sessions/${id}`, session);
      return response.data;
  },

  deleteRankedSession: async (id: string): Promise<void> => {
    await api.delete(`/ranked-sessions/${id}`);
  },

  // VODs
  getVods: async (): Promise<Vod[]> => {
    const response = await api.get<Vod[]>('/vods');
    return response.data;
  },

  getVodById: async (id: string): Promise<Vod> => {
    const response = await api.get<Vod>(`/vods/${id}`);
    return response.data;
  },

  createVod: async (vod: Vod): Promise<Vod> => {
    const response = await api.post<Vod>('/vods', vod);
    return response.data;
  },

  updateVod: async (id: string, vod: Vod): Promise<Vod> => {
    const response = await api.put<Vod>(`/vods/${id}`, vod);
    return response.data;
  },

  deleteVod: async (id: string): Promise<void> => {
    await api.delete(`/vods/${id}`);
  },
};
