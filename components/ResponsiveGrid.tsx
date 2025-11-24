
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { getGridColumns, getCardWidth, spacing } from '@/styles/responsiveStyles';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: ViewStyle;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  gap = spacing.md,
  style,
}) => {
  const autoColumns = columns || getGridColumns();
  const childArray = React.Children.toArray(children);

  return (
    <View style={[styles.grid, { gap }, style]}>
      {childArray.map((child, index) => (
        <View
          key={index}
          style={{
            width: `${(100 / autoColumns) - (gap * (autoColumns - 1) / autoColumns / 10)}%`,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
