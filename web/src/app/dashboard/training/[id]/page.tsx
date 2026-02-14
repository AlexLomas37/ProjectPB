'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGame } from '@/features/game/context';
import { Card, Button, Input } from '@/shared/components/ui';
import { ChevronLeft, Play, Square, Trophy, Activity, Target, Clock, AlertCircle, Dumbbell, Save, TrendingUp, ChevronRight, CheckCircle2, ListTodo, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi, Workout, TrainingSession } from '@/features/dashboard/api';

export default function TrainingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { selectedGame } = useGame();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [history, setHistory] = useState<TrainingSession[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'ACTIVE' | 'SUMMARY'>('IDLE');
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  
  // Stats entry state: { [exId]: { [metricLabel]: value } }
  const [sessionStats, setSessionStats] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (id) {
        dashboardApi.getWorkoutById(id as string)
            .then(data => {
                setWorkout(data);
                // Fetch history for this workout
                dashboardApi.getTrainingSessions().then(sessions => {
                    setHistory(sessions.filter(s => s.workoutId === id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                });
            })
            .catch(err => console.error("Failed to fetch workout", err));
    }
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'ACTIVE') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  if (!workout) return <div className="p-8 text-center text-slate-500 font-black uppercase tracking-widest">Chargement...</div>;

  const currentEx = (workout.exercises || [])[currentExIndex];

  const handleNextEx = () => {
    if (currentExIndex < (workout?.exercises || []).length - 1) {
      setCurrentExIndex(currentExIndex + 1);
    } else {
      setStatus('SUMMARY');
    }
  };

  const updateStat = (metricLabel: string, val: string) => {
    if (!currentEx?.id) return;
    setSessionStats(prev => ({
      ...prev,
      [currentEx.id]: { ...(prev[currentEx.id] || {}), [metricLabel]: val }
    }));
  };

  const handleSaveSession = async () => {
    if (!workout) return;
    
    const logs = Object.entries(sessionStats).map(([exId, metrics]) => ({
        exerciseId: exId,
        metrics: metrics,
        timestamp: new Date().toISOString()
    }));

    const session: TrainingSession = {
        gameId: workout.gameId,
        workoutId: workout.id!,
        title: workout.title,
        date: new Date().toISOString(),
        duration: formatTime(timer),
        logs: logs,
        status: 'COMPLETED'
    };

    try {
        await dashboardApi.createTrainingSession(session);
        alert('Session enregistrée avec succès !');
        router.push('/dashboard/training');
    } catch (error) {
        console.error("Failed to save session", error);
        alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async () => {
    if (!workout?.id) return;
    if (confirm('Voulez-vous vraiment supprimer cet entraînement ?')) {
        try {
            await dashboardApi.deleteWorkout(workout.id);
            router.push('/dashboard/training');
        } catch (error) {
            console.error("Failed to delete workout", error);
        }
    }
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2, '0')}:${(s%60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="icon">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-black italic text-white uppercase">{workout.title}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedGame.displayName} • {workout.category}</p>
          </div>
        </div>
        {status === 'IDLE' && (
          <div className="flex gap-2">
            <Button onClick={handleDelete} variant="outline" className="text-red-500 border-red-900/30 hover:bg-red-900/10 font-black italic uppercase text-xs">
              <Trash2 size={16} className="mr-2" /> SUPPRIMER
            </Button>
            <Button onClick={() => setStatus('ACTIVE')} className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] px-8 font-black italic">
              <Play size={18} className="mr-2" /> LANCER WORKOUT
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {status === 'ACTIVE' ? (
              <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="bg-slate-900 border-[var(--primary-color)] p-8 space-y-8 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-widest mb-1">Exercice {currentExIndex + 1}/{(workout?.exercises || []).length}</p>
                      <h2 className="text-3xl font-black text-white italic uppercase">{currentEx?.title || 'Exercice sans titre'}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Temps Global</p>
                      <p className="text-2xl font-black text-white font-mono">{formatTime(timer)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    {(currentEx?.metrics || []).map((m: any) => (
                      <Input 
                        key={m.label}
                        label={`${m.label} (${m.unit})`}
                        type="number"
                        placeholder="0"
                        value={sessionStats[currentEx?.id || '']?.[m.label] || ''}
                        onChange={e => updateStat(m.label, e.target.value)}
                        className="bg-slate-900 border-slate-800 text-xl font-black italic h-14 text-center"
                      />
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleNextEx} className="bg-[var(--primary-color)] font-black italic px-10 h-14 text-lg">
                      {currentExIndex < (workout?.exercises || []).length - 1 ? 'EXERCICE SUIVANT' : 'TERMINER LE WORKOUT'}
                      <ChevronRight size={20} className="ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : status === 'SUMMARY' ? (
              <motion.div key="summary" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-slate-900 border-emerald-500/30 p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase">Workout Terminé !</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Récapitulatif des performances</p>
                  </div>

                  <div className="space-y-4">
                    {(workout?.exercises || []).map((ex: any) => (
                      <div key={ex.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                        <span className="font-bold text-slate-300 uppercase italic text-sm">{ex.title}</span>
                        <div className="flex gap-4">
                          {(ex.metrics || []).map((m: any) => (
                            <div key={m.label} className="text-right">
                              <p className="text-[9px] font-black text-slate-500 uppercase">{m.label}</p>
                              <p className="text-sm font-black text-white italic">{sessionStats[ex.id]?.[m.label] || '--'} <span className="text-[10px] opacity-50">{m.unit}</span></p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 flex gap-4">
                    <Button variant="outline" onClick={() => setStatus('IDLE')} className="flex-1 h-14 font-black italic">ANNULER</Button>
                    <Button onClick={handleSaveSession} className="flex-1 h-14 bg-emerald-600 border-emerald-500 font-black italic text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">ENREGISTRER LE BILAN</Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <Card className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-2xl border border-[var(--primary-color)]/20">
                      <Dumbbell size={32} />
                    </div>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-black px-3 py-1.5 rounded-lg border border-slate-700 uppercase tracking-widest">DRILL</span>
                  </div>
                  <p className="text-slate-400 italic font-medium bg-slate-950/50 p-4 rounded-xl border border-slate-800 leading-relaxed">"{workout?.description || 'Aucune description fournie.'}"</p>
                  
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ListTodo size={14} /> Exercices du programme
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {(workout?.exercises || []).map((ex: any, i: number) => (
                        <div key={ex.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-600 italic">#{i+1}</span>
                            <span className="font-bold text-slate-200 uppercase italic text-sm">{ex.title}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-950 px-2 py-1 rounded border border-slate-800">{ex.duration} MIN</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="bg-indigo-950/10 border-indigo-500/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5"><TrendingUp size={80} /></div>
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0"><AlertCircle size={24} /></div>
              <div className="space-y-1">
                <p className="font-black text-indigo-400 text-[10px] uppercase tracking-widest">Session Insight</p>
                <p className="text-xs text-slate-300 font-medium italic">Complétez chaque exercice pour voir votre progression globale sur ce programme.</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Clock size={14} /> Historique des sessions
            </h3>
            <div className="space-y-3">
              {(history || []).length > 0 ? (
                history.map((session, i) => (
                  <div key={session.id || i} className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-tighter">
                        {session.date ? new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Date inconnue'}
                      </p>
                      <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{session.duration || '--'}</span>
                    </div>
                    <div className="space-y-1.5">
                      {(session.logs || []).slice(0, 2).map((log: any, j: number) => {
                        const ex = (workout?.exercises || []).find(e => e.id === log.exerciseId);
                        return (
                          <div key={j} className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-500 font-bold truncate max-w-[100px]">{ex?.title || 'Exercice'}</span>
                            <div className="flex gap-2">
                              {log.metrics && Object.entries(log.metrics).map(([k, v]: any) => (
                                <span key={k} className="text-slate-300 font-black italic">{v} <span className="opacity-50 text-[7px] uppercase">{k}</span></span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {(session.logs || []).length > 2 && <p className="text-[8px] text-slate-600 font-black text-center pt-1">+ {session.logs.length - 2} AUTRES</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-800/50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Aucune session</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
