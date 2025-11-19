
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";

export function HeaderRightButton() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  // If admin, show Admin Dashboard button
  if (isAdmin) {
    return (
      <Pressable
        onPress={() => router.push('/(tabs)/admin-dashboard')}
        style={styles.headerButtonContainer}
      >
        <IconSymbol 
          ios_icon_name="shield.lefthalf.filled" 
          android_material_icon_name="admin_panel_settings" 
          color={theme.colors.primary} 
        />
      </Pressable>
    );
  }

  // Default button for non-admin users
  return (
    <Pressable
      onPress={() => router.push('/(tabs)/profile')}
      style={styles.headerButtonContainer}
    >
      <IconSymbol 
        ios_icon_name="person.circle" 
        android_material_icon_name="account_circle" 
        color={theme.colors.primary} 
      />
    </Pressable>
  );
}

export function HeaderLeftButton() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/global-services')}
      style={styles.headerButtonContainer}
    >
      <IconSymbol 
        ios_icon_name="square.grid.2x2" 
        android_material_icon_name="apps" 
        color={theme.colors.primary} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButtonContainer: {
    padding: 6,
  },
});
