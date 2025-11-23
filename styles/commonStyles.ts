
import { useColorScheme } from 'react-native';

// Official Universal Shipping Services Color Palette
export const brandColors = {
  maritimeBlue: '#002C5F',    // Primary - Maritime Blue
  oceanBlue: '#0084FF',       // Secondary - Ocean Blue
  aquaSky: '#00C2FF',         // Accent - Aqua Sky
  pureWhite: '#FFFFFF',       // Pure White
  lightGrey: '#F2F4F7',       // Light Grey
};

export const useColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    primary: brandColors.maritimeBlue,
    secondary: brandColors.oceanBlue,
    accent: brandColors.aquaSky,
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    background: isDark ? '#121212' : brandColors.pureWhite,
    card: isDark ? '#1E1E1E' : brandColors.lightGrey,
    text: isDark ? brandColors.pureWhite : '#000000',
    textSecondary: isDark ? '#B0B0B0' : '#666666',
    border: isDark ? '#333333' : '#E0E0E0',
    highlight: isDark ? '#2A2A2A' : '#F0F8FF',
  };
};

export const colors = {
  // Official Brand Colors
  primary: brandColors.maritimeBlue,
  secondary: brandColors.oceanBlue,
  accent: brandColors.aquaSky,
  
  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  
  // Light Mode
  background: brandColors.pureWhite,
  card: brandColors.lightGrey,
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  highlight: '#F0F8FF',
  
  // Dark Mode
  backgroundDark: '#121212',
  cardDark: '#1E1E1E',
  textDark: brandColors.pureWhite,
  textSecondaryDark: '#B0B0B0',
  borderDark: '#333333',
  highlightDark: '#2A2A2A',
};
