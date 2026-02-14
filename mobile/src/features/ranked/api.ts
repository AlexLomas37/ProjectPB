import { RankedSession, Game, GameResult } from './types';
import { SupportedGame } from '@/src/shared/types';

let MOCK_SESSIONS: RankedSession[] = [
    {
        id: 'session-1',
        game: 'LEAGUE_OF_LEGENDS',
        startTime: Date.now() - 86400000,
        endTime: Date.now() - 80000000,
        status: 'COMPLETED',
        startLp: 50,
        currentLp: 75,
        games: [
            {
                id: 'g1',
                timestamp: Date.now() - 85000000,
                champion: 'Lee Sin',
                result: 'WIN',
                kills: 12,
                deaths: 2,
                assists: 8,
                lpChange: 25
            },
            {
                id: 'g2',
                timestamp: Date.now() - 82000000,
                champion: 'Viego',
                result: 'LOSS',
                kills: 5,
                deaths: 5,
                assists: 5,
                lpChange: -15 // Loss mitigation?
            }
        ]
    }
];

// Helper to simulate a "current" session persisted in memory
let ACTIVE_SESSION: RankedSession | null = null;

export const RankedService = {
    getActiveSession: async (): Promise<RankedSession | null> => {
        if (!ACTIVE_SESSION) return null;
        return { ...ACTIVE_SESSION, games: [...ACTIVE_SESSION.games] };
    },

    getHistory: async (): Promise<RankedSession[]> => {
        // Return all sessions that are NOT the active one
        return [...MOCK_SESSIONS];
    },

    getSessionById: async (id: string): Promise<RankedSession | null> => {
        if (ACTIVE_SESSION && ACTIVE_SESSION.id === id) {
            return { ...ACTIVE_SESSION, games: [...ACTIVE_SESSION.games] };
        }
        const session = MOCK_SESSIONS.find(s => s.id === id);
        return session ? { ...session, games: [...session.games] } : null;
    },

    startSession: async (startLp: number, game: SupportedGame = 'LEAGUE_OF_LEGENDS'): Promise<RankedSession> => {
        if (ACTIVE_SESSION) return { ...ACTIVE_SESSION };

        const newSession: RankedSession = {
            id: Math.random().toString(),
            game,
            startTime: Date.now(),
            status: 'ACTIVE',
            startLp,
            currentLp: startLp,
            games: []
        };
        ACTIVE_SESSION = newSession;
        return { ...newSession };
    },

    endSession: async (): Promise<void> => {
        if (ACTIVE_SESSION) {
            ACTIVE_SESSION.endTime = Date.now();
            ACTIVE_SESSION.status = 'COMPLETED';
            MOCK_SESSIONS = [ACTIVE_SESSION, ...MOCK_SESSIONS]; // Add to history
            ACTIVE_SESSION = null;
        }
    },

    addGame: async (game: Omit<Game, 'id' | 'timestamp'>): Promise<RankedSession> => {
        if (!ACTIVE_SESSION) {
            throw new Error('No active session');
        }

        const newGame: Game = {
            ...game,
            id: Math.random().toString(),
            timestamp: Date.now()
        };

        // Mutation for persistence
        ACTIVE_SESSION.games.push(newGame);
        ACTIVE_SESSION.currentLp += game.lpChange;

        // Return NEW reference for React
        return {
            ...ACTIVE_SESSION,
            games: [...ACTIVE_SESSION.games]
        };
    },

    getGameById: async (gameId: string): Promise<Game | null> => {
        // Check active session
        if (ACTIVE_SESSION) {
            const game = ACTIVE_SESSION.games.find(g => g.id === gameId);
            if (game) return { ...game, comments: game.comments ? [...game.comments] : [] };
        }
        // Check history
        for (const session of MOCK_SESSIONS) {
            const game = session.games.find(g => g.id === gameId);
            if (game) return { ...game, comments: game.comments ? [...game.comments] : [] };
        }
        return null;
    },

    updateGame: async (gameId: string, updates: Partial<Game>): Promise<void> => {
        let targetSession: RankedSession | null = null;
        if (ACTIVE_SESSION && ACTIVE_SESSION.games.find(g => g.id === gameId)) {
            targetSession = ACTIVE_SESSION;
        } else {
            targetSession = MOCK_SESSIONS.find(s => s.games.find(g => g.id === gameId)) || null;
        }

        if (!targetSession) throw new Error('Game not found');

        // Check if LP changed
        const originalGame = targetSession.games.find(g => g.id === gameId);
        const originalLp = originalGame?.lpChange || 0;
        const newLp = updates.lpChange !== undefined ? updates.lpChange : originalLp;
        const lpParamsDiff = newLp - originalLp;

        targetSession.games = targetSession.games.map(g => {
            if (g.id === gameId) {
                return { ...g, ...updates };
            }
            return g;
        });

        // Update Session Total LP if LP changed
        if (lpParamsDiff !== 0) {
            targetSession.currentLp += lpParamsDiff;
        }

        // Force update if it's active
        if (ACTIVE_SESSION && targetSession === ACTIVE_SESSION) {
            ACTIVE_SESSION = { ...targetSession };
        }
    },

    addComment: async (gameId: string, text: string): Promise<Game> => {
        let targetSession: RankedSession | null = null;
        let gameIndex = -1;

        if (ACTIVE_SESSION) {
            gameIndex = ACTIVE_SESSION.games.findIndex(g => g.id === gameId);
            if (gameIndex !== -1) targetSession = ACTIVE_SESSION;
        }

        if (!targetSession) {
            targetSession = MOCK_SESSIONS.find(s => s.games.some(g => g.id === gameId)) || null;
            if (targetSession) {
                gameIndex = targetSession.games.findIndex(g => g.id === gameId);
            }
        }

        if (!targetSession || gameIndex === -1) throw new Error('Game not found');

        const game = targetSession.games[gameIndex];
        const newComment = { id: Math.random().toString(), text, createdAt: Date.now() };
        const updatedGame = {
            ...game,
            comments: game.comments ? [...game.comments, newComment] : [newComment]
        };

        targetSession.games[gameIndex] = updatedGame;

        // Force refresh
        if (ACTIVE_SESSION && targetSession === ACTIVE_SESSION) {
            ACTIVE_SESSION = { ...targetSession, games: [...targetSession.games] };
        }

        return updatedGame;
    },

    // For deleting a game if entered incorrectly (undo)
    deleteGame: async (gameId: string): Promise<RankedSession> => {
        let targetSession = ACTIVE_SESSION;
        if (!targetSession || !targetSession.games.find(g => g.id === gameId)) {
            targetSession = MOCK_SESSIONS.find(s => s.games.find(g => g.id === gameId)) || null;
        }

        if (!targetSession) throw new Error('Game or Session not found');

        const game = targetSession.games.find(g => g.id === gameId);
        if (game) {
            // Revert LP changes if needed - this is tricky if we just delete from history, but let's assume simple subtraction
            targetSession.currentLp -= game.lpChange;
            targetSession.games = targetSession.games.filter(g => g.id !== gameId);
        }

        if (ACTIVE_SESSION && targetSession.id === ACTIVE_SESSION.id) {
            ACTIVE_SESSION = { ...targetSession, games: [...targetSession.games] };
            return { ...ACTIVE_SESSION };
        }

        // If history, just return it
        return { ...targetSession };
    },

    deleteSession: async (sessionId: string): Promise<void> => {
        if (ACTIVE_SESSION && ACTIVE_SESSION.id === sessionId) {
            ACTIVE_SESSION = null;
        } else {
            MOCK_SESSIONS = MOCK_SESSIONS.filter(s => s.id !== sessionId);
        }
    },

    deleteComment: async (gameId: string, commentId: string): Promise<Game> => {
        let targetSession = ACTIVE_SESSION;
        let game = targetSession?.games.find(g => g.id === gameId);

        if (!game) {
            targetSession = MOCK_SESSIONS.find(s => s.games.some(g => g.id === gameId)) || null;
            game = targetSession?.games.find(g => g.id === gameId);
        }

        if (!targetSession || !game) throw new Error('Game not found');

        const updatedGame = {
            ...game,
            comments: game.comments?.filter(c => c.id !== commentId) || []
        };

        targetSession.games = targetSession.games.map(g => g.id === gameId ? updatedGame : g);

        if (ACTIVE_SESSION && targetSession.id === ACTIVE_SESSION.id) {
            ACTIVE_SESSION = { ...targetSession };
        }

        return updatedGame;
    },

    editComment: async (gameId: string, commentId: string, text: string): Promise<Game> => {
        let targetSession = ACTIVE_SESSION;
        let game = targetSession?.games.find(g => g.id === gameId);

        if (!game) {
            targetSession = MOCK_SESSIONS.find(s => s.games.some(g => g.id === gameId)) || null;
            game = targetSession?.games.find(g => g.id === gameId);
        }

        if (!targetSession || !game) throw new Error('Game not found');

        const updatedGame = {
            ...game,
            comments: game.comments?.map(c => c.id === commentId ? { ...c, text } : c) || []
        };

        targetSession.games = targetSession.games.map(g => g.id === gameId ? updatedGame : g);

        if (ACTIVE_SESSION && targetSession.id === ACTIVE_SESSION.id) {
            ACTIVE_SESSION = { ...targetSession };
        }

        return updatedGame;
    }
};
