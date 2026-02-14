'use client';

import React from 'react';
import { useGame, SupportedGame } from '@/features/game/context';
import { Card, Button } from '@/shared/components/ui';
import { Settings, ChevronRight, AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { configs } = useGame();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Administration</h1>
        <p className="text-slate-400">Gestion des configurations de jeux et du système.</p>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-200 mb-4 uppercase tracking-wider text-sm">Gestion du Système</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <Link href="/admin/users">
                <Card className="hover:border-indigo-500 transition-colors cursor-pointer group h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-700">
                        U
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">Utilisateurs</h3>
                        <p className="text-xs text-slate-500 font-mono">Gestion des comptes</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-indigo-500" />
                  </div>
                </Card>
              </Link>
              <Link href="/admin/roles">
                <Card className="hover:border-indigo-500 transition-colors cursor-pointer group h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-700">
                        R
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">Rôles</h3>
                        <p className="text-xs text-slate-500 font-mono">Permissions système</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-indigo-500" />
                  </div>
                </Card>
              </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-200 uppercase tracking-wider text-sm">Gestion des Jeux</h2>
            <Link href="/admin/game/create">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs uppercase font-black tracking-widest">
                <Plus size={14} className="mr-1" /> Ajouter
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(configs).map((game) => (
              <Link key={game.id} href={`/admin/game/${game.id}`}>
                <Card className="hover:border-indigo-500 transition-colors cursor-pointer group h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {game?.assets?.logoUrl ? (
                        <img src={game.assets.logoUrl} alt={game.displayName} className="w-12 h-12 rounded-lg bg-slate-800 object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-700">
                          {game.displayName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{game.displayName}</h3>
                        <p className="text-xs text-slate-500 font-mono">{game?.id}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-indigo-500" />
                  </div>
                  {game.hidden && (
                    <div className="mt-4 inline-flex items-center px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-400">
                      <AlertTriangle size={12} className="mr-1.5" />
                      Caché
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
