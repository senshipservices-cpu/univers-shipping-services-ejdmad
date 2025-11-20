
import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({ children, requireEmailVerification = true }: ProtectedRouteProps) {
  const { user, isEmailVerified, loading } = useAuth();

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

  return <>{children}</>;
}
