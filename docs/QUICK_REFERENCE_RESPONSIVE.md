
# Quick Reference - Styles Responsifs

## Import
```typescript
import { 
  getFontSize, 
  spacing, 
  borderRadius, 
  getShadow,
  getCardWidth,
  getSafeAreaPadding,
  getDeviceType,
  layout
} from '@/styles/responsiveStyles';
```

## Tailles de Police
```typescript
fontSize: getFontSize('xs')    // 11px (mobile) → 12px (desktop)
fontSize: getFontSize('sm')    // 13px → 15px
fontSize: getFontSize('md')    // 15px → 17px
fontSize: getFontSize('lg')    // 17px → 20px
fontSize: getFontSize('xl')    // 20px → 23px
fontSize: getFontSize('xxl')   // 24px → 28px
fontSize: getFontSize('xxxl')  // 28px → 32px
```

## Espacement
```typescript
padding: spacing.xs     // 4px
padding: spacing.sm     // 8px
padding: spacing.md     // 12px
padding: spacing.lg     // 16px
padding: spacing.xl     // 20px
padding: spacing.xxl    // 24px
padding: spacing.xxxl   // 32px
padding: spacing.huge   // 40px
```

## Bordures Arrondies
```typescript
borderRadius: borderRadius.sm     // 8px
borderRadius: borderRadius.md     // 12px
borderRadius: borderRadius.lg     // 16px
borderRadius: borderRadius.xl     // 20px
borderRadius: borderRadius.xxl    // 24px
borderRadius: borderRadius.round  // 999px (complètement rond)
```

## Ombres Cross-Platform
```typescript
...getShadow('sm')  // Petite ombre
...getShadow('md')  // Ombre moyenne
...getShadow('lg')  // Grande ombre
```

## Safe Area Padding
```typescript
// Dans le style du header
<View style={[styles.header, getSafeAreaPadding()]}>
```

## Largeurs Responsives
```typescript
// Largeur de carte dans une grille
const cardWidth = getCardWidth(2, spacing.md);  // 2 colonnes, gap 12px

// Largeur de conteneur
const containerWidth = getContainerWidth();
```

## Détection d'Appareil
```typescript
const deviceType = getDeviceType();
// 'mobile' | 'tablet' | 'desktop' | 'largeDesktop'

// Ou utilisez les helpers
if (layout.isSmallDevice) { /* < 480px */ }
if (layout.isMediumDevice) { /* 480px - 768px */ }
if (layout.isLargeDevice) { /* >= 768px */ }
```

## Composants Responsifs

### ResponsiveContainer
```typescript
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

<ResponsiveContainer>
  <View style={styles.content}>
    {/* Contenu centré avec largeur max adaptative */}
  </View>
</ResponsiveContainer>

// Options
<ResponsiveContainer 
  centered={false}    // Pas de centrage
  noPadding={true}    // Pas de padding horizontal
>
```

### ResponsiveGrid
```typescript
import { ResponsiveGrid } from '@/components/ResponsiveGrid';

<ResponsiveGrid columns={2} gap={spacing.md}>
  {items.map((item, index) => (
    <Card key={index} item={item} />
  ))}
</ResponsiveGrid>

// Colonnes automatiques selon l'appareil
<ResponsiveGrid gap={spacing.lg}>
  {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
</ResponsiveGrid>
```

## Exemple Complet
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { 
  getFontSize, 
  spacing, 
  borderRadius, 
  getShadow,
  getCardWidth,
  getSafeAreaPadding
} from '@/styles/responsiveStyles';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { colors } from '@/styles/commonStyles';

export default function MyScreen() {
  const theme = useTheme();
  const cardWidth = getCardWidth(2, spacing.md);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header avec safe area */}
      <View style={[styles.header, getSafeAreaPadding()]}>
        <Text style={styles.headerTitle}>Mon Écran</Text>
      </View>

      {/* Contenu responsive */}
      <ResponsiveContainer>
        <View style={styles.content}>
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Carte 1</Text>
          </View>
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.cardTitle}>Carte 2</Text>
          </View>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: getFontSize('xl'),
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    ...getShadow('sm'),
  },
  cardTitle: {
    fontSize: getFontSize('md'),
    fontWeight: '600',
  },
});
```

## Checklist Rapide

Avant de commit:
- [ ] `getFontSize()` pour toutes les tailles de police
- [ ] `spacing` pour tous les padding/margin
- [ ] `borderRadius` pour tous les coins arrondis
- [ ] `getShadow()` pour toutes les ombres
- [ ] `ResponsiveContainer` pour le contenu principal
- [ ] `getSafeAreaPadding()` pour les headers
- [ ] Testé sur mobile ET web
- [ ] Vérifié en mode clair ET sombre

## Erreurs Courantes

### ❌ À Éviter
```typescript
width: 350                    // Largeur fixe
paddingTop: 48               // Padding hardcodé
fontSize: 16                 // Taille fixe
shadowColor: '#000'          // Ombre non cross-platform
```

### ✅ À Utiliser
```typescript
width: getCardWidth(2, spacing.md)
paddingTop: spacing.huge
fontSize: getFontSize('md')
...getShadow('sm')
```

## Breakpoints
```typescript
mobile: 480px
tablet: 768px
desktop: 1024px
largeDesktop: 1440px
```

## Ressources
- Guide complet: `docs/CROSS_PLATFORM_CONSISTENCY_GUIDE.md`
- Implémentation: `docs/COHERENCE_CROSS_PLATFORM_IMPLEMENTATION.md`
- Code source: `styles/responsiveStyles.ts`
