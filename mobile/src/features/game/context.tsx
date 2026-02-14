import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SupportedGame } from '@/src/shared/types';

const GAME_COLORS: Record<SupportedGame, string> = {
    'LEAGUE_OF_LEGENDS': '#3b82f6', // blue-500
    'VALORANT': '#ef4444', // red-500
    'ROCKET_LEAGUE': '#0ea5e9', // sky-500
    'COUNTER_STRIKE': '#a855f7', // purple-500
    'OVERWATCH': '#f97316', // orange-500
    'CALL_OF_DUTY': '#10b981', // emerald-500
    'RAINBOW_SIX_SIEGE': '#facc15', // yellow-400
};

const GAME_BGS: Record<SupportedGame, string> = {
    'LEAGUE_OF_LEGENDS': '#0f172a', // slate-900 
    'VALORANT': '#111827', // gray-900
    'ROCKET_LEAGUE': '#0c4a6e', // sky-900
    'COUNTER_STRIKE': '#2e1065', // violet-950
    'OVERWATCH': '#431407', // orange-950
    'CALL_OF_DUTY': '#064e3b', // emerald-950
    'RAINBOW_SIX_SIEGE': '#422006', // amber-950
};

// Darker version of backgrounds for header/footer contrast
const GAME_HF_BGS: Record<SupportedGame, string> = {
    'LEAGUE_OF_LEGENDS': '#020617', // slate-950
    'VALORANT': '#030712', // gray-950
    'ROCKET_LEAGUE': '#082f49', // sky-950
    'COUNTER_STRIKE': '#1e0a4d', // Deeper purple
    'OVERWATCH': '#2d0e05', // Deeper orange-brown
    'CALL_OF_DUTY': '#022c22', // Deeper green
    'RAINBOW_SIX_SIEGE': '#291404', // Deeper amber
};

interface GameContextType {
    selectedGame: SupportedGame;
    setSelectedGame: (game: SupportedGame) => void;
    visibleGames: SupportedGame[];
    setVisibleGames: (games: SupportedGame[]) => void;
    themeColor: string;
    backgroundColor: string;
    headerFooterColor: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [selectedGame, setSelectedGame] = useState<SupportedGame>('LEAGUE_OF_LEGENDS');
    const [visibleGames, setVisibleGames] = useState<SupportedGame[]>([
        'LEAGUE_OF_LEGENDS', 'VALORANT', 'ROCKET_LEAGUE',
        'CALL_OF_DUTY', 'COUNTER_STRIKE', 'RAINBOW_SIX_SIEGE', 'OVERWATCH'
    ]);

    const themeColor = GAME_COLORS[selectedGame] || '#3b82f6';
    const backgroundColor = GAME_BGS[selectedGame] || '#111827';
    const headerFooterColor = GAME_HF_BGS[selectedGame] || '#030712';

    return (
        <GameContext.Provider value={{
            selectedGame,
            setSelectedGame,
            visibleGames,
            setVisibleGames,
            themeColor,
            backgroundColor,
            headerFooterColor
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
