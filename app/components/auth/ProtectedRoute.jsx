// app/components/auth/ProtectedRoute.jsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Not logged in, redirect to login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!loading && user && requiredRole) {
      // Check role
      if (!requiredRole.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router, pathname, requiredRole]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || (requiredRole && !requiredRole.includes(user.role))) {
    return null;
  }

  return children;
}