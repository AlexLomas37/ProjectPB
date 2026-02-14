import { SupportedGame } from '@/src/shared/types';

export type VodType = 'YOUTUBE' | 'TWITCH' | 'REPLAY' | 'OTHER';

export interface Comment {
    id: string;
    timestampSeconds: number; // e.g., 90 for 1m30s
    text: string;
    createdAt: number;
}

export interface Vod {
    id: string;
    title: string;
    game: SupportedGame;
    type: VodType;
    url?: string; // Optional for Replay Mode
    thumbnailUrl?: string; // Auto-generated for YT, or placeholder
    date: number; // created at
    comments: Comment[];
}
