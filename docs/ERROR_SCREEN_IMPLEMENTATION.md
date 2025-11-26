
# USS Error Screen Implementation Guide

## 🎯 Objectif

Implémenter un écran d'erreur universel qui fonctionne de manière identique sur Web, iOS et Android pour gérer toutes les erreurs non gérées de l'application.

## ✅ Implémentation complète

### 1. Écran d'erreur créé

**Fichier**: `app/(tabs)/error-screen.tsx`

Cet écran affiche:
- ✅ Logo USS
- ✅ Message d'erreur convivial
- ✅ Bouton "Réessayer"
- ✅ Bouton "Retour à l'accueil"
- ✅ Informations de contact support
- ✅ Design cohérent Web/iOS/Android

### 2. ErrorBoundary existant

**Fichier**: `components/ErrorBoundary.tsx`

L'ErrorBoundary capture déjà les erreurs React et affiche un écran de secours. Il est déjà intégré dans `app/_layout.tsx`.

### 3. Navigation vers l'écran d'erreur

Pour rediriger vers l'écran d'erreur USS depuis n'importe où dans l'app:

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// En cas d'erreur critique
try {
  // Code qui peut échouer
} catch (error) {
  console.error('Critical error:', error);
  router.replace('/(tabs)/error-screen');
}
```

## 🔧 Configuration de l'ErrorBoundary

### Option 1: Utiliser l'ErrorBoundary existant (Recommandé)

L'ErrorBoundary actuel dans `components/ErrorBoundary.tsx` affiche déjà:
- Message d'erreur convivial
- Détails de l'erreur en mode développement
- Bouton "Try Again" pour réinitialiser
- Informations de plateforme

**Avantages:**
- ✅ Déjà intégré dans l'app
- ✅ Capture toutes les erreurs React
- ✅ Fonctionne sur toutes les plateformes
- ✅ Affiche les détails en développement

### Option 2: Rediriger vers l'écran USS Error

Pour utiliser l'écran USS Error personnalisé, modifiez `components/ErrorBoundary.tsx`:

```typescript
// Dans ErrorBoundary.tsx, méthode render()
if (this.state.hasError) {
  // Option: Rediriger vers l'écran USS Error
  // Note: Cela nécessite un contexte de navigation
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Réinitialiser l'état et naviguer
          this.handleReset();
          // Navigation vers error-screen si nécessaire
        }}
      >
        <Text style={styles.buttonText}>Voir l'écran d'erreur USS</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🎨 Personnalisation de l'écran d'erreur

### Modifier les messages

Dans `app/(tabs)/error-screen.tsx`:

```typescript
// Message principal
<Text style={[styles.errorTitle, { color: theme.colors.text }]}>
  Oups, une erreur est survenue…
</Text>

// Message secondaire
<Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
  Nous sommes désolés pour ce désagrément...
</Text>
```

### Ajouter des traductions

Pour supporter plusieurs langues, utilisez le contexte de langue:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function ErrorScreen() {
  const { t, language } = useLanguage();
  
  return (
    <Text style={styles.errorTitle}>
      {language === 'en' ? 'Oops, an error occurred...' : 'Oups, une erreur est survenue…'}
    </Text>
  );
}
```

### Personnaliser les actions

```typescript
const handleRetry = async () => {
  // Action personnalisée
  console.log('Custom retry action');
  
  // Recharger l'app (natif)
  if (Platform.OS !== 'web') {
    await Updates.reloadAsync();
  }
  
  // Ou naviguer vers un écran spécifique
  router.replace('/(tabs)/(home)/');
};
```

## 🔗 Intégration avec le système de logging

L'écran d'erreur fonctionne avec le système de logging existant:

```typescript
import { logError } from '@/utils/errorLogger';

// Logger une erreur avant de naviguer vers l'écran d'erreur
try {
  // Code qui peut échouer
} catch (error) {
  logError(error, {
    component: 'MyComponent',
    action: 'criticalOperation',
  }, 'critical');
  
  router.replace('/(tabs)/error-screen');
}
```

## 📱 Comportement par plateforme

### Web
- Affiche l'écran d'erreur dans le navigateur
- Bouton "Réessayer" recharge la page ou navigue vers l'accueil
- Support du bouton retour du navigateur

### iOS
- Affiche l'écran d'erreur en plein écran
- Bouton "Réessayer" utilise `Updates.reloadAsync()` si disponible
- Design adapté aux guidelines iOS

### Android
- Affiche l'écran d'erreur avec padding supérieur pour la notch
- Bouton "Réessayer" utilise `Updates.reloadAsync()` si disponible
- Design adapté aux guidelines Material Design

## 🧪 Tests

### Test manuel

1. **Déclencher une erreur volontaire:**

```typescript
// Dans n'importe quel écran
const triggerError = () => {
  throw new Error('Test error for USS Error Screen');
};

<TouchableOpacity onPress={triggerError}>
  <Text>Déclencher une erreur</Text>
</TouchableOpacity>
```

2. **Naviguer directement:**

```typescript
router.push('/(tabs)/error-screen');
```

### Test de l'ErrorBoundary

```typescript
// Créer un composant qui génère une erreur
function BuggyComponent() {
  throw new Error('ErrorBoundary test');
  return <Text>This will never render</Text>;
}

// L'ErrorBoundary capturera l'erreur
<ErrorBoundary>
  <BuggyComponent />
</ErrorBoundary>
```

## 📊 Métriques et monitoring

Pour suivre les erreurs en production:

```typescript
// Dans errorLogger.ts
private sendToLoggingService(errorLog: ErrorLog): void {
  // Intégrer avec un service de monitoring
  // Exemples: Sentry, LogRocket, Firebase Crashlytics
  
  if (!__DEV__) {
    // Envoyer à votre service de monitoring
    fetch('https://your-logging-service.com/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog),
    });
  }
}
```

## 🎯 Checklist d'implémentation

- [x] Écran d'erreur USS créé (`app/(tabs)/error-screen.tsx`)
- [x] Route ajoutée dans `app/(tabs)/_layout.tsx`
- [x] ErrorBoundary existant vérifié et fonctionnel
- [x] Système de logging intégré
- [x] Design responsive pour Web/iOS/Android
- [x] Boutons d'action fonctionnels
- [x] Contact support intégré
- [ ] Tests manuels effectués sur toutes les plateformes
- [ ] Traductions ajoutées (si nécessaire)
- [ ] Service de monitoring configuré (optionnel)

## 🚀 Prochaines étapes

1. **Tester l'écran d'erreur:**
   - Déclencher des erreurs volontaires
   - Vérifier le comportement sur Web, iOS et Android
   - Tester les boutons "Réessayer" et "Retour à l'accueil"

2. **Configurer le monitoring (optionnel):**
   - Intégrer Sentry ou un autre service
   - Configurer les alertes pour les erreurs critiques
   - Suivre les métriques d'erreur

3. **Ajouter des traductions:**
   - Ajouter les clés dans `i18n/translations.ts`
   - Supporter FR/EN/ES/AR

4. **Documenter pour l'équipe:**
   - Partager ce guide avec l'équipe
   - Former sur l'utilisation de l'écran d'erreur
   - Établir des procédures de gestion des erreurs

## 📝 Exemple d'utilisation complète

```typescript
import { useRouter } from 'expo-router';
import { logError } from '@/utils/errorLogger';

export default function MyScreen() {
  const router = useRouter();
  
  const handleCriticalOperation = async () => {
    try {
      // Opération critique
      await performCriticalTask();
    } catch (error) {
      // Logger l'erreur
      logError(error, {
        component: 'MyScreen',
        action: 'handleCriticalOperation',
        userId: user?.id,
      }, 'critical');
      
      // Afficher l'écran d'erreur USS
      router.replace('/(tabs)/error-screen');
    }
  };
  
  return (
    <View>
      <TouchableOpacity onPress={handleCriticalOperation}>
        <Text>Opération critique</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🔗 Ressources

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Expo Updates API](https://docs.expo.dev/versions/latest/sdk/updates/)
- [Error Handling Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)
