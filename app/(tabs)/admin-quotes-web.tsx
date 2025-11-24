
import React from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import AdminQuotesScreen from './admin-quotes';

export default function AdminQuotesWebScreen() {
  return (
    <AdminGuard>
      <AdminLayout title="Gestion des Devis" activeMenu="quotes">
        <AdminQuotesScreen />
      </AdminLayout>
    </AdminGuard>
  );
}
