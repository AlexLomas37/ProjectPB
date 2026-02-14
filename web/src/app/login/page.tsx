'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context';
import { Button, Input, Card } from '@/shared/components/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login({ username, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants invalides');
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
            <h1 className="text-3xl font-bold tracking-tight text-white">Bienvenue</h1>
            <p className="text-slate-400 text-sm">Connectez-vous à votre compte <span className="text-[var(--primary-color)] font-bold">ProjectPB</span></p>
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
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
