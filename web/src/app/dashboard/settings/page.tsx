'use client';

import React from 'react';
import { Card, Button } from '@/shared/components/ui';
import { Bell, Moon, Volume2, Globe, Shield, Gamepad2 } from 'lucide-react';
import { useGame, SupportedGame } from '@/features/game/context';

export default function SettingsPage() {
  const { configs, userHiddenGames, toggleUserGameVisibility } = useGame();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        <p className="text-slate-400">Préférences de l'application.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
            <Gamepad2 size={20} className="mr-2 text-[var(--primary-color)]" /> 
            Jeux Affichés
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Sélectionnez les jeux que vous souhaitez voir apparaître dans votre sélecteur de jeu.
          </p>
          <div className="space-y-3">
            {Object.values(configs)
              .filter(game => !game.hidden) // Only show games that are not system-wide hidden
              .map(game => (
                <div 
                  key={game.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    !userHiddenGames.includes(game.id) 
                      ? 'bg-slate-900/50 border-slate-700' 
                      : 'bg-slate-950/30 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                      {game.assets?.logoUrl ? (
                        <img src={game.assets.logoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold">{game.id.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-200">{game.displayName}</span>
                  </div>
                  <SettingToggle 
                    checked={!userHiddenGames.includes(game.id)} 
                    onChange={() => toggleUserGameVisibility(game.id)}
                  />
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center"><Bell size={20} className="mr-2 text-[var(--primary-color)]" /> Notifications</h3>
          <div className="space-y-4">
            <SettingToggle label="Notifications par email" description="Recevoir des récapitulatifs hebdomadaires" checked />
            <SettingToggle label="Alertes de session" description="Notification avant le début d'un entraînement planifié" checked />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, checked = false, disabled = false, onChange }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className={`font-medium ${disabled ? 'text-slate-500' : 'text-slate-200'}`}>{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <div 
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-[var(--primary-color)] shadow-[0_0_10px_var(--primary-color)]/30' : 'bg-slate-700'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}
