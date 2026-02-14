import { SupportedGame } from '@/src/shared/types';

export type StatType = 'RATIO' | 'SCORE' | 'PERCENTAGE';

export interface ExerciseStat {
    id: string;
    type: StatType;
    label: string; // User defined name, e.g. "Kill Participation"
    unit: string; // e.g. "%"
}

export interface Exercise {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    repetitions?: number;
    videoUrl?: string; // Optional link to a tutorial
    stats?: ExerciseStat[];
}

export interface Workout {
    id: string;
    game: SupportedGame;
    title: string;
    description: string;
    category: 'Warmup' | 'Training';
    duration: number; // Total duration in minutes
    exercises: Exercise[];
    tags: string[]; // e.g., "Aim", "Mechanics", "Macro"
}

export interface ExerciseLog {
    exerciseId: string;
    completed: boolean;
    actualDuration: number; // minutes
    notes?: string;
    score?: number; // e.g. 25/30 bots
    recordedStats?: Record<number, Record<string, string>>;
}

export interface TrainingSession {
    id: string;
    workoutId: string;
    date: string; // ISO string
    duration: number; // Total minutes
    logs: ExerciseLog[];
    status: 'COMPLETED' | 'ABORTED';
}
