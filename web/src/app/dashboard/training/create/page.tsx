'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/features/game/context';
import { Card, Button, Input, Selector } from '@/shared/components/ui';
import { ChevronLeft, Plus, Trash2, Save, Dumbbell, Clock, Tag, X, ListTodo, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi, Workout } from '@/features/dashboard/api';

interface Metric {
  label: string;
  unit: string;
}

interface Exercise {
  id: string;
  title: string;
  duration: string;
  metrics: Metric[];
}

export default function CreateTrainingPage() {
  const router = useRouter();
  const { selectedGame, selectedGameId } = useGame();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Training');
  const [tags, setTags] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Exercise Modal State
  const [isExModalOpen, setIsExModalOpen] = useState(false);
  const [newEx, setNewEx] = useState<Partial<Exercise>>({
    title: '',
    duration: '5',
    metrics: [{ label: 'Score', unit: 'pts' }]
  });

  const addExercise = () => {
    if (!newEx.title) return;
    const ex: Exercise = {
      id: Date.now().toString(),
      title: newEx.title,
      duration: newEx.duration || '5',
      metrics: newEx.metrics || []
    };
    setExercises([...exercises, ex]);
    setIsExModalOpen(false);
    setNewEx({ title: '', duration: '5', metrics: [{ label: 'Score', unit: 'pts' }] });
  };

  const removeExercise = (id: string) => setExercises(exercises.filter(e => e.id !== id));

  const addMetric = () => {
    setNewEx({ ...newEx, metrics: [...(newEx.metrics || []), { label: '', unit: '' }] });
  };

  const updateMetric = (idx: number, field: keyof Metric, val: string) => {
    const updated = [...(newEx.metrics || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setNewEx({ ...newEx, metrics: updated });
  };

  const handleSave = async () => {
    if (!title || exercises.length === 0) {
      alert('Veuillez entrer un titre et au moins un exercice.');
      return;
    }

    const totalDuration = exercises.reduce((acc, e) => acc + parseInt(e.duration), 0) + 'm';

    const workout: Workout = {
      gameId: selectedGameId,
      title,
      description,
      duration: totalDuration,
      category: category,
      difficulty: 'Moyen', 
      tags: tags.length > 0 ? tags : ['Custom'],
      exercises: exercises,
    };

    try {
        await dashboardApi.createWorkout(workout);
        router.push('/dashboard/training');
    } catch (error) {
        console.error("Failed to create workout", error);
        alert("Erreur lors de la création de l'entraînement");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="icon">
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tight">Créer un Workout</h1>
        </div>
        <Button onClick={handleSave} className="bg-[var(--primary-color)] font-black italic px-8 shadow-[0_0_20px_var(--primary-color)]/20">
          <Save size={18} className="mr-2" /> ENREGISTRER LE WORKOUT
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-6">
            <Input label="Titre du Workout" placeholder="Ex: Routine Aim & Movement" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-[var(--primary-color)] focus:outline-none min-h-[100px]"
                placeholder="Décrivez l'objectif de cette routine..."
              />
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <ListTodo size={14} className="text-[var(--primary-color)]" /> Liste des Exercices
              </h3>
              <span className="text-[10px] font-black bg-slate-800 px-2 py-0.5 rounded text-slate-400">{exercises.length} EXOS</span>
            </div>

            <div className="space-y-3">
              {exercises.map((ex, i) => (
                <div key={ex.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-4 rounded-xl group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 italic border border-slate-700">{i + 1}</div>
                    <div>
                      <p className="font-bold text-white uppercase italic text-sm">{ex.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{ex.duration} MIN • {ex.metrics.length} MÉTRIQUES</p>
                    </div>
                  </div>
                  <button onClick={() => removeExercise(ex.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button 
                onClick={() => setIsExModalOpen(true)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)]/5 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-[var(--primary-color)]"
              >
                <Plus size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Ajouter un exercice</span>
              </button>
            </div>
          </div>
        </div>

        <Card className="h-fit space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-4 italic">Configuration</h3>
          <Selector 
            label="Catégorie" 
            value={category} 
            options={[{name: 'Training'}, {name: 'Warmup'}, {name: 'Mechanics'}]} 
            onChange={setCategory} 
          />
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Durée Totale estimée</p>
            <p className="text-2xl font-black text-white italic">{exercises.reduce((acc, e) => acc + parseInt(e.duration), 0)} <span className="text-xs opacity-50">MIN</span></p>
          </div>
        </Card>
      </div>

      {/* Exercise Builder Modal */}
      <AnimatePresence>
        {isExModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsExModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg">
              <Card className="bg-slate-900 border-slate-700 p-0 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                  <h2 className="text-lg font-black italic text-white uppercase tracking-tight">Nouvel Exercice</h2>
                  <button onClick={() => setIsExModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-6">
                  <Input label="Nom de l'exercice" placeholder="Ex: Gridshot Ultimate" value={newEx.title} onChange={e => setNewEx({...newEx, title: e.target.value})} autoFocus />
                  <Input label="Durée (min)" type="number" value={newEx.duration} onChange={e => setNewEx({...newEx, duration: e.target.value})} />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Données à récolter</label>
                      <button onClick={addMetric} className="text-[10px] font-black text-[var(--primary-color)] uppercase hover:underline">+ Ajouter</button>
                    </div>
                    {newEx.metrics?.map((m, i) => (
                      <div key={i} className="flex gap-2">
                        <Input placeholder="Label (ex: Score)" value={m.label} onChange={e => updateMetric(i, 'label', e.target.value)} className="flex-1" />
                        <Input placeholder="Unité (ex: %)" value={m.unit} onChange={e => updateMetric(i, 'unit', e.target.value)} className="w-24" />
                      </div>
                    ))}
                  </div>

                  <Button onClick={addExercise} className="w-full h-12 bg-[var(--primary-color)] font-black italic uppercase tracking-widest mt-4">AJOUTER À LA LISTE</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}