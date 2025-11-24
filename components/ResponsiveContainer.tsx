
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { getContainerWidth, spacing } from '@/styles/responsiveStyles';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
  noPadding?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  centered = true,
  noPadding = false,
}) => {
  const containerWidth = getContainerWidth();

  return (
    <View
      style={[
        styles.container,
        {
          maxWidth: containerWidth,
          paddingHorizontal: noPadding ? 0 : spacing.lg,
        },
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  centered: {
    alignSelf: 'center',
  },
});
