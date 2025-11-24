
import React from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import AdminServicesScreen from './admin-services';

export default function AdminServicesWebScreen() {
  return (
    <AdminGuard>
      <AdminLayout title="Services & Tarification" activeMenu="services">
        <AdminServicesScreen />
      </AdminLayout>
    </AdminGuard>
  );
}
