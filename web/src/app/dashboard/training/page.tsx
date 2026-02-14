'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/shared/components/ui';
import { useGame } from '@/features/game/context';
import { Play, Clock, Target, Dumbbell, Plus, Tag, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardApi, Workout } from '@/features/dashboard/api';

export default function TrainingPage() {
  const { selectedGameId } = useGame();
  const [drills, setDrills] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [selectedGameId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getWorkouts();
      // Filter by current game
      const filtered = data.filter(d => d.gameId === selectedGameId);
      setDrills(filtered);
    } catch (error) {
      console.error("Failed to fetch workouts", error);
    } finally {
      setLoading(false);
    }
  };

  const removeDrill = async (id: string) => {
    if (!id) return;
    try {
        await dashboardApi.deleteWorkout(id);
        setDrills(drills.filter(d => d.id !== id));
    } catch (error) {
        console.error("Failed to delete workout", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Entraînement</h1>
          <p className="text-slate-400">Préparez-vous et améliorez vos mécaniques.</p>
        </div>
        <Link href="/dashboard/training/create">
          <Button className="bg-[var(--primary-color)] hover:brightness-110 border-[var(--primary-color)] shadow-[0_0_15px_var(--primary-color)]/30 font-black italic">
            <Plus size={18} className="mr-2" /> AJOUTER UN ENTRAÎNEMENT
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-white">Chargement...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drills.map((drill, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={drill.id || i}
          >
            <Link href={`/dashboard/training/${drill.id}`}>
              <Card className="group hover:border-[var(--primary-color)]/50 transition-all relative overflow-hidden cursor-pointer h-full">
                <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-xl group-hover:scale-110 transition-transform">
                  <Dumbbell size={24} />
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${
                    drill.difficulty === 'Difficile' ? 'bg-red-900/20 text-red-500 border-red-900/50' : 
                    drill.difficulty === 'Moyen' ? 'bg-amber-900/20 text-amber-500 border-amber-900/50' : 
                    'bg-emerald-900/20 text-emerald-500 border-emerald-900/50'
                  }`}>
                    {drill.difficulty}
                  </span>
                  <button onClick={(e) => { e.preventDefault(); removeDrill(drill.id!); }} className="text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--primary-color)] transition-colors">{drill.title}</h3>
              
              <div className="flex items-center gap-4 text-slate-400 text-xs font-bold mb-4">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1.5 text-slate-500" /> {drill.duration}
                </div>
                <div className="flex items-center">
                  <Target size={14} className="mr-1.5 text-slate-500" /> {drill.category}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {drill.tags.map((tag: string) => (
                  <span key={tag} className="flex items-center text-[10px] font-bold bg-slate-900 text-slate-500 px-2 py-1 rounded border border-slate-800">
                    <Tag size={10} className="mr-1" /> {tag.toUpperCase()}
                  </span>
                ))}
              </div>

              <Button variant="outline" className="w-full border-slate-700 group-hover:border-[var(--primary-color)] group-hover:bg-[var(--primary-color)]/10 group-hover:text-[var(--primary-color)] font-bold italic">
                VOIR DÉTAILS
              </Button>
            </Card>
          </Link>
        </motion.div>
      ))}
        
        <Link href="/dashboard/training/create" className="border-2 border-dashed border-slate-800 bg-slate-900/10 rounded-xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-900/20 hover:border-slate-700 hover:text-slate-300 transition-all group min-h-[250px]">
          <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center mb-4 group-hover:border-[var(--primary-color)] group-hover:text-[var(--primary-color)] transition-colors">
            <Plus size={24} />
          </div>
          <p className="font-bold uppercase tracking-widest text-xs">Ajouter un entraînement</p>
        </Link>
      </div>
      )}
    </div>
  );
}