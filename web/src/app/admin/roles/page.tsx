'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/shared/components/ui';
import { Shield, Plus, Trash2, ChevronLeft, Lock, Key, Command } from 'lucide-react';
import { AuthService } from '@/features/auth/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminRolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await AuthService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newRoleName) return;
    try {
      await AuthService.createRole(newRoleName);
      setNewRoleName('');
      fetchRoles();
    } catch (error) {
      console.error("Failed to create role", error);
      alert("Erreur: Le rôle existe peut-être déjà ou est invalide.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (name === 'ROLE_ADMIN' || name === 'ROLE_USER') {
      return;
    }
    if (confirm(`Supprimer le rôle ${name} ?`)) {
      try {
        await AuthService.deleteRole(id);
        setRoles(roles.filter(r => r.id !== id));
      } catch (error) {
        console.error("Failed to delete role", error);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="icon" className="bg-slate-900 border-slate-800">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Système de Rôles</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Niveaux d'accès & Permissions</p>
          </div>
        </div>

        <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
           <div className="px-4 py-2 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total</p>
              <p className="text-xl font-black text-white italic leading-none">{roles.length}</p>
           </div>
           <div className="w-px bg-slate-800 my-2" />
           <div className="px-4 py-2 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Custom</p>
              <p className="text-xl font-black text-indigo-400 italic leading-none">{roles.filter(r => !['ROLE_ADMIN', 'ROLE_USER'].includes(r.name)).length}</p>
           </div>
        </div>
      </div>

      <Card className="border-[var(--primary-color)]/20 bg-slate-950/40 p-1 overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Plus size={14} className="text-[var(--primary-color)]" /> Nouveau Rôle
            </div>
            <input 
              placeholder="NOM_DU_ROLE (Ex: MODERATOR)" 
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value.toUpperCase())}
              className="w-full bg-transparent border-0 text-2xl font-black italic text-white placeholder:text-slate-800 focus:outline-none uppercase tracking-tight"
            />
          </div>
          <button 
            onClick={handleCreate}
            disabled={!newRoleName}
            className="md:w-48 bg-[var(--primary-color)] hover:brightness-110 disabled:grayscale transition-all flex flex-col items-center justify-center p-6 text-white group"
          >
            <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-black italic uppercase text-xs tracking-widest">Créer le rôle</span>
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {roles.map((role, i) => {
            const isSystem = role.name === 'ROLE_ADMIN' || role.name === 'ROLE_USER';
            return (
              <motion.div 
                key={role.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`relative group h-full bg-slate-900/40 border ${isSystem ? 'border-slate-800' : 'border-slate-800 hover:border-indigo-500/50'} p-6 rounded-2xl transition-all`}>
                  <div className="flex justify-between items-start mb-8">
                    <div className={`p-3 rounded-xl ${isSystem ? 'bg-slate-800 text-slate-600' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'}`}>
                      {isSystem ? <Lock size={20} /> : <Shield size={20} />}
                    </div>
                    {!isSystem && (
                      <button 
                        onClick={() => handleDelete(role.id, role.name)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{role.name.replace('ROLE_', '')}</h3>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{role.name}</p>
                  
                  <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{isSystem ? 'SYSTÈME' : 'CUSTOM'}</span>
                    <Command size={14} className="text-slate-800" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}