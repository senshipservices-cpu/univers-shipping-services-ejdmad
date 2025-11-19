
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
}

export function FAQSection({ title, items }: FAQSectionProps) {
  const theme = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      
      <View style={styles.faqList}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.faqItem,
                { backgroundColor: theme.colors.card, borderColor: colors.border },
              ]}
              onPress={() => toggleFAQ(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
                  {item.question}
                </Text>
                <IconSymbol
                  ios_icon_name={expandedIndex === index ? "chevron.up" : "chevron.down"}
                  android_material_icon_name={expandedIndex === index ? "expand_less" : "expand_more"}
                  size={24}
                  color={colors.primary}
                />
              </View>
              
              {expandedIndex === index && (
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                  {item.answer}
                </Text>
              )}
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
