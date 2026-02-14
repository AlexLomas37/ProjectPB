'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalStorageService } from '@/shared/api/localStorage';
import { gameApi } from './api';
import { useAuth } from '@/features/auth/context';
import { userApi, UserConfig } from '@/features/user/api';

// Types simplified from mobile/src/shared/types.ts & mobile/src/features/game/context.tsx
export type SupportedGame = string;

export interface GameConfig {
  id: string; // Database UUID
  game: string; // Internal ID (e.g. VALORANT)
  displayName: string;
  colors: {
    primary: string;
    background: string;
    headerFooter: string;
  };
  terminology: {
    points: string;
    rank: string;
  };
  assets: {
    logoUrl?: string;
  };
  ranks: { name: string; iconUrl?: string }[];
  maps: any[];
  agents: any[];
  metrics: any[];
  hidden: boolean;
  features: {
    hasAgent: boolean;
    hasMap: boolean;
    hasKDA: boolean;
    hasScore: boolean;
    hasMental: boolean;
    hasPerformance: boolean;
  };
}

interface GameContextType {
  selectedGameId: string; // Database ID
  selectedGame: GameConfig;
  setSelectedGameId: (id: string) => void;
  configs: Record<string, GameConfig>;
  updateGameConfig: (id: string, config: Partial<GameConfig>) => void;
  userHiddenGames: string[];
  toggleUserGameVisibility: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const EMPTY_GAME: GameConfig = {
  id: '',
  game: '',
  displayName: 'Aucun jeu',
  colors: { primary: '#6366f1', background: '#0f172a', headerFooter: '#1e293b' },
  terminology: { points: 'Points', rank: 'Rank' },
  assets: { logoUrl: '' },
  ranks: [],
  maps: [],
  agents: [],
  metrics: [],
  hidden: false,
  features: { hasAgent: false, hasMap: false, hasKDA: false, hasScore: false, hasMental: false, hasPerformance: false }
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [configs, setConfigs] = useState<Record<string, GameConfig>>({});
  const [userHiddenGames, setUserHiddenGames] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Load game configs
      gameApi.getAll().then((apiConfigs) => {
        if (apiConfigs && apiConfigs.length > 0) {
          const newConfigs: Record<string, GameConfig> = {};
          apiConfigs.forEach(c => {
            newConfigs[c.id] = c;
          });
          setConfigs(newConfigs);
          
          // Select last game from local storage (this can stay in LS as it's purely UI preference)
          const lastGame = LocalStorageService.get<string>(`selected_game_${user.id}`);
          if (lastGame && newConfigs[lastGame]) {
            setSelectedGameId(lastGame);
          } else {
            setSelectedGameId(apiConfigs[0].id);
          }
        } else {
          setConfigs({});
          setSelectedGameId('');
        }
      }).catch(err => console.error("Failed to load game configs", err));

      // Load user hidden games from DB
      userApi.getConfig().then(config => {
        setUserHiddenGames(config.hiddenGameIds || []);
      }).catch(err => console.error("Failed to load user config", err));

    } else {
      setConfigs({});
      setSelectedGameId('');
      setUserHiddenGames([]);
    }
  }, [isAuthenticated, user?.id]);

  const handleSetSelectedGame = (id: string) => {
    setSelectedGameId(id);
    if (user?.id) {
      LocalStorageService.set(`selected_game_${user.id}`, id);
    }
  };

  const toggleUserGameVisibility = async (id: string) => {
    if (!user?.id) return;
    
    const nextHiddenGames = userHiddenGames.includes(id) 
        ? userHiddenGames.filter(g => g !== id) 
        : [...userHiddenGames, id];
    
    // Optimistic update
    setUserHiddenGames(nextHiddenGames);
    
    try {
        await userApi.saveConfig({
            hiddenGameIds: nextHiddenGames
        });
    } catch (err) {
        console.error("Failed to save user hidden games", err);
        // Optional: revert state on failure
    }
  };

  // Inject colors into CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const game = configs[selectedGameId] || EMPTY_GAME;
    if (game) {
      root.style.setProperty('--primary-color', game.colors.primary);
      root.style.setProperty('--game-bg', game.colors.background);
      root.style.setProperty('--game-hf', game.colors.headerFooter);
    }
  }, [selectedGameId, configs]);

  const updateGameConfig = async (id: string, newConfig: Partial<GameConfig>) => {
    if (!id || !configs[id]) {
      // New game
      const fullConfig = { ...EMPTY_GAME, ...newConfig, id: '' } as GameConfig;
      try {
        const saved = await gameApi.save(fullConfig);
        setConfigs(prev => ({ ...prev, [saved.id]: saved }));
        if (!selectedGameId) setSelectedGameId(saved.id);
        return saved;
      } catch (err) {
        console.error("Failed to create game", err);
        throw err;
      }
    }
    
    // Update existing
    const existing = configs[id];
    const updatedConfig = { ...existing, ...newConfig };
    
    // Optimistic update
    setConfigs(prev => ({ ...prev, [id]: updatedConfig }));
    
    try {
      await gameApi.save(updatedConfig);
    } catch (err) {
      console.error("Failed to save config", err);
      // Revert if needed, or just let it be. Usually good to refresh from API.
      gameApi.getAll().then(apiConfigs => {
        const newConfigs: Record<string, GameConfig> = {};
        apiConfigs.forEach(c => { newConfigs[c.id] = c; });
        setConfigs(newConfigs);
      });
    }
  };

  return (
    <GameContext.Provider value={{
      selectedGameId,
      selectedGame: configs[selectedGameId] || EMPTY_GAME,
      setSelectedGameId: handleSetSelectedGame,
      configs,
      updateGameConfig,
      userHiddenGames,
      toggleUserGameVisibility
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
