'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input } from '@/shared/components/ui';
import { useGame } from '@/features/game/context';
import { Trophy, Calendar, ChevronRight, Plus, Filter, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi, RankedSession } from '@/features/dashboard/api';

export default function RankedSessionsPage() {
  const { selectedGame, selectedGameId } = useGame();
  const [sessions, setSessions] = useState<RankedSession[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRankSelectorOpen, setIsRankSelectorOpen] = useState(false);
  const rankSelectorRef = useRef<HTMLDivElement>(null);
  const [newSession, setNewSession] = useState({
    rank: '',
    rankIcon: '',
    startLp: '0'
  });

  useEffect(() => {
    fetchSessions();
    if (selectedGame.ranks.length > 0) {
      setNewSession(prev => ({ 
        ...prev, 
        rank: selectedGame.ranks[0].name,
        rankIcon: selectedGame.ranks[0].iconUrl || '' 
      }));
    }
  }, [selectedGameId, selectedGame]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getRankedSessions();
      // Filter by current game and sort by date descending (assuming new ones first)
      const filtered = data
        .filter(s => s.gameId === selectedGameId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSessions(filtered);
    } catch (error) {
      console.error("Failed to fetch ranked sessions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rankSelectorRef.current && !rankSelectorRef.current.contains(event.target as Node)) {
        setIsRankSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateSession = async () => {
    const today = new Date();
    // Using ISO date for backend compatibility
    const dateStr = today.toISOString();
    
    // We can also format the name nicely
    const dateFormatted = today.toLocaleDateString('fr-FR');
    
    const sessionToCreate: RankedSession = {
      gameId: selectedGameId,
      date: dateStr,
      mode: 'Solo/Duo', // Default
      result: 'DRAW', // Initial state
      pointsChange: 0,
      status: 'ACTIVE' as any, // Explicitly set status for backend
      notes: JSON.stringify({ 
        name: `Session du ${dateFormatted}`,
        startRank: newSession.rank,
        startRankIcon: newSession.rankIcon,
        startLp: parseInt(newSession.startLp),
        status: 'ACTIVE',
        matchCount: 0
      })
    };

    try {
      const created = await dashboardApi.createRankedSession(sessionToCreate);
      setSessions([created, ...sessions]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create ranked session", error);
    }
  };

  // Helper to parse notes safely
  const getSessionDetails = (session: RankedSession) => {
    try {
      return JSON.parse(session.notes || '{}');
    } catch {
      return {};
    }
  };

  const filteredSessions = sessions.filter(s => {
    const details = getSessionDetails(s);
    if (filterStatus === 'ALL') return true;
    return details.status === filterStatus;
  });

  const activeSession = sessions.find(s => getSessionDetails(s).status === 'ACTIVE');

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (confirm('Voulez-vous vraiment terminer cette session ?')) {
      const details = getSessionDetails(activeSession);
      const updatedDetails = { ...details, status: 'COMPLETED' };
      const updatedSession = { ...activeSession, notes: JSON.stringify(updatedDetails) };
      
      try {
        await dashboardApi.updateRankedSession(activeSession.id!, updatedSession);
        setSessions(prev => prev.map(s => s.id === activeSession.id ? updatedSession : s));
      } catch (error) {
        console.error("Failed to end session", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Ranked History</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            Game: <span className="text-[var(--primary-color)]">{selectedGame.displayName}</span>
          </p>
        </div>
        {activeSession ? (
          <Button 
            onClick={handleEndSession} 
            className="bg-red-600 hover:bg-red-500 font-black italic shadow-[0_0_20px_rgba(220,38,38,0.3)] border-red-500 px-8"
          >
            <X size={18} className="mr-2" /> TERMINER LA SESSION
          </Button>
        ) : (
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[var(--primary-color)] font-black italic shadow-[0_0_20px_var(--primary-color)]/20 border-[var(--primary-color)] px-8"
          >
            <Plus size={18} className="mr-2" /> LANCER UNE SESSION
          </Button>
        )}
      </div>

      <Card className="flex flex-col md:flex-row gap-4 items-center justify-between border-slate-800 bg-slate-950/50">
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          {['ALL', 'ACTIVE', 'COMPLETED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s as any)} className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${filterStatus === s ? 'bg-[var(--primary-color)] text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {s === 'ALL' ? 'TOUT' : s === 'ACTIVE' ? 'EN COURS' : 'TERMINÉES'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          <Filter size={14} className="text-[var(--primary-color)]" />
          {filteredSessions.length} SESSIONS
        </div>
      </Card>

      {loading ? (
        <div className="text-white">Chargement...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session, i) => {
          const details = getSessionDetails(session);
          // Fallback for name/rank if not in notes (e.g. from old data)
          const name = details.name || `Session du ${new Date(session.date).toLocaleDateString('fr-FR')}`;
          const rank = details.startRank;
          const rankIcon = details.startRankIcon;
          const lpChange = session.pointsChange;
          const matchCount = details.matchCount || 0;
          const status = details.status || 'COMPLETED';

          return (
          <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link href={`/dashboard/ranked/session/${session.id}`}>
              <Card className="group hover:border-[var(--primary-color)]/50 transition-all cursor-pointer relative overflow-hidden h-full border-slate-800 bg-slate-900/40">
                {status === 'ACTIVE' && <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--primary-color)] text-white text-[10px] font-black italic rounded-bl-lg animate-pulse shadow-lg">LIVE</div>}
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all group-hover:scale-110 ${status === 'ACTIVE' ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)]/30' : 'bg-slate-800 border-slate-700'}`}>
                    {rankIcon ? (
                      <img src={rankIcon} className="w-10 h-10 object-contain" alt={rank} />
                    ) : (
                      <Trophy size={24} className={status === 'ACTIVE' ? 'text-[var(--primary-color)]' : 'text-slate-600'} />
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black italic leading-none ${lpChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{lpChange > 0 ? '+' : ''}{lpChange}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase mt-1 tracking-widest">{selectedGame.terminology.points}</p>
                  </div>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-[var(--primary-color)] transition-colors tracking-tight italic uppercase">{name}</h3>
                <div className="flex justify-between items-center mt-1 mb-6">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">{new Date(session.date).toLocaleDateString('fr-FR')}</p>
                  {rank && <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]" /><span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{rank}</span></div>}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{matchCount} MATCHS</span>
                  <div className="flex items-center text-[var(--primary-color)] text-[10px] font-black uppercase italic group-hover:translate-x-1 transition-transform">ANALYSER <ChevronRight size={14} /></div>
                </div>
              </Card>
            </Link>
          </motion.div>
        )})}
      </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm">
              <Card className="border-slate-700 shadow-2xl bg-slate-900 p-0 overflow-visible">
                <div className="p-6 border-b border-slate-800 bg-slate-950/50 rounded-t-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-color)]/20 flex items-center justify-center text-[var(--primary-color)] border border-[var(--primary-color)]/30"><Trophy size={20} /></div>
                    <div>
                      <h2 className="text-lg font-black italic text-white uppercase leading-none">Lancer Session</h2>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Session Automatique</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-2 relative" ref={rankSelectorRef}>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{selectedGame.terminology.rank} Actuel</label>
                    <button onClick={() => setIsRankSelectorOpen(!isRankSelectorOpen)} className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-[var(--primary-color)] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 overflow-hidden">
                          {newSession.rankIcon ? <img src={newSession.rankIcon} className="w-6 h-6 object-contain" /> : <Trophy size={14} className="text-slate-700" />}
                        </div>
                        <span className="font-bold text-white text-sm uppercase italic">{newSession.rank || 'Sélectionner...'}</span>
                      </div>
                      <ChevronDown size={16} className={`text-slate-500 transition-transform ${isRankSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isRankSelectorOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[70] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                        {selectedGame.ranks.map((r: any) => (
                          <button key={r.name} onClick={() => { setNewSession({...newSession, rank: r.name, rankIcon: r.iconUrl || ''}); setIsRankSelectorOpen(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0">
                            <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                              {r.iconUrl ? <img src={r.iconUrl} className="w-6 h-6 object-contain" /> : <Trophy size={14} className="text-slate-700" />}
                            </div>
                            <span className={`text-xs font-black uppercase italic ${newSession.rank === r.name ? 'text-[var(--primary-color)]' : 'text-slate-300'}`}>{r.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Input label={`${selectedGame.terminology.points} de départ`} type="number" value={newSession.startLp} onChange={e => setNewSession({...newSession, startLp: e.target.value})} className="bg-slate-950 border-slate-800 text-center font-black italic text-lg" />
                  <Button onClick={handleCreateSession} className="w-full h-14 bg-[var(--primary-color)] font-black italic text-lg shadow-[0_0_30px_var(--primary-color)]/30 border-[var(--primary-color)]">DÉMARRER LA SESSION</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
