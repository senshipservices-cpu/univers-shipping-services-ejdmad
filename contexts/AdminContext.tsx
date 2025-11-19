
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminContextType {
  adminEmails: string[];
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Global admin emails list
const ADMIN_EMAILS = [
  'cheikh@uss.com',
  'admin@uss.com',
  'admin@3sglobal.com',
  'admin_email@gmail.com',
];

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const value: AdminContextType = {
    adminEmails: ADMIN_EMAILS,
    isAdmin,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
