'use client';

import DashboardLayout from "@/app/dashboard/layout";
import { useAuth } from "@/features/auth/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const isAdmin = user?.roles?.some(r => r.toUpperCase().includes('ADMIN')) || user?.username === 'admin';

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) return null;
  if (!isAuthenticated || !isAdmin) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
