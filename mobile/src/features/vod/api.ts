import { SupportedGame } from '@/src/shared/types';
import { Vod, VodType } from './types';

// Mock Data
let MOCK_VODS: Vod[] = [
    {
        id: '1',
        title: 'Ranked vs Diamond Lee Sin',
        game: 'LEAGUE_OF_LEGENDS',
        type: 'YOUTUBE',
        url: 'https://youtube.com/watch?v=12345',
        date: Date.now() - 10000000,
        comments: [
            { id: 'c1', timestampSeconds: 125, text: 'Bad engage here', createdAt: Date.now() },
        ],
    },
    {
        id: '2',
        title: 'Scrim vs T1',
        game: 'LEAGUE_OF_LEGENDS',
        type: 'REPLAY',
        date: Date.now() - 5000000,
        comments: [],
    },
    {
        id: '3',
        title: 'Valorant Ascent Review',
        game: 'VALORANT',
        type: 'YOUTUBE',
        date: Date.now() - 2000000,
        comments: [],
    }
];

export const VodService = {
    getVods: async (): Promise<Vod[]> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [...MOCK_VODS];
    },

    addVod: async (title: string, type: VodType, game: SupportedGame, url?: string): Promise<Vod> => {
        const newVod: Vod = {
            id: Math.random().toString(),
            title,
            game,
            type,
            url,
            date: Date.now(),
            comments: [],
        };
        MOCK_VODS = [newVod, ...MOCK_VODS];
        return newVod;
    },

    addComment: async (vodId: string, timestampSeconds: number, text: string) => {
        const vod = MOCK_VODS.find((v) => v.id === vodId);
        if (vod) {
            vod.comments.push({
                id: Math.random().toString(),
                timestampSeconds,
                text,
                createdAt: Date.now(),
            });
        }
    },

    deleteComment: async (vodId: string, commentId: string) => {
        const vod = MOCK_VODS.find((v) => v.id === vodId);
        if (vod) {
            vod.comments = vod.comments.filter((c) => c.id !== commentId);
        }
    },

    updateComment: async (vodId: string, commentId: string, text: string) => {
        const vod = MOCK_VODS.find((v) => v.id === vodId);
        if (vod) {
            const comment = vod.comments.find((c) => c.id === commentId);
            if (comment) {
                comment.text = text;
            }
        }
    },

    deleteVod: async (vodId: string) => {
        MOCK_VODS = MOCK_VODS.filter((v) => v.id !== vodId);
    },

    updateVod: async (vodId: string, title: string) => {
        const vod = MOCK_VODS.find((v) => v.id === vodId);
        if (vod) {
            vod.title = title;
        }
    }
};
