
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface TrustItem {
  icon: { ios: string; android: string };
  text: string;
}

interface TrustBarProps {
  items: TrustItem[];
}

export function TrustBar({ items }: TrustBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <View style={styles.item}>
              <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
                <IconSymbol
                  ios_icon_name={item.icon.ios}
                  android_material_icon_name={item.icon.android}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>
                {item.text}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    boxShadow: '0px 4px 12px rgba(76, 175, 80, 0.15)',
    elevation: 4,
  },
  itemsContainer: {
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
});
