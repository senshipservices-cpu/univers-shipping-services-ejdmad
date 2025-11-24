
# Guide de Cohérence Cross-Platform

## Vue d'ensemble

Ce guide explique comment maintenir une cohérence visuelle et fonctionnelle parfaite entre les plateformes web, iOS et Android dans l'application Universal Shipping Services.

## Principes Fondamentaux

### 1. Design Responsive

Tous les écrans doivent s'adapter automatiquement à différentes tailles d'écran en utilisant le système de styles responsifs.

**Utilisation:**
```typescript
import { 
  getFontSize, 
  spacing, 
  borderRadius, 
  getShadow,
  getCardWidth,
  layout
} from '@/styles/responsiveStyles';

// Tailles de police adaptatives
fontSize: getFontSize('md')

// Espacement cohérent
padding: spacing.lg

// Bordures arrondies
borderRadius: borderRadius.md

// Ombres cross-platform
...getShadow('md')

// Largeur de carte responsive
width: getCardWidth(2, spacing.md)
```

### 2. Composants Responsifs

Utilisez les composants responsifs pour garantir une mise en page cohérente:

**ResponsiveContainer:**
```typescript
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

<ResponsiveContainer>
  <View style={styles.content}>
    {/* Contenu centré avec largeur maximale adaptative */}
  </View>
</ResponsiveContainer>
```

**ResponsiveGrid:**
```typescript
import { ResponsiveGrid } from '@/components/ResponsiveGrid';

<ResponsiveGrid columns={2} gap={spacing.md}>
  {items.map((item, index) => (
    <Card key={index} item={item} />
  ))}
</ResponsiveGrid>
```

### 3. Gestion des Safe Areas

**Android:**
- Padding top automatique de 48px pour éviter le notch
- Appliqué via `getSafeAreaPadding()`

**iOS:**
- Gestion automatique via SafeAreaView
- Pas de padding manuel nécessaire

**Web:**
- Padding top de 20px pour l'espacement
- Appliqué via `getSafeAreaPadding()`

**Utilisation:**
```typescript
import { getSafeAreaPadding } from '@/styles/responsiveStyles';

<View style={[styles.header, getSafeAreaPadding()]}>
  {/* Contenu du header */}
</View>
```

### 4. Ombres Cross-Platform

Les ombres doivent être cohérentes sur toutes les plateformes:

```typescript
import { getShadow } from '@/styles/responsiveStyles';

// Petite ombre
...getShadow('sm')

// Ombre moyenne
...getShadow('md')

// Grande ombre
...getShadow('lg')
```

Cela génère automatiquement:
- **iOS:** shadowColor, shadowOffset, shadowOpacity, shadowRadius
- **Android:** elevation
- **Web:** boxShadow

### 5. Navigation Cohérente

**Problème résolu:**
- Avant: iOS utilisait NativeTabs, Android/Web utilisait FloatingTabBar
- Maintenant: Tous utilisent FloatingTabBar avec adaptation responsive

**FloatingTabBar responsive:**
- Mobile: Largeur adaptée à l'écran (max 420px)
- Tablet: 60% de la largeur d'écran (max 600px)
- Desktop: 50% de la largeur d'écran (max 700px)

### 6. Écrans Identiques

**Problème résolu:**
- Avant: `index.ios.tsx` affichait un écran différent de `index.tsx`
- Maintenant: `index.ios.tsx` réexporte `index.tsx` pour garantir la cohérence

**Règle:**
Tous les fichiers `.ios.tsx` doivent soit:
1. Réexporter le fichier `.tsx` par défaut si le contenu doit être identique
2. Utiliser les mêmes composants responsifs si des ajustements spécifiques sont nécessaires

```typescript
// index.ios.tsx
export { default } from './index';
```

## Checklist de Cohérence

Lors de la création ou modification d'un écran, vérifiez:

