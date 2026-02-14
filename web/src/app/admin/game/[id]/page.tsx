'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGame, SupportedGame, GameConfig } from '@/features/game/context';
import { Button, Input, Card } from '@/shared/components/ui';
import { ChevronLeft, Save, Download, Upload, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { gameApi } from '@/features/game/api';

// Helper components
const SectionHeader = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4 mt-8 pb-2 border-b border-slate-800">
    <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider">{title}</h3>
    {children}
  </div>
);

const JsonModal = ({ isOpen, onClose, onImport, mode, initialData }: any) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen && mode === 'export') {
      setText(initialData || '');
    } else if (isOpen && mode === 'import') {
      setText('');
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-700">
        <h3 className="text-xl font-bold text-white mb-2">
          {mode === 'export' ? 'Exporter Configuration' : 'Importer Configuration'}
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          {mode === 'export' ? 'Copiez ce JSON pour sauvegarder.' : 'Collez le JSON complet ici.'}
        </p>
        
        <textarea
          className="w-full h-64 bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none mb-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={mode === 'export'}
        />
        
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          {mode === 'import' && (
            <Button onClick={() => { onImport(text); onClose(); }}>Importer</Button>
          )}
          {mode === 'export' && (
            <Button onClick={() => { navigator.clipboard.writeText(text); alert('Copié !'); }}>Copier</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default function GameEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { configs, updateGameConfig } = useGame();
  
  const gameId = id as SupportedGame;
  const originalConfig = configs[gameId];

  const [config, setConfig] = useState<GameConfig | null>(null);
  const [jsonModal, setJsonModal] = useState({ open: false, mode: 'export', data: '' });

  useEffect(() => {
    if (originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig))); // Deep copy
    }
  }, [originalConfig]);

  if (!config) return <div className="p-8 text-center text-slate-500">Chargement...</div>;

  const handleSave = async () => {
    try {
      await updateGameConfig(gameId, config);
      router.push('/admin');
    } catch (err) {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (confirm(`Voulez-vous vraiment supprimer ${config.displayName} ?`)) {
      try {
        await gameApi.delete(gameId);
        // We also need to refresh the context, but simplest is full reload or redirect
        window.location.href = '/admin'; 
      } catch (e) {
        console.error("Failed to delete game", e);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const updateField = (path: string, value: any) => {
    setConfig(prev => {
      if (!prev) return null;
      const next = { ...prev };
      const parts = path.split('.');
      let current: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleImportConfig = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      setConfig(prev => ({ ...prev, ...parsed } as GameConfig));
    } catch (e) {
      alert('JSON Invalide');
    }
  };

  const ListEditor = ({ items, field, placeholder }: { items: any[], field: string, placeholder: string }) => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemIcon, setNewItemIcon] = useState('');

    const add = () => {
      if (!newItemName) return;
      const newItem = { name: newItemName, iconUrl: newItemIcon || undefined, isActive: true };
      const newItems = [...items, newItem];
      updateField(field, newItems);
      setNewItemName('');
      setNewItemIcon('');
    };

    const remove = (idx: number) => {
      const newItems = items.filter((_, i) => i !== idx);
      updateField(field, newItems);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder={placeholder} 
            value={newItemName} 
            onChange={e => setNewItemName(e.target.value)} 
            className="flex-1"
          />
          <Input 
            placeholder="URL Icone (opt)" 
            value={newItemIcon} 
            onChange={e => setNewItemIcon(e.target.value)} 
            className="flex-1"
          />
          <Button onClick={add} size="icon"><Plus size={18} /></Button>
        </div>
        
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              {item.iconUrl ? (
                <img src={item.iconUrl} className="w-8 h-8 rounded bg-slate-800 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                  {item.name.charAt(0)}
                </div>
              )}
              <span className="flex-1 font-medium text-slate-200">{item.name}</span>
              <Button variant="ghost" size="icon" onClick={() => remove(idx)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-slate-600 italic text-sm py-2">Aucun élément</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Éditer {config.displayName}</h1>
            <p className="text-slate-400 text-sm">ID: {config.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJsonModal({ open: true, mode: 'export', data: JSON.stringify(config, null, 2) })}>
            <Download size={18} className="mr-2" /> Exporter
          </Button>
          <Button variant="outline" onClick={() => setJsonModal({ open: true, mode: 'import', data: '' })}>
            <Upload size={18} className="mr-2" /> Importer
          </Button>
          <Button onClick={handleSave}>
            <Save size={18} className="mr-2" /> Sauvegarder
          </Button>
          <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 border-red-500">
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <SectionHeader title="Général" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nom Affiché" value={config.displayName} onChange={e => updateField('displayName', e.target.value)} />
            <Input label="Logo URL" value={config?.assets?.logoUrl || ''} onChange={e => updateField('assets.logoUrl', e.target.value)} />
          </div>
          
          <div className="mt-4 flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <span className="text-sm font-medium text-slate-300">Jeu Caché (Utilisateurs)</span>
            <Button 
              size="sm" 
              variant={config.hidden ? 'danger' : 'outline'}
              onClick={() => updateField('hidden', !config.hidden)}
            >
              {config.hidden ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
              {config.hidden ? 'Caché' : 'Visible'}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Couleurs" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Primaire', path: 'colors.primary' },
              { label: 'Background', path: 'colors.background' },
              { label: 'Header/Footer', path: 'colors.headerFooter' },
            ].map((c) => {
              const colorVal = c.path.split('.').reduce((obj, key) => obj[key], config as any);
              return (
                <div key={c.path} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-400">{c.label}</label>
                    <input 
                      type="color" 
                      value={colorVal} 
                      onChange={e => updateField(c.path, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                    />
                  </div>
                  <Input 
                    value={colorVal} 
                    onChange={e => updateField(c.path, e.target.value)} 
                  />
                  <div className="h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: colorVal }} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Fonctionnalités" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(config.features).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-sm font-medium text-slate-300 capitalize">{key.replace('has', '')}</span>
                <input 
                  type="checkbox" 
                  checked={val} 
                  onChange={e => updateField(`features.${key}`, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <SectionHeader title="Rangs" />
            <ListEditor items={config.ranks} field="ranks" placeholder="Nom du rang (ex: Gold)" />
          </Card>
          <Card>
            <SectionHeader title="Maps" />
            <ListEditor items={config.maps} field="maps" placeholder="Nom de la map" />
          </Card>
          <Card>
            <SectionHeader title="Agents" />
            <ListEditor items={config.agents} field="agents" placeholder="Nom de l'agent" />
          </Card>
          <Card>
            <SectionHeader title="Métriques" />
            {/* Simplified metric editor */}
            <p className="text-xs text-slate-500 mb-4">Éditeur simplifié pour les métriques.</p>
            <ListEditor items={config.metrics.map(m => ({ ...m, name: m.label }))} field="metrics" placeholder="Label métrique" />
          </Card>
        </div>
      </div>

      <JsonModal 
        isOpen={jsonModal.open} 
        mode={jsonModal.mode} 
        initialData={jsonModal.data}
        onClose={() => setJsonModal({ ...jsonModal, open: false })}
        onImport={handleImportConfig}
      />
    </div>
  );
}