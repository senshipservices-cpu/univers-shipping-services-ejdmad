
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminContextType {
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { currentUserIsAdmin } = useAuth();

  const value: AdminContextType = {
    isAdmin: currentUserIsAdmin,
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
