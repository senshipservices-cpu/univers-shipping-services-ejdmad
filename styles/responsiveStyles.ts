
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for responsive design
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

// Determine device type
export const getDeviceType = () => {
  if (SCREEN_WIDTH >= breakpoints.largeDesktop) return 'largeDesktop';
  if (SCREEN_WIDTH >= breakpoints.desktop) return 'desktop';
  if (SCREEN_WIDTH >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};

// Responsive spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

// Responsive font sizes
export const getFontSize = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl') => {
  const deviceType = getDeviceType();
  const baseSizes = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  };

  const multiplier = deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 1.1 : 1.15;
  return Math.round(baseSizes[size] * multiplier);
};

// Responsive padding for safe areas
export const getSafeAreaPadding = () => {
  if (Platform.OS === 'android') {
    return { paddingTop: 48 };
  }
  if (Platform.OS === 'ios') {
    return {}; // iOS handles safe area automatically
  }
  // Web
  return { paddingTop: 20 };
};

// Container width for consistent layouts
export const getContainerWidth = () => {
  const deviceType = getDeviceType();
  if (deviceType === 'mobile') return SCREEN_WIDTH - 40;
  if (deviceType === 'tablet') return Math.min(SCREEN_WIDTH - 80, 700);
  return Math.min(SCREEN_WIDTH - 120, 1200);
};

// Grid columns based on screen size
export const getGridColumns = () => {
  const deviceType = getDeviceType();
  if (deviceType === 'mobile') return 2;
  if (deviceType === 'tablet') return 3;
  return 4;
};

// Card width for grid layouts
export const getCardWidth = (columns: number = 2, gap: number = 12) => {
  const containerWidth = getContainerWidth();
  return (containerWidth - gap * (columns - 1)) / columns;
};

// Responsive border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

// Shadow styles that work across platforms
export const getShadow = (elevation: 'sm' | 'md' | 'lg') => {
  const shadows = {
    sm: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
        },
      }),
    },
    md: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    lg: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
        },
      }),
    },
  };

  return shadows[elevation];
};

// Responsive icon sizes
export const getIconSize = (size: 'sm' | 'md' | 'lg' | 'xl') => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };
  return sizes[size];
};

// Check if device is mobile (iOS or Android)
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Check if device is web
export const isWeb = Platform.OS === 'web';

// Get platform-specific styles
export const getPlatformStyles = () => ({
  // Use native safe area on iOS, manual padding on Android/Web
  safeAreaTop: getSafeAreaPadding(),
  
  // Consistent touch feedback
  touchOpacity: 0.7,
  
  // Consistent animations
  animationDuration: 200,
});

// Responsive layout helpers
export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < breakpoints.mobile,
  isMediumDevice: SCREEN_WIDTH >= breakpoints.mobile && SCREEN_WIDTH < breakpoints.tablet,
  isLargeDevice: SCREEN_WIDTH >= breakpoints.tablet,
};
