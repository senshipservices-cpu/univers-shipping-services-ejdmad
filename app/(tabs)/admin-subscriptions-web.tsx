
import React from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import AdminSubscriptionsScreen from './admin-subscriptions';

export default function AdminSubscriptionsWebScreen() {
  return (
    <AdminGuard>
      <AdminLayout title="Abonnements" activeMenu="subscriptions">
        <AdminSubscriptionsScreen />
      </AdminLayout>
    </AdminGuard>
  );
}
