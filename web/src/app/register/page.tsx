'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context';
import { Button, Input, Card } from '@/shared/components/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await register({ username, email, password });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="space-y-8 border-slate-800">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Créer un compte</h1>
            <p className="text-slate-400 text-sm">Rejoignez la plateforme <span className="text-[var(--primary-color)] font-bold">ProjectPB</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Input
              label="Nom d'utilisateur"
              placeholder="votre_pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full h-11" variant="secondary" disabled={isLoading}>
              {isLoading ? 'Création...' : "S'inscrire"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
