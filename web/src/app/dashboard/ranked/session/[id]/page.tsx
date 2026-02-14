'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGame } from '@/features/game/context';
import { Card, Button, Input, Selector } from '@/shared/components/ui';
import { ChevronLeft, Plus, Trophy, TrendingUp, TrendingDown, Minus, ArrowRight, Trash2, X, Save } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi, RankedSession } from '@/features/dashboard/api';

export default function SessionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { selectedGame } = useGame();
  
  const [session, setSession] = useState<RankedSession | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMatch, setNewSessionMatch] = useState({
    result: 'WIN',
    score: '',
    kills: '',
    deaths: '',
    assists: '',
    agent: '',
    map: '',
    lpChange: ''
  });

  useEffect(() => {
    if (id) {
        dashboardApi.getRankedSessionById(id as string)
            .then(data => {
                // Fallback for status if missing from top-level (legacy data)
                if (!data.status && data.notes) {
                    try {
                        const parsed = JSON.parse(data.notes);
                        if (parsed.status) data.status = parsed.status;
                    } catch (e) {}
                }
                setSession(data);
                if (data.notes) {
                    try {
                        const parsed = JSON.parse(data.notes);
                        if (parsed.matches && Array.isArray(parsed.matches)) {
                             // Ensure lpChange is always a number to prevent string concatenation bugs
                             const sanitizedMatches = parsed.matches.map((m: any) => ({
                                 ...m,
                                 lpChange: typeof m.lpChange === 'string' ? parseInt(m.lpChange) || 0 : m.lpChange
                             }));
                             setMatches(sanitizedMatches);
                        }
                    } catch (e) {
                        console.error("Failed to parse matches from notes", e);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch session", err));
    }
  }, [id]);

  const totalLp = matches.reduce((acc, m) => acc + (typeof m.lpChange === 'string' ? parseInt(m.lpChange) || 0 : m.lpChange), 0);

  const handleAddMatch = async () => {
    if (!session) return;
    
    try {
      const match = {
        id: 'm' + Date.now(),
        ...newMatch,
        kda: `${newMatch.kills}/${newMatch.deaths}/${newMatch.assists}`,
        lpChange: parseInt(newMatch.lpChange) || 0,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const newMatches = [match as any, ...matches];
      
      let currentNotes = {};
      try {
        currentNotes = JSON.parse(session.notes || '{}');
      } catch (e) {
        console.warn("Could not parse existing notes, starting fresh", e);
      }

      const updatedNotes = JSON.stringify({
          ...currentNotes,
          matches: newMatches,
          matchCount: newMatches.length
      });

      const updatedSession: RankedSession = {
          ...session,
          notes: updatedNotes,
          pointsChange: newMatches.reduce((acc, m) => acc + (parseInt(m.lpChange) || 0), 0)
      };

      const saved = await dashboardApi.updateRankedSession(session.id!, updatedSession);
      setSession(saved);
      setMatches(newMatches);
      setIsModalOpen(false);
      setNewSessionMatch({ result: 'WIN', score: '', kills: '', deaths: '', assists: '', agent: '', map: '', lpChange: '' });
    } catch (error) {
        console.error("Failed to add match", error);
        alert("Erreur lors de l'ajout du match. Veuillez réessayer.");
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    if (confirm('Terminer cette session ?')) {
        try {
            let currentNotes = {};
            try {
                currentNotes = JSON.parse(session.notes || '{}');
            } catch (e) {
                console.warn("Could not parse notes for ending session", e);
            }
            
            const updatedNotes = JSON.stringify({ ...currentNotes, status: 'COMPLETED' });
            const updatedSession = { ...session, status: 'COMPLETED' as const, notes: updatedNotes };
            
            const saved = await dashboardApi.updateRankedSession(session.id!, updatedSession);
            setSession(saved);
        } catch (error) {
            console.error("Failed to end session", error);
            alert("Erreur lors de la clôture de la session.");
        }
    }
  };

  const handleDeleteSession = async () => {
    if (!session?.id) return;
    if (confirm('Supprimer la session ?')) {
        try {
            await dashboardApi.deleteRankedSession(session.id);
            router.push('/dashboard/ranked');
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    }
  };

  const getSessionName = () => {
    if (!session) return '';
    try {
        const notes = JSON.parse(session.notes || '{}');
        return notes.name || `Session du ${new Date(session.date).toLocaleDateString('fr-FR')}`;
    } catch {
        return `Session du ${new Date(session.date).toLocaleDateString('fr-FR')}`;
    }
  };

  if (!session) return <div className="p-8 text-center text-slate-500 font-black uppercase tracking-widest">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="icon" className="h-10 w-10">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tight leading-none">{getSessionName()}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{selectedGame.displayName} • {new Date(session.date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {session.status === 'ACTIVE' ? (
            <>
              <Button 
                onClick={handleEndSession}
                variant="outline"
                className="text-red-500 border-red-900/30 hover:bg-red-900/10 font-black italic uppercase text-xs px-6"
              >
                <X size={16} className="mr-2" /> TERMINER SESSION
              </Button>
              <Button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary-color)] font-black italic shadow-[0_0_15px_var(--primary-color)]/20 px-6">
                <Plus size={18} className="mr-2" /> AJOUTER MATCH
              </Button>
            </>
          ) : (
            <Button variant="outline" className="text-red-500 border-red-900/30 hover:bg-red-900/10 font-black italic uppercase text-xs px-6" onClick={handleDeleteSession}>
              <Trash2 size={16} className="mr-2" /> SUPPRIMER SESSION
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20">
          <p className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-widest">Bilan de session</p>
          <div className="flex items-center gap-2 mt-2">
            <Trophy className="text-[var(--primary-color)]" size={24} />
            <p className={`text-3xl font-black italic ${totalLp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalLp > 0 ? '+' : ''}{totalLp} <span className="text-[10px] uppercase ml-1 opacity-50">{selectedGame.terminology.points}</span>
            </p>
          </div>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ratio Victoire</p>
          <p className="text-3xl font-black text-white mt-2 italic">
            {matches.filter(m => m.result === 'WIN').length}W <span className="text-slate-700 text-xl mx-1">/</span> {matches.filter(m => m.result === 'LOSS').length}L
          </p>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Winrate</p>
          <p className="text-3xl font-black text-white mt-2 italic">
            {Math.round((matches.filter(m => m.result === 'WIN').length / matches.length) * 100)}%
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Historique des matchs</h3>
          {session.status === 'ACTIVE' && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Session Active</span>
            </div>
          )}
        </div>

        {session.status === 'ACTIVE' && (
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-800 bg-[var(--primary-color)]/5 hover:bg-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/30 transition-all flex flex-col items-center justify-center group mb-6"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--primary-color)]/20 flex items-center justify-center text-[var(--primary-color)] group-hover:scale-110 transition-transform mb-3">
              <Plus size={28} />
            </div>
            <p className="text-sm font-black italic text-white uppercase tracking-widest">AJOUTER UN MATCH</p>
          </motion.button>
        )}

        <div className="space-y-3">
          {matches.map((match, i) => (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={match.id}>
            <Link href={`/dashboard/ranked/match/${match.id}?sessionId=${session.id}`}>
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:translate-x-1 cursor-pointer group ${match.result === 'WIN' ? 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-red-950/10 border-red-500/20 hover:border-red-500/40'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-1.5 h-10 rounded-full ${match.result === 'WIN' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                    <div className="w-20 text-center md:text-left"><p className={`font-black italic text-lg leading-none ${match.result === 'WIN' ? 'text-emerald-400' : 'text-red-400'}`}>{match.result}</p><p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{match.date}</p></div>
                    <div className="w-28 hidden md:block"><p className="text-white font-black text-xl italic leading-none">{match.score}</p><p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">{match.map}</p></div>
                    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-black text-slate-400 border border-slate-700 shadow-inner group-hover:border-slate-600 transition-colors">{match.agent.charAt(0)}</div><div><p className="text-slate-200 font-black text-sm italic">{match.kda}</p><p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{match.agent}</p></div></div>
                  </div>
                  <div className="flex items-center gap-6"><div className={`flex items-center font-black text-lg italic ${match.lpChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{match.lpChange >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}{match.lpChange > 0 ? '+' : ''}{match.lpChange}</div><ArrowRight size={18} className="text-slate-700 group-hover:text-[var(--primary-color)] group-hover:translate-x-1 transition-all" /></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg">
              <Card className="border-slate-700 shadow-2xl bg-slate-900 p-0 overflow-visible">
                <div className="p-6 border-b border-slate-800 bg-slate-950/50 rounded-t-xl flex items-center justify-between">
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Ajouter un match</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {['WIN', 'LOSS', 'DRAW'].map(r => (
                      <button key={r} onClick={() => setNewSessionMatch({...newMatch, result: r})} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${newMatch.result === r ? (r === 'WIN' ? 'bg-emerald-600 text-white' : r === 'LOSS' ? 'bg-red-600 text-white' : 'bg-slate-600 text-white') : 'text-slate-500 hover:text-slate-300'}`}>{r}</button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Score (ex: 13-9)" placeholder="13-9" value={newMatch.score} onChange={e => setNewSessionMatch({...newMatch, score: e.target.value})} />
                    <Input label={selectedGame.terminology.points + " (+/-)"} type="number" placeholder="+24" value={newMatch.lpChange} onChange={e => setNewSessionMatch({...newMatch, lpChange: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Kills" type="number" placeholder="0" value={newMatch.kills} onChange={e => setNewSessionMatch({...newMatch, kills: e.target.value})} />
                    <Input label="Deaths" type="number" placeholder="0" value={newMatch.deaths} onChange={e => setNewSessionMatch({...newMatch, deaths: e.target.value})} />
                    <Input label="Assists" type="number" placeholder="0" value={newMatch.assists} onChange={e => setNewSessionMatch({...newMatch, assists: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Selector 
                      label="Agent / Champion"
                      value={newMatch.agent}
                      options={(selectedGame.agents || []).map(a => ({ name: a.name, iconUrl: a.iconUrl }))}
                      onChange={(val) => setNewSessionMatch({...newMatch, agent: val})}
                      variant="default"
                    />
                    <Selector 
                      label="Carte / Map"
                      value={newMatch.map}
                      options={(selectedGame.maps || []).map(m => ({ name: m.name, imageUrl: m.iconUrl }))}
                      onChange={(val) => setNewSessionMatch({...newMatch, map: val})}
                      variant="grid"
                    />
                  </div>

                  <Button onClick={handleAddMatch} className="w-full h-14 bg-[var(--primary-color)] font-black italic text-lg shadow-[0_0_30px_var(--primary-color)]/30 border-[var(--primary-color)] mt-4">ENREGISTRER LE MATCH</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}