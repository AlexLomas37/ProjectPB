'use client';

import React from 'react';
import { useAuth } from '@/features/auth/context';
import { useGame, SupportedGame } from '@/features/game/context';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Settings, 
  User, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Target,
  Video,
  ShieldCheck,
  Swords,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/ui';

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard' },
  { icon: Swords, label: 'Ranked', href: '/dashboard/ranked' },
  { icon: Target, label: 'Entraînement', href: '/dashboard/training' },
  { icon: Video, label: 'VOD Review', href: '/dashboard/vod' },
  { icon: User, label: 'Profil', href: '/dashboard/profile' },
  { icon: Settings, label: 'Paramètres', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { selectedGameId, setSelectedGameId, configs, userHiddenGames, selectedGame } = useGame();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Dynamic Admin Check
  const isAdmin = user?.roles?.includes('ADMIN') || user?.username === 'admin';

  // Correct Filter Logic:
  // 1. If user hid it personally, hide it from selector (even for admins)
  // 2. If system hid it (hidden), only show to admins
  const visibleGames = Object.values(configs).filter(game => {
    const isPersonallyHidden = userHiddenGames.includes(game.id);
    if (isPersonallyHidden) return false;
    
    // System-wide hidden games are now strictly hidden from everyone in the main selector
    if (game.hidden) return false;
    
    return true;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsGameSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--game-bg)] flex text-slate-50 transition-colors duration-500">
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" className="p-2 bg-slate-900 border-slate-800" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--game-hf)] border-r border-slate-800 transition-all lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-6">
              <h2 className="text-2xl font-black italic text-[var(--primary-color)] tracking-tighter">ProjectPB</h2>
            </div>

            {/* Custom Game Selector with Logos */}
            <div className="px-4 mb-6 relative" ref={selectorRef}>
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 mb-2 block tracking-widest">Jeu Actuel</label>
              <button 
                onClick={() => setIsGameSelectorOpen(!isGameSelectorOpen)}
                className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 p-2 rounded-lg hover:border-[var(--primary-color)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-700">
                    {selectedGame?.assets?.logoUrl ? <img src={selectedGame?.assets?.logoUrl} className="w-full h-full object-cover" /> : <span className="text-[10px]">{selectedGame?.id?.charAt(0) || '?'}</span>}
                  </div>
                  <span className="text-sm font-bold truncate">{selectedGame?.displayName || 'Chargement...'}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isGameSelectorOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGameSelectorOpen && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                  {visibleGames.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => { setSelectedGameId(game.id); setIsGameSelectorOpen(false); }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors ${selectedGameId === game.id ? 'bg-[var(--primary-color)]/10' : ''}`}
                    >
                      <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-700">
                        {game?.assets?.logoUrl ? <img src={game?.assets?.logoUrl} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{game?.id?.charAt(0) || '?'}</span>}
                      </div>
                      <span className={`text-sm font-bold ${selectedGameId === game.id ? 'text-[var(--primary-color)]' : 'text-slate-200'}`}>{game.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20 shadow-[0_0_15px_rgba(0,0,0,0.2)]' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-slate-800">
                  <p className="px-3 text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Admin</p>
                  <Link href="/admin" className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${pathname.startsWith('/admin') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
                    <ShieldCheck size={18} />
                    <span>Administration</span>
                  </Link>
                </div>
              )}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
              <div className="flex items-center space-x-3 px-3 py-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700 shadow-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                  <p className="text-[10px] text-slate-500 truncate font-bold uppercase">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold" onClick={logout}>
                <LogOut size={18} className="mr-3" />
                Déconnexion
              </Button>
              <div className="mt-4 px-3">
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] italic">Version 0.1.0-alpha</p>
              </div>
            </div>
          </div>
        </aside>

        {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        <main className="flex-1 h-screen overflow-y-auto"><div className="p-4 lg:p-8 w-full">{children}</div></main>
      </div>
    </ProtectedRoute>
  );
}
