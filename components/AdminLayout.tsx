
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  activeMenu?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  androidIcon: string;
  route: string;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'chart.bar.fill',
    androidIcon: 'dashboard',
    route: '/(tabs)/admin-dashboard',
    color: colors.primary,
  },
  {
    id: 'quotes',
    label: 'Devis',
    icon: 'doc.text.fill',
    androidIcon: 'description',
    route: '/(tabs)/admin',
    color: colors.secondary,
  },
  {
    id: 'shipments',
    label: 'Shipments',
    icon: 'shippingbox.fill',
    androidIcon: 'inventory_2',
    route: '/(tabs)/admin',
    color: '#10b981',
  },
  {
    id: 'agents',
    label: 'Agents & Ports',
    icon: 'person.3.fill',
    androidIcon: 'groups',
    route: '/(tabs)/admin',
    color: '#f59e0b',
  },
  {
    id: 'subscriptions',
    label: 'Abonnements',
    icon: 'star.fill',
    androidIcon: 'star',
    route: '/(tabs)/admin',
    color: '#8b5cf6',
  },
  {
    id: 'services',
    label: 'Services',
    icon: 'wrench.and.screwdriver.fill',
    androidIcon: 'build',
    route: '/(tabs)/admin',
    color: '#ec4899',
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: 'person.2.fill',
    androidIcon: 'people',
    route: '/(tabs)/admin',
    color: '#06b6d4',
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: 'gearshape.fill',
    androidIcon: 'settings',
    route: '/(tabs)/admin',
    color: colors.textSecondary,
  },
];

export default function AdminLayout({ children, title, activeMenu }: AdminLayoutProps) {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(tabs)/(home)/');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/admin')} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.adminEmail, { color: colors.textSecondary }]} numberOfLines={1}>
            {user?.email}
          </Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <IconSymbol
              ios_icon_name="rectangle.portrait.and.arrow.right"
              android_material_icon_name="logout"
              size={24}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Sidebar */}
        <View style={[styles.sidebar, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sidebarContent}>
              <Text style={[styles.sidebarTitle, { color: colors.textSecondary }]}>
                MENU ADMIN
              </Text>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    activeMenu === item.id && { backgroundColor: colors.primary + '15' },
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <IconSymbol
                    ios_icon_name={item.icon}
                    android_material_icon_name={item.androidIcon}
                    size={20}
                    color={activeMenu === item.id ? colors.primary : item.color}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: activeMenu === item.id ? colors.primary : theme.colors.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminEmail: {
    fontSize: 14,
    maxWidth: 150,
  },
  logoutButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    borderRightWidth: 1,
  },
  sidebarContent: {
    padding: 16,
    gap: 4,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
  },
});
