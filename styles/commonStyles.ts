
import { useColorScheme } from 'react-native';

export const useColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    primary: '#03A9F4',
    secondary: '#FF5722',
    accent: '#FF9800',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    background: isDark ? '#121212' : '#FFFFFF',
    card: isDark ? '#1E1E1E' : '#F5F5F5',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#B0B0B0' : '#666666',
    border: isDark ? '#333333' : '#E0E0E0',
  };
};

export const colors = {
  primary: '#03A9F4',
  secondary: '#FF5722',
  accent: '#FF9800',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  background: '#FFFFFF',
  backgroundDark: '#121212',
  card: '#F5F5F5',
  cardDark: '#1E1E1E',
  text: '#000000',
  textDark: '#FFFFFF',
  textSecondary: '#666666',
  textSecondaryDark: '#B0B0B0',
  border: '#E0E0E0',
  borderDark: '#333333',
};
