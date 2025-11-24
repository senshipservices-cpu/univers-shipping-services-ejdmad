
import React from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import AdminConfigScreen from './admin-config';

export default function AdminConfigWebScreen() {
  return (
    <AdminGuard>
      <AdminLayout title="Configuration" activeMenu="config">
        <AdminConfigScreen />
      </AdminLayout>
    </AdminGuard>
  );
}
