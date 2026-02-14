'use client';

import React from 'react';
import { useAuth } from '@/features/auth/context';
import { Card, Button, Input } from '@/shared/components/ui';
import { User, Mail, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
        <p className="text-slate-400">Gérez vos informations personnelles.</p>
      </div>

      <Card className="p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-slate-800 shadow-xl">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded border border-indigo-500/50">
                {user?.roles?.join(', ') || 'MEMBER'}
              </span>
              <span className="text-slate-500 text-sm">{user?.email}</span>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nom d'utilisateur" defaultValue={user?.username} icon={<User size={16} />} />
            <Input label="Email" defaultValue={user?.email} disabled icon={<Mail size={16} />} />
          </div>
          
          <div className="pt-6 border-t border-slate-800">
             <h3 className="text-lg font-bold text-slate-200 mb-4">Changer de mot de passe</h3>
             <div className="space-y-4">
                <Input label="Mot de passe actuel" type="password" />
                <Input label="Nouveau mot de passe" type="password" />
             </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button>
              <Save size={18} className="mr-2" /> Enregistrer les modifications
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
