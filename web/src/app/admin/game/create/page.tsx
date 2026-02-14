'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, GameConfig } from '@/features/game/context';
import { Card, Button, Input } from '@/shared/components/ui';
import { ChevronLeft, Save, Upload } from 'lucide-react';

export default function AddGamePage() {
  const router = useRouter();
  const { updateGameConfig } = useGame();
  
  const [displayName, setDisplayName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [importJson, setImportJson] = useState('');

  const handleCreate = async () => {
    if (!displayName) {
      alert("Nom requis");
      return;
    }

    const newConfig: GameConfig = {
      id: '', // Backend will generate UUID
      game: displayName.toUpperCase().replace(/\s+/g, '_'),
      displayName,
      colors: { primary: '#6366f1', background: '#0f172a', headerFooter: '#1e293b' },
      terminology: { points: 'Points', rank: 'Rank' },
      assets: { logoUrl },
      ranks: [],
      maps: [],
      agents: [],
      metrics: [],
      hidden: true, // Default to hidden
      features: { hasAgent: false, hasMap: false, hasKDA: true, hasScore: true, hasMental: false, hasPerformance: false }
    };

    try {
      await updateGameConfig('', newConfig); // Use empty string as ID for creation
      router.push('/admin');
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.id || !parsed.displayName) throw new Error("ID or Name missing");
      await updateGameConfig(parsed.id, parsed);
      router.push(`/admin/game/${parsed.id}`);
    } catch (e) {
      alert("JSON Invalide ou erreur d'import");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="icon">
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold text-white">Ajouter un Jeu</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Nouveau Jeu</h3>
          <div className="space-y-4">
            <Input 
              label="Nom du Jeu" 
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)} 
              placeholder="Ex: Minecraft"
            />
            <Input 
              label="Logo URL" 
              value={logoUrl} 
              onChange={e => setLogoUrl(e.target.value)} 
              placeholder="https://..."
            />
            <Button onClick={handleCreate} className="w-full">
              <Save size={18} className="mr-2" /> Créer
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Importer JSON</h3>
          <textarea 
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 mb-4 focus:outline-none focus:border-indigo-500"
            placeholder='{ "id": "MY_GAME", "displayName": "My Game", ... }'
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
          />
          <Button onClick={handleImport} variant="outline" className="w-full">
            <Upload size={18} className="mr-2" /> Importer
          </Button>
        </Card>
      </div>
    </div>
  );
}
