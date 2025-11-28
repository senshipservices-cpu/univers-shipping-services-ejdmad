
import React from 'react';
import { IconSymbol } from './IconSymbol';
import { getIconMapping, IconMapping } from '@/utils/iconMappings';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';
import { SymbolWeight } from 'expo-symbols';

interface IconProps {
  /**
   * Icon concept name (e.g., 'home', 'person', 'ship')
   * This will automatically map to the correct icon for each platform
   */
  name: string;
  
  /**
   * Optional: Override with custom iOS icon name
   */
  iosIconName?: string;
  
  /**
   * Optional: Override with custom Android icon name
   */
  androidIconName?: string;
  
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}

/**
 * Smart Icon component that automatically maps icon concepts to platform-specific icons
 * Falls back to help icon if the concept is not found
 */
export function Icon({
  name,
  iosIconName,
  androidIconName,
  size = 24,
  color,
  style,
  weight,
}: IconProps) {
  // Try to get mapping from concept name
  const mapping = getIconMapping(name);
  
  // Use custom names if provided, otherwise use mapping, otherwise fallback
  const finalIosIcon = iosIconName || mapping?.ios || 'questionmark.circle.fill';
  const finalAndroidIcon = androidIconName || mapping?.android || 'help_outline';
  
  // Warn if no mapping found and no custom names provided
  if (!mapping && !iosIconName && !androidIconName) {
    console.warn(`[Icon] No mapping found for concept "${name}". Using fallback icons.`);
  }
  
  return (
    <IconSymbol
      ios_icon_name={finalIosIcon}
      android_material_icon_name={finalAndroidIcon as any}
      size={size}
      color={color}
      style={style}
      weight={weight}
    />
  );
}
