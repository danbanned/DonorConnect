'use client';

import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '../ui/Loading';

export default function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to login if authentication is required but user is not logged in
        router.push('/login');
      } else if (!requireAuth && user) {
        // Redirect to home if authentication is NOT required but user IS logged in
        router.push('/');
      }
    }
  }, [user, loading, router, requireAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  // If auth requirements are met, render children
  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}