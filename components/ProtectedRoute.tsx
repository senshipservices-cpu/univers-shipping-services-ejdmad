
import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireEmailVerification = true,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, isEmailVerified, loading } = useAuth();
  const { isAdmin } = useAdmin();

  // Don't redirect while loading
  if (loading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect to verify email if email verification is required and not verified
  if (requireEmailVerification && !isEmailVerified()) {
    return <Redirect href="/(tabs)/verify-email" />;
  }

  // Redirect to home if admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  return <>{children}</>;
}
