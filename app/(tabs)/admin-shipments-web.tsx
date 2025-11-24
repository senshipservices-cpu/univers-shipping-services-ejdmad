
import React from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import AdminShipmentsScreen from './admin-shipments';

export default function AdminShipmentsWebScreen() {
  return (
    <AdminGuard>
      <AdminLayout title="Gestion des Shipments" activeMenu="shipments">
        <AdminShipmentsScreen />
      </AdminLayout>
    </AdminGuard>
  );
}
