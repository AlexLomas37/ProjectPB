'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/shared/components/ui';
import { ChevronLeft, User as UserIcon, Trash2, Shield, Check, Calendar, Clock, Activity, Mail, Fingerprint } from 'lucide-react';
import { AuthService } from '@/features/auth/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, rolesData] = await Promise.all([
        AuthService.getUserById(resolvedParams.id),
        AuthService.getAllRoles()
      ]);
      setUser(userData);
      setAllRoles(rolesData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (roleName: string) => {
    const roleSuffix = roleName.replace('ROLE_', '');
    const hasRole = user.roles.includes(roleSuffix);
    
    let newRoles;
    if (hasRole) {
      newRoles = user.roles.filter((r: string) => r !== roleSuffix);
    } else {
      newRoles = [...user.roles, roleSuffix];
    }
    
    try {
      const updated = await AuthService.updateUser(user.id, { roles: newRoles });
      setUser(updated);
    } catch (error) {
      console.error("Failed to update roles", error);
      alert("Erreur lors de la mise à jour des rôles");
    }
  };

  const handleDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ? Cette action est irréversible.`)) {
      try {
        await AuthService.deleteUser(user.id);
        router.push('/admin/users');
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return 'Jamais';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="text-white">Chargement...</div>;
  if (!user) return <div className="text-white">Utilisateur introuvable</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="icon" className="bg-slate-900 border-slate-800">
          <ChevronLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Profil Utilisateur</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Console d'administration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-0 overflow-hidden border-slate-800 bg-slate-950/40">
            <div className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center bg-gradient-to-br from-slate-900/50 to-transparent">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-4xl italic border-2 border-slate-700 shadow-2xl group-hover:border-[var(--primary-color)] transition-colors">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[var(--primary-color)] flex items-center justify-center border-2 border-slate-950 text-white shadow-lg">
                  <Activity size={14} />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{user.username}</h2>
                <div className="flex flex-wrap gap-4 items-center pt-2">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Mail size={14} className="text-indigo-400" /> {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Fingerprint size={14} className="text-indigo-400" /> {user.id}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-900">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-widest mb-4">
                  <Calendar size={14} className="text-[var(--primary-color)]" /> Historique
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Création du compte</p>
                    <p className="text-sm font-bold text-slate-200">{formatFullDate(user.createdDate)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Dernière connexion</p>
                    <p className="text-sm font-bold text-emerald-400">{formatFullDate(user.lastLoginDate)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] tracking-widest mb-4">
                  <Activity size={14} className="text-[var(--primary-color)]" /> Statut Système
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Dernière modification</p>
                    <p className="text-sm font-bold text-slate-200">{formatFullDate(user.lastModifiedDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Actif</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <Trash2 size={16} /> Zone Critique
            </h3>
            <div className="p-6 rounded-2xl border-2 border-red-900/20 bg-red-950/10 space-y-4">
              <p className="text-xs text-slate-500 font-medium">La suppression d'un compte est une action irréversible. Toutes les données associées (entraînements, VODs, scores) seront définitivement effacées.</p>
              <Button onClick={handleDelete} className="w-full bg-red-600 hover:bg-red-500 text-white font-black italic py-4 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                SUPPRIMER LE COMPTE DÉFINITIVEMENT
              </Button>
            </div>
          </div>
        </div>

        {/* Roles Sidebar */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <Shield size={16} className="text-indigo-400" /> Rôles
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {allRoles.map((role, i) => {
              const roleSuffix = role.name.replace('ROLE_', '');
              const isActive = user.roles.includes(roleSuffix);
              return (
                <motion.div 
                  key={role.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleToggleRole(role.name)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${isActive ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <span className={`text-sm font-black italic uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-500'}`}>{roleSuffix}</span>
                      <p className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? 'text-indigo-400' : 'text-slate-700'}`}>{role.name}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isActive ? 'bg-indigo-500 border-indigo-500' : 'border-slate-800 bg-slate-950'}`}>
                    {isActive && <Check size={14} className="text-white" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}