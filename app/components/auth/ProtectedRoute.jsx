'use client';

import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '../ui/Loading';
import { hasAnyPermission, normalizeRole } from '../../../lib/access-control';

export default function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles = [],
  requiredPermissions = []
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const roleAllowed =
    allowedRoles.length === 0 ||
    allowedRoles.map(normalizeRole).includes(normalizeRole(user?.role));
  const permissionAllowed =
    requiredPermissions.length === 0 ||
    hasAnyPermission(user, requiredPermissions);
  const isAllowed = roleAllowed && permissionAllowed;

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to login if authentication is required but user is not logged in
        router.push('/login');
      } else if (requireAuth && user && !isAllowed) {
        router.push('/dashboard');
      } else if (!requireAuth && user) {
        // Redirect to home if authentication is NOT required but user IS logged in
        router.push('/');
      }
    }
  }, [user, loading, router, requireAuth, isAllowed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  // If auth requirements are met, render children
  if ((requireAuth && user && isAllowed) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
