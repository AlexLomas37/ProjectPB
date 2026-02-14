'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/shared/components/ui';
import { useGame } from '@/features/game/context';
import { Play, Calendar, Video, Plus, Search, Tag, Clock, MonitorOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { dashboardApi, Vod } from '@/features/dashboard/api';

export default function VodPage() {
  const { selectedGameId, selectedGame } = useGame();
  const [vods, setVods] = useState<Vod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    fetchVods();
  }, [selectedGameId]);

  const fetchVods = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getVods();
      setVods(data.filter(v => v.gameId === selectedGameId));
    } catch (error) {
      console.error("Failed to fetch vods", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVods = vods.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) || 
    v.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase italic tracking-tighter">VOD Review</h1>
          <p className="text-slate-400 font-medium">Analysez vos performances sur <span className="text-[var(--primary-color)]">{selectedGame.displayName}</span>.</p>
        </div>
        <Link href="/dashboard/vod/create">
          <Button className="bg-[var(--primary-color)] hover:brightness-110 border-[var(--primary-color)] shadow-[0_0_15px_var(--primary-color)]/30 font-black italic">
            <Plus size={18} className="mr-2" /> AJOUTER UNE REVIEW
          </Button>
        </Link>
      </div>

      <Card className="flex flex-col md:flex-row gap-4 items-center justify-between border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Rechercher une review (titre, tag...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          {filteredVods.length} Reviews
        </div>
      </Card>

      {loading ? (
        <div className="text-white">Chargement...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVods.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-800">
            Aucune review trouvée.
          </div>
        ) : (
          filteredVods.map((vod, i) => {
            const ytId = getYoutubeId(vod.url);
            const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={vod.id} 
                className="group cursor-pointer"
              >
                <Link href={`/dashboard/vod/${vod.id}`}>
                  {/* Thumbnail / Placeholder */}
                  <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-4 relative ring-1 ring-slate-800 group-hover:ring-[var(--primary-color)]/50 group-hover:shadow-[0_0_25px_var(--primary-color)]/10 transition-all duration-300">
                    {thumbUrl ? (
                      <img src={thumbUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={vod.title} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 space-y-3">
                        <MonitorOff size={40} className="text-slate-700" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">In-Game Replay Mode</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                        {vod.isReplay ? <Video size={28} /> : <Play size={28} fill="currentColor" className="ml-1" />}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded-md font-black border border-white/10">
                      {vod.duration}
                    </div>
                    {vod.isReplay && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-black text-[8px] px-1.5 py-0.5 rounded font-black">
                        REPLAY
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-start px-1">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-100 group-hover:text-[var(--primary-color)] transition-colors leading-tight tracking-tight">{vod.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {vod.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {vod.isReplay ? 'MANUAL' : 'VIDEO'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 px-1">
                    {vod.tags.map((tag: string) => (
                      <span key={tag} className="flex items-center gap-1 text-[9px] font-black uppercase bg-slate-900 text-slate-400 px-2 py-1 rounded-md border border-slate-800 group-hover:border-slate-700 transition-colors">
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
      )}
    </div>
  );
}