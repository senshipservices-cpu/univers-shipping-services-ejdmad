
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import appConfig from '@/config/appConfig';

interface AdminContextType {
  adminEmails: string[];
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Get admin emails from appConfig (environment variables)
  const adminEmails = appConfig.admin.emails;

  // Check if current user is admin using appConfig helper
  const isAdmin = user?.email ? appConfig.admin.isAdminEmail(user.email) : false;

  // Log admin status in development
  if (appConfig.isDev && user?.email) {
    appConfig.logger.debug('Admin check:', {
      userEmail: user.email,
      isAdmin,
      configuredAdminEmails: adminEmails,
    });
  }

  const value: AdminContextType = {
    adminEmails,
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
