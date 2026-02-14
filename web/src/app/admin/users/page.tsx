'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/shared/components/ui';
import { Search, ChevronRight, User as UserIcon, Shield, ShieldAlert, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AuthService } from '@/features/auth/api';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await AuthService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Utilisateurs</h1>
          <p className="text-slate-400">Gérez les comptes utilisateurs ({users.length} inscrits).</p>
        </div>
      </div>

      <Card className="border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Rechercher un utilisateur (pseudo, email...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </Card>

      {loading ? (
        <div className="text-white">Chargement...</div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Link key={user.id} href={`/admin/users/${user.id}`}>
              <Card className="hover:border-indigo-500 transition-colors cursor-pointer group flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                      <UserIcon size={20} />
                   </div>
                   <div>
                      <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{user.username}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      {user.createdDate && <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">Inscrit le {new Date(user.createdDate).toLocaleDateString()}</p>}
                   </div>
                   <div className="flex gap-2">
                      {user.roles?.map((role: string) => (
                        <span key={role} className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${role === 'ADMIN' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                          {role}
                        </span>
                      ))}
                   </div>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-indigo-500" />
              </Card>
            </Link>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
              Aucun utilisateur trouvé.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
