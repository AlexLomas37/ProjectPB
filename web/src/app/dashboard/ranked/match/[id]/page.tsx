'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGame } from '@/features/game/context';
import { Card, Button, Input } from '@/shared/components/ui';
import { ChevronLeft, MessageSquare, Trash2, Send, Trophy, Map as MapIcon, User as UserIcon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardApi, RankedSession } from '@/features/dashboard/api';

interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export default function MatchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { selectedGame } = useGame();
  
  const [session, setSession] = useState<RankedSession | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id && sessionId) {
        dashboardApi.getRankedSessionById(sessionId)
            .then(data => {
                setSession(data);
                if (data.notes) {
                    try {
                        const parsed = JSON.parse(data.notes);
                        const found = parsed.matches?.find((m: any) => m.id === id);
                        if (found) {
                            // Ensure comments array exists
                            if (!found.comments) found.comments = [];
                            setMatch(found);
                        }
                    } catch (e) {
                        console.error("Failed to parse matches", e);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch session for match", err));
    }
  }, [id, sessionId]);

  const addComment = async () => {
    if (!newComment.trim() || !match || !session) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMatch = { ...match, comments: [...(match.comments || []), comment] };
    const currentNotes = JSON.parse(session.notes || '{}');
    const updatedMatches = currentNotes.matches.map((m: any) => m.id === id ? updatedMatch : m);
    
    const updatedSession = {
        ...session,
        notes: JSON.stringify({ ...currentNotes, matches: updatedMatches })
    };

    try {
        await dashboardApi.updateRankedSession(session.id!, updatedSession);
        setMatch(updatedMatch);
        setSession(updatedSession);
        setNewComment('');
    } catch (error) {
        console.error("Failed to add comment", error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!match || !session) return;
    
    const updatedMatch = { ...match, comments: match.comments.filter((c: Comment) => c.id !== commentId) };
    const currentNotes = JSON.parse(session.notes || '{}');
    const updatedMatches = currentNotes.matches.map((m: any) => m.id === id ? updatedMatch : m);
    
    const updatedSession = {
        ...session,
        notes: JSON.stringify({ ...currentNotes, matches: updatedMatches })
    };

    try {
        await dashboardApi.updateRankedSession(session.id!, updatedSession);
        setMatch(updatedMatch);
        setSession(updatedSession);
    } catch (error) {
        console.error("Failed to delete comment", error);
    }
  };

  const deleteMatch = async () => {
    if (!match || !session) return;
    if (confirm('Supprimer ce match de l\'historique ?')) {
        const currentNotes = JSON.parse(session.notes || '{}');
        const updatedMatches = currentNotes.matches.filter((m: any) => m.id !== id);
        
        const updatedSession = {
            ...session,
            notes: JSON.stringify({ 
                ...currentNotes, 
                matches: updatedMatches,
                matchCount: updatedMatches.length
            }),
            pointsChange: updatedMatches.reduce((acc: number, m: any) => acc + (parseInt(m.lpChange) || 0), 0)
        };

        try {
            await dashboardApi.updateRankedSession(session.id!, updatedSession);
            router.back();
        } catch (error) {
            console.error("Failed to delete match", error);
        }
    }
  };

  if (!match) return <div className="p-8 text-center text-slate-500 font-black uppercase tracking-widest">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="icon">
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Détails du Match</h1>
        </div>
        <Button onClick={deleteMatch} variant="outline" className="text-red-500 border-red-900/50 hover:bg-red-900/20 font-black italic uppercase text-xs">
          <Trash2 size={18} className="mr-2" /> Supprimer
        </Button>
      </div>

      <div className={`
        p-8 rounded-2xl border-2 relative overflow-hidden
        ${match.result === 'WIN' ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-red-950/20 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}
      `}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy size={120} />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`text-5xl font-black italic tracking-tighter ${match.result === 'WIN' ? 'text-emerald-400' : 'text-red-400'}`}>
                {match.result === 'WIN' ? 'VICTOIRE' : 'DÉFAITE'}
              </span>
              <span className="text-2xl font-bold text-white bg-slate-800/80 px-4 py-1 rounded-lg border border-slate-700">
                {match.score}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <div className="flex items-center gap-1.5"><MapIcon size={14} /> {match.map}</div>
              <div className="flex items-center gap-1.5"><Clock size={14} /> {match.date}</div>
            </div>
          </div>

          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">KDA</p>
              <p className="text-3xl font-black text-white">{match.kills} <span className="text-slate-600">/</span> {match.deaths} <span className="text-slate-600">/</span> {match.assists}</p>
              <p className="text-xs font-bold text-slate-400">Ratio: {((Number(match.kills) + Number(match.assists)) / Math.max(1, Number(match.deaths))).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{selectedGame.terminology.points}</p>
              <p className={`text-3xl font-black ${match.lpChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {match.lpChange > 0 ? '+' : ''}{match.lpChange}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-[var(--primary-color)]" />
              Notes & Commentaires
            </h3>
            <span className="text-xs font-bold text-slate-500 uppercase bg-slate-800 px-2 py-1 rounded">
              {match.comments.length}
            </span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {match.comments.map((comment: Comment) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={comment.id} 
                className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{comment.createdAt}</span>
                  <button 
                    onClick={() => deleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{comment.text}</p>
              </motion.div>
            ))}
            {match.comments.length === 0 && (
              <div className="text-center py-8 text-slate-600 italic">
                Aucun commentaire. Ajoutez vos notes sur le match ici.
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <Input 
              placeholder="Ajouter une observation..." 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="flex-1"
              onKeyPress={e => e.key === 'Enter' && addComment()}
            />
            <Button onClick={addComment} className="px-4">
              <Send size={18} />
            </Button>
          </div>
        </Card>

        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Détails Jeu</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-sm font-bold text-slate-500 uppercase">Agent</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white font-bold">{match.agent.charAt(0)}</div>
                <span className="text-white font-bold">{match.agent}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <span className="text-sm font-bold text-slate-500 uppercase">Carte</span>
              <span className="text-white font-bold">{match.map}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
