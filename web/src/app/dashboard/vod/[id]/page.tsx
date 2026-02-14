'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGame } from '@/features/game/context';
import { Card, Button, Input } from '@/shared/components/ui';
import { ChevronLeft, MessageSquare, Plus, Trash2, Send, Clock, Tag, ExternalLink, Video, MonitorOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardApi, Vod } from '@/features/dashboard/api';

export default function VodDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { selectedGame } = useGame();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [vod, setVod] = useState<Vod | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newTime, setNewTime] = useState('');
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  useEffect(() => {
    if (id) {
        dashboardApi.getVodById(id as string)
            .then(data => {
                // Ensure comments is an array
                if (!data.comments) data.comments = [];
                setVod(data);
            })
            .catch(err => {
                console.error("Failed to fetch VOD", err);
            });
    }
  }, [id]);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Robust YouTube IFrame message listener
  useEffect(() => {
    if (!vod || vod.isReplay) return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("youtube.com")) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'infoDelivery' && data.info && typeof data.info.currentTime === 'number') {
          setVideoCurrentTime(data.info.currentTime);
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    const interval = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [vod]);

  if (!vod) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">Chargement...</div>;

  const videoId = getYoutubeId(vod.url);

  const seekTo = (seconds: number) => {
    if (iframeRef.current && videoId) {
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [seconds, true]
      }), '*');
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: 'playVideo',
        args: []
      }), '*');
    }
  };

  const parseTimeToSeconds = (time: string) => {
    if (!time) return 0;
    const parts = time.split(':').reverse();
    let seconds = 0;
    if (parts[0]) seconds += parseInt(parts[0]) || 0;
    if (parts[1]) seconds += (parseInt(parts[1]) || 0) * 60;
    if (parts[2]) seconds += (parseInt(parts[2]) || 0) * 3600;
    return seconds;
  };

  const formatSecondsToTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const minStr = minutes.toString().padStart(2, '0');
    const secStr = seconds.toString().padStart(2, '0');
    return hours > 0 ? `${hours}:${minStr}:${secStr}` : `${minStr}:${secStr}`;
  };

  const addComment = async () => {
    if (!newComment.trim() || !vod) return;
    let seconds = newTime.trim() ? parseTimeToSeconds(newTime) : Math.floor(videoCurrentTime);
    let timeStr = newTime.trim() ? newTime : formatSecondsToTime(seconds);

    const comment = {
      id: Date.now().toString(),
      time: timeStr,
      seconds: seconds,
      text: newComment,
      type: 'GENERAL'
    };
    
    const updatedVod = { ...vod, comments: [...(vod.comments || []), comment].sort((a, b) => a.seconds - b.seconds) };
    try {
        const saved = await dashboardApi.updateVod(vod.id!, updatedVod);
        setVod(saved);
        setNewComment('');
        setNewTime('');
    } catch (error) {
        console.error("Failed to update VOD with new comment", error);
    }
  };

  const deleteVod = async () => {
    if (confirm('Supprimer cette review ?') && vod?.id) {
      try {
          await dashboardApi.deleteVod(vod.id);
          router.push('/dashboard/vod');
      } catch (error) {
          console.error("Failed to delete VOD", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] space-y-4 w-full overflow-hidden">
      <div className="flex items-center justify-between shrink-0 px-1">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()} size="icon" className="h-8 w-8">
            <ChevronLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none uppercase italic">{vod.title}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{selectedGame.displayName} • {vod.date}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!vod.isReplay && (
            <Button variant="outline" size="sm" className="text-slate-400 border-slate-800 h-8 text-xs font-black uppercase tracking-tighter" onClick={() => window.open(vod.url, '_blank')}>
              <ExternalLink size={14} className="mr-2" /> YouTube
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-red-500 border-red-900/50 hover:bg-red-900/20 h-8 w-8 p-0" onClick={deleteVod}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="flex-[3] flex flex-col min-h-0 space-y-4 overflow-hidden">
          <div className="w-full aspect-video bg-black rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative shrink-0">
            {vod.isReplay ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 space-y-6">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-500 shadow-2xl">
                  <MonitorOff size={40} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-widest">In-Game Replay Mode</h3>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto font-black uppercase tracking-tighter leading-relaxed">Consultez le replay directement dans le client du jeu et utilisez les notes ci-contre pour vos observations.</p>
                </div>
              </div>
            ) : videoId ? (
              <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <Video size={48} className="opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">Vidéo non disponible</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 shrink-0 pb-2 overflow-x-auto custom-scrollbar">
            {vod.tags.map((t: string) => (
              <span key={t} className="bg-slate-900 text-[var(--primary-color)] px-2 py-1 rounded-md text-[9px] font-black border border-slate-800 uppercase tracking-tighter shadow-sm whitespace-nowrap">#{t}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 lg:w-80 xl:w-96 flex flex-col shrink-0 min-h-[300px] lg:min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden border-slate-800 bg-slate-950/50 shadow-xl">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
              <h3 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageSquare size={12} className="text-[var(--primary-color)]" /> Timestamps & Notes
              </h3>
              <span className="text-[10px] font-black bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{vod.comments.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {vod.comments.map((c: any) => (
                <div 
                  key={c.id} 
                  onClick={() => !vod.isReplay && seekTo(c.seconds)}
                  className={`group relative bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl hover:border-[var(--primary-color)]/50 hover:bg-slate-900 transition-all ${vod.isReplay ? '' : 'cursor-pointer'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black text-[var(--primary-color)] bg-[var(--primary-color)]/10 px-1.5 py-0.5 rounded border border-[var(--primary-color)]/20 font-mono group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors">{c.time}</span>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">{c.type}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed group-hover:text-white transition-colors">{c.text}</p>
                </div>
              ))}
              {vod.comments.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4 py-12">
                  <Clock size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">Aucune note pour le moment</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2 shrink-0">
              <div className="flex gap-2">
                <Input 
                  placeholder={formatSecondsToTime(videoCurrentTime)} 
                  value={newTime} 
                  onChange={e => setNewTime(e.target.value)}
                  className="w-16 text-center font-mono text-[10px] border-slate-700 bg-slate-950 h-8 p-0 placeholder:text-slate-400" 
                />
                <Input 
                  placeholder="Notez un moment..." 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)}
                  className="flex-1 border-slate-700 bg-slate-950 text-xs h-8"
                  onKeyPress={e => e.key === 'Enter' && addComment()}
                />
              </div>
              <Button onClick={addComment} className="w-full font-black italic text-[10px] h-8 bg-[var(--primary-color)] border-[var(--primary-color)] shadow-[0_0_10px_var(--primary-color)]/20">
                AJOUTER LA NOTE <Send size={12} className="ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}