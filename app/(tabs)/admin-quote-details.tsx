
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AdminQuoteDetailsContent from '@/components/AdminQuoteDetailsContent';

export default function AdminQuoteDetailsScreen() {
  return (
    <ProtectedRoute requireEmailVerification={true} requireAdmin={true}>
      <AdminQuoteDetailsContent />
    </ProtectedRoute>
  );
}
