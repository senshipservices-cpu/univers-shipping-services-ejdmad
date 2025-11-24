
import React from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import AdminLayout from '@/components/AdminLayout';
import AdminAgentsPortsScreen from './admin-agents-ports';

export default function AdminAgentsPortsWebScreen() {
  return (
    <AdminGuard>
      <AdminLayout title="Agents & Ports" activeMenu="agents">
        <AdminAgentsPortsScreen />
      </AdminLayout>
    </AdminGuard>
  );
}
