'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/features/game/context';
import { Card, Button, Input } from '@/shared/components/ui';
import { ChevronLeft, Save, Video, Link as LinkIcon, Tag, Plus, Trash2, MonitorOff } from 'lucide-react';
import { dashboardApi, Vod } from '@/features/dashboard/api';

export default function CreateVodPage() {
  const router = useRouter();
  const { selectedGame, selectedGameId } = useGame();
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('00:00');
  const [isReplay, setIsReplay] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    // We could fetch tags from API if we had an endpoint, otherwise use defaults
    const allTags = new Set<string>(['Ranked', 'Scrim', 'Strategy', 'Macro', 'Mechanics', 'Communication']);
    selectedGame.maps?.forEach(m => allTags.add(m.name));
    setAvailableTags(Array.from(allTags).sort());
  }, [selectedGame]);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setNewTag('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  const filteredSuggestions = availableTags.filter(t => 
    t.toLowerCase().includes(newTag.toLowerCase()) && !tags.includes(t)
  ).slice(0, 5);

  const handleSave = async () => {
    if (!title || (!isReplay && !url)) {
      alert('Veuillez remplir au moins le titre et le lien (ou activer le mode Replay).');
      return;
    }

    const newVod: Vod = {
      gameId: selectedGameId,
      title,
      url: isReplay ? '' : url,
      duration,
      date: new Date().toLocaleDateString('fr-FR'),
      tags,
      isReplay,
      notes: '' // Placeholder for comments or long description
    };

    try {
      await dashboardApi.createVod(newVod);
      router.push('/dashboard/vod');
    } catch (error) {
      console.error("Failed to save VOD", error);
      alert("Erreur lors de l'enregistrement de la VOD");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="icon">
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Ajouter une review</h1>
      </div>

      <Card className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
          <div className="w-12 h-12 bg-[var(--primary-color)]/20 text-[var(--primary-color)] rounded-lg flex items-center justify-center">
            <Video size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jeu sélectionné</p>
            <p className="font-bold text-white">{selectedGame.displayName}</p>
          </div>
        </div>

        <Input 
          label="Titre de la review" 
          placeholder="Ex: Analyse Match vs Team Liquid" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />

        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
          <div>
            <p className="font-bold text-white">Mode Replay In-Game</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Utilisez ce mode si vous n'avez pas de vidéo (YouTube)</p>
          </div>
          <div 
            onClick={() => setIsReplay(!isReplay)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${isReplay ? 'bg-[var(--primary-color)] shadow-[0_0_10px_var(--primary-color)]/30' : 'bg-slate-700'} cursor-pointer`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isReplay ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        {!isReplay && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <Input 
              label="Lien de la vidéo (YouTube)" 
              placeholder="https://www.youtube.com/watch?v=..." 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              icon={<LinkIcon size={16} />}
            />
            <Input 
              label="Durée estimée" 
              placeholder="Ex: 35:10" 
              value={duration} 
              onChange={e => setDuration(e.target.value)} 
            />
          </div>
        )}

        {isReplay && (
          <Input 
            label="Durée de la partie (Replay)" 
            placeholder="Ex: 35:10" 
            value={duration} 
            onChange={e => setDuration(e.target.value)} 
            className="animate-in fade-in slide-in-from-top-2 duration-300"
          />
        )}

        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-400">Tags (Map, Agent, Type...)</label>
          <div className="relative">
            <div className="flex gap-2">
              <Input 
                placeholder="Chercher ou créer un tag..." 
                value={newTag} 
                onChange={e => setNewTag(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && addTag(newTag)}
              />
              <Button onClick={() => addTag(newTag)} variant="outline" size="icon">
                <Plus size={18} />
              </Button>
            </div>
            {newTag && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-10 overflow-hidden">
                {filteredSuggestions.map(s => (
                  <button key={s} onClick={() => addTag(s)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-[var(--primary-color)] transition-colors">{s.toUpperCase()}</button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 bg-slate-950 text-[var(--primary-color)] px-2 py-1 rounded border border-[var(--primary-color)]/30 text-[10px] font-black uppercase">
                {t} <Trash2 size={10} className="ml-1 cursor-pointer hover:text-red-500" onClick={() => removeTag(t)} />
              </span>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <Button onClick={handleSave} className="px-8 font-black italic shadow-[0_0_20px_var(--primary-color)]/20 bg-[var(--primary-color)] border-[var(--primary-color)]">
            <Save size={18} className="mr-2" /> ENREGISTRER LA REVIEW
          </Button>
        </div>
      </Card>
    </div>
  );
}
