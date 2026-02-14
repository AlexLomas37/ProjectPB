import { SupportedGame } from '@/src/shared/types';
export type GameResult = 'WIN' | 'LOSS' | 'REMAKE';

export interface GameComment {
    id: string;
    text: string;
    createdAt: number;
}

export interface Game {
    id: string;
    timestamp: number;
    champion: string;
    result: GameResult;
    kills: number;
    deaths: number;
    assists: number;
    lpChange: number;
    notes?: string;
    comments?: GameComment[];
}

export interface RankedSession {
    id: string;
    game: SupportedGame;
    startTime: number;
    endTime?: number;
    games: Game[];
    startLp: number;
    currentLp: number;
    targetLp?: number;
    status: 'ACTIVE' | 'COMPLETED';
}