- [ ] Utilisation de `getFontSize()` pour toutes les tailles de police
- [ ] Utilisation de `spacing` pour tous les paddings/margins
- [ ] Utilisation de `borderRadius` pour tous les coins arrondis
- [ ] Utilisation de `getShadow()` pour toutes les ombres
- [ ] Utilisation de `ResponsiveContainer` pour le contenu principal
- [ ] Utilisation de `getSafeAreaPadding()` pour les headers
- [ ] Test sur mobile (iOS/Android) ET web
- [ ] Vérification de l'apparence en mode clair et sombre
- [ ] Vérification sur différentes tailles d'écran (mobile, tablet, desktop)

## Breakpoints

```typescript
mobile: 480px
tablet: 768px
desktop: 1024px
largeDesktop: 1440px
```

## Détection de Type d'Appareil

```typescript
import { getDeviceType, layout } from '@/styles/responsiveStyles';

const deviceType = getDeviceType(); // 'mobile' | 'tablet' | 'desktop' | 'largeDesktop'

// Ou utilisez les helpers
if (layout.isSmallDevice) {
  // Appareil < 480px
}

if (layout.isLargeDevice) {
  // Appareil >= 768px
}
```

## Grilles Responsives

Les grilles s'adaptent automatiquement:
- **Mobile:** 2 colonnes
- **Tablet:** 3 colonnes
- **Desktop:** 4 colonnes

```typescript
import { getGridColumns } from '@/styles/responsiveStyles';

const columns = getGridColumns();
```

## Largeurs de Cartes

Calculez automatiquement la largeur des cartes dans une grille:

```typescript
import { getCardWidth } from '@/styles/responsiveStyles';

// Pour une grille de 2 colonnes avec gap de 12px
const cardWidth = getCardWidth(2, 12);

<View style={{ width: cardWidth }}>
  {/* Contenu de la carte */}
</View>
```

## Icônes Cross-Platform

Utilisez toujours `IconSymbol` avec les deux props:

```typescript
<IconSymbol
  ios_icon_name="house.fill"
  android_material_icon_name="home"
  size={24}
  color={colors.primary}
/>
```

## Tests Recommandés

### 1. Test Visuel
- [ ] iPhone SE (petit écran mobile)
- [ ] iPhone 14 Pro (écran mobile standard)
- [ ] iPad (tablet)
- [ ] Desktop 1920x1080
- [ ] Desktop 2560x1440

### 2. Test Fonctionnel
- [ ] Navigation entre écrans
- [ ] Interactions tactiles/clics
- [ ] Formulaires et inputs
- [ ] Modals et overlays
- [ ] Animations et transitions

### 3. Test de Performance
- [ ] Temps de chargement initial
- [ ] Fluidité des animations
- [ ] Réactivité des interactions

## Erreurs Courantes à Éviter

### ❌ Mauvais
```typescript
// Largeur fixe
width: 350

// Padding fixe sans système
paddingTop: 48

// Ombre non cross-platform
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,

// Taille de police fixe
fontSize: 16
```

### ✅ Bon
```typescript
// Largeur responsive
width: getCardWidth(2, spacing.md)

// Padding du système
paddingTop: spacing.huge

// Ombre cross-platform
...getShadow('sm')

// Taille de police responsive
fontSize: getFontSize('md')
```

## Maintenance Continue

### Ajout de Nouveaux Écrans

1. Créer le fichier `.tsx` principal avec styles responsifs
2. Si nécessaire, créer `.ios.tsx` qui réexporte le principal
3. Tester sur les 3 plateformes
4. Vérifier la checklist de cohérence

### Modification d'Écrans Existants

1. Vérifier si des fichiers `.ios.tsx` ou `.android.tsx` existent
2. Appliquer les changements de manière cohérente
3. Tester sur toutes les plateformes affectées
4. Vérifier que les styles responsifs sont utilisés

## Ressources

- **Styles responsifs:** `styles/responsiveStyles.ts`
- **Composants responsifs:** `components/ResponsiveContainer.tsx`, `components/ResponsiveGrid.tsx`
- **Styles communs:** `styles/commonStyles.ts`
- **Exemples:** `app/(tabs)/(home)/index.tsx`

## Support

Pour toute question sur la cohérence cross-platform, consultez ce guide ou référez-vous aux exemples dans le code existant.
