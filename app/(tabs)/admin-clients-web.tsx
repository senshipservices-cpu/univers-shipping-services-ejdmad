
import React from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import AdminClientsScreen from './admin-clients';

export default function AdminClientsWebScreen() {
  return (
    <AdminGuard>
      <AdminLayout title="Clients" activeMenu="clients">
        <AdminClientsScreen />
      </AdminLayout>
    </AdminGuard>
  );
}
