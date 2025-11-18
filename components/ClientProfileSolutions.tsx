
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors } from '@/styles/commonStyles';

interface ProfileCard {
  title: string;
  points: string[];
  buttonLabel: string;
  menuGroupFilter: string;
  icon: string;
  color: string;
}

export function ClientProfileSolutions() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

  const profileCards: ProfileCard[] = [
    {
      title: t.home.profileImportersExporters,
      points: [
        t.home.profileImportersPoint1,
        t.home.profileImportersPoint2,
        t.home.profileImportersPoint3,
      ],
      buttonLabel: t.home.profileImportersButton,
      menuGroupFilter: 'Logistics & Port Handling',
      icon: 'local_shipping',
      color: colors.primary,
    },
    {
      title: t.home.profileShipowners,
      points: [
        t.home.profileShipownersPoint1,
        t.home.profileShipownersPoint2,
        t.home.profileShipownersPoint3,
      ],
      buttonLabel: t.home.profileShipownersButton,
      menuGroupFilter: 'Maritime & Shipping Services',
      icon: 'directions_boat',
      color: colors.secondary,
    },
    {
      title: t.home.profileBusinessB2B,
      points: [
        t.home.profileBusinessPoint1,
        t.home.profileBusinessPoint2,
        t.home.profileBusinessPoint3,
      ],
      buttonLabel: t.home.profileBusinessButton,
      menuGroupFilter: 'Trade & Consulting',
      icon: 'business_center',
      color: colors.accent,
    },
  ];

  const handleCardPress = (menuGroupFilter: string) => {
    console.log('Navigating to global-services with filter:', menuGroupFilter);
    router.push({
      pathname: '/(tabs)/global-services',
      params: { menu_group: menuGroupFilter }
    });
  };

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t.home.profileSolutionsTitle}
      </Text>
      <Text style={styles.sectionSubtitle}>
        {t.home.profileSolutionsSubtitle}
      </Text>

      <View style={styles.cardsContainer}>
        {profileCards.map((card, index) => (
          <React.Fragment key={index}>
            <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                <IconSymbol
                  ios_icon_name={card.icon}
                  android_material_icon_name={card.icon as any}
                  size={36}
                  color="#ffffff"
                />
              </View>

              {/* Title */}
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {card.title}
              </Text>

              {/* Points */}
              <View style={styles.pointsContainer}>
                {card.points.map((point, pointIndex) => (
                  <React.Fragment key={pointIndex}>
                    <View style={styles.pointRow}>
                      <View style={[styles.pointDot, { backgroundColor: card.color }]} />
                      <Text style={[styles.pointText, { color: colors.textSecondary }]}>
                        {point}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>

              {/* Button */}
              <TouchableOpacity
                style={[styles.cardButton, { backgroundColor: card.color }]}
                onPress={() => handleCardPress(card.menuGroupFilter)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardButtonText}>{card.buttonLabel}</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow_forward"
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 20,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 28,
  },
  pointsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
