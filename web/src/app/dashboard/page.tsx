'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/shared/components/ui';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LocalStorageService } from '@/shared/api/localStorage';
import { useGame } from '@/features/game/context';

export default function DashboardPage() {
  const { selectedGameId, selectedGame } = useGame();
  const [stats, setStats] = useState({
    totalGames: 0,
    winRate: 0,
    avgScore: 0,
    timePlayed: '0h'
  });

  useEffect(() => {
    // In a real app, we would fetch games for the specific gameId
    const allGames = LocalStorageService.get<any[]>('ranked_games') || [];
    const games = allGames.filter(g => g.gameId === selectedGameId);
    
    const sessions = (LocalStorageService.get<any[]>('sessions') || []).filter(s => s.gameId === selectedGameId);
    
    setStats({
      totalGames: games.length || (selectedGameId === 'VALORANT' ? 12 : 8), // Default mocks if empty
      winRate: selectedGameId === 'VALORANT' ? 58 : 52,
      avgScore: selectedGameId === 'VALORANT' ? 2450 : 180,
      timePlayed: selectedGameId === 'VALORANT' ? '24h' : '12h'
    });
  }, [selectedGameId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-500 border border-slate-700 italic">Page fictive</span>
          </div>
          <p className="text-slate-400">Aperçu de vos performances sur <span className="text-[var(--primary-color)] font-bold">{selectedGame.displayName}</span>.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Parties jouées', value: stats.totalGames, icon: Trophy, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Taux de victoire', value: `${stats.winRate}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Score moyen', value: stats.avgScore, icon: Target, color: 'text-[var(--primary-color)]', bg: 'bg-[var(--primary-color)]/10' },
          { label: 'Temps de jeu', value: stats.timePlayed, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="flex items-center space-x-4 border-slate-800">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-white">Activités récentes</h3>
            <Button variant="ghost" className="text-sm">Voir tout</Button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                  <Zap size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">Session d'entraînement terminée</p>
                  <p className="text-xs text-slate-500 italic">Il y a {i + 1} heures • Focus : Aim & Movement</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">+45 XP</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Goals / Tasks */}
        <Card className="border-slate-800">
          <h3 className="font-bold text-lg text-white mb-6">Objectifs hebdo</h3>
          <div className="space-y-6">
            {[
              { label: 'Parties Classées', current: 12, target: 20 },
              { label: 'Entraînement Aim', current: 5, target: 10 },
              { label: 'VOD Reviews', current: 2, target: 5 },
            ].map((goal) => (
              <div key={goal.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-300">{goal.label}</span>
                  <span className="text-slate-500">{goal.current}/{goal.target}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-[var(--primary-color)] h-2 rounded-full shadow-[0_0_8px_var(--primary-color)] transition-all duration-500" 
                    style={{ width: `${(goal.current / goal.target) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}