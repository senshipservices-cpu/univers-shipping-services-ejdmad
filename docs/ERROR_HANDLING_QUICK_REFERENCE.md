
# Guide Rapide: Gestion des Erreurs & Prévention des Crashes

## 🎯 Résumé des Changements

### 1. Écran d'Erreur Universel ✅
**Fichier:** `app/(tabs)/error-screen.tsx`

**Fonctionnalités:**
- Logo USS professionnel
- Message: "Oups, une erreur est survenue…"
- Bouton "Réessayer" fonctionnel
- Contact support: support@universalshippingservices.com
- Fonctionne sur Web, iOS et Android

**Utilisation:**
```typescript
// L'écran s'affiche automatiquement via ErrorBoundary
// Ou navigation manuelle:
router.push('/(tabs)/error-screen');
```

### 2. ErrorBoundary Amélioré ✅
**Fichier:** `components/ErrorBoundary.tsx`

**Améliorations:**
- Capture toutes les erreurs React
- Logs détaillés avec plateforme
- UI utilisateur friendly
- Détails techniques en mode dev
- Bouton "Réessayer" pour reset

**Wrapping:**
```typescript
// Déjà implémenté dans app/_layout.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 3. Navigation Sans Boucles ✅
**Fichier:** `app/(tabs)/login.tsx`

**Changements:**
- ❌ Auto-navigation désactivée dans useEffect
- ✅ Navigation uniquement après action utilisateur
- ✅ Utilise router.replace() pour éviter la pile

**Avant:**
```typescript
useEffect(() => {
  if (user) router.push('/dashboard'); // BOUCLE!
}, [user]);
```

**Après:**
```typescript
const handleLogin = async () => {
  const { error } = await signIn(email, password);
  if (!error) router.replace('/dashboard'); // OK
};
```

### 4. Error Logger Platform-Agnostic ✅
**Fichier:** `utils/errorLogger.ts`

**Améliorations:**
- Détection automatique de plateforme
- Pas d'appels web-specific sur native
- Debouncing des erreurs dupliquées
- Catégorisation par sévérité

**Utilisation:**
```typescript
import { logError } from '@/utils/errorLogger';

try {
  await riskyOperation();
} catch (error) {
  logError(error, {
    component: 'MyComponent',
    action: 'riskyOperation'
  }, 'high');
}
```

## 🔧 Configuration App-Level

### app/_layout.tsx
```typescript
export default function RootLayout() {
  useEffect(() => {
    // Setup error logging (platform-agnostic)
    setupErrorLogging();
  }, []);

  return (
    <ErrorBoundary>
      {/* App content */}
    </ErrorBoundary>
  );
}
```

## 📋 Checklist de Déploiement

### Avant de Publier un Build

- [ ] **Vérifier les useEffect**
  - Aucune navigation automatique
  - Aucune boucle de redirection
  
- [ ] **Tester l'ErrorBoundary**
  - Forcer une erreur
  - Vérifier l'affichage de l'écran d'erreur
  - Tester le bouton "Réessayer"

- [ ] **Vérifier les Logs**
  - Console logs clairs
  - Pas d'erreurs "window is not defined"
  - Stack traces complètes

- [ ] **Tests Multi-Plateformes**
  - [ ] Web: Tester dans Chrome/Safari/Firefox
  - [ ] iOS: Tester sur simulateur + device réel
  - [ ] Android: Tester sur émulateur + device réel

### Commandes de Build

```bash
# Development Build (pour tester)
expo build:ios --type development
expo build:android --type development

# Production Build
expo build:ios --type release
expo build:android --type release
```

## 🐛 Debugging

### Comment Forcer une Erreur

```typescript
// Ajouter temporairement dans un écran
const TestError = () => {
  const throwError = () => {
    throw new Error('Test error for debugging');
  };
  
  return (
    <TouchableOpacity onPress={throwError}>
      <Text>🔴 Test Error</Text>
    </TouchableOpacity>
  );
};
```

### Logs à Surveiller

**✅ Logs Normaux:**
```
[ErrorLogger] Setting up error logging for ios
[ERROR_SCREEN] User clicked Retry button
[NAV] login → dashboard (successful login)
```

**❌ Logs Problématiques:**
```
Cannot read property 'addEventListener' of undefined
window is not defined
Maximum call stack size exceeded
Unhandled promise rejection
```

### Outils de Debug iOS

```bash
# Ouvrir Safari
Safari → Développement → [Votre iPhone] → [Votre App]

# Voir les logs console
# Voir les erreurs JavaScript
# Inspecter le DOM (web uniquement)
```

### Outils de Debug Android

```bash
# Chrome DevTools
chrome://inspect

# Ou via adb
adb logcat | grep ReactNativeJS
```

## 🚀 Workflow de Correction

### Si l'App Plante

1. **Identifier la Cause**
   ```bash
   # Vérifier les logs
   expo start --clear
   # Observer la console
   ```

2. **Désactiver les Actions Suspectes**
   ```typescript
   // Commenter temporairement
   // useEffect(() => {
   //   router.push('/somewhere'); // SUSPECT
   // }, []);
   ```

3. **Rebuild et Tester**
   ```bash
   expo start --clear
   # Tester sur device
   ```

4. **Réactiver Une par Une**
   - Décommenter une action
   - Rebuild
   - Tester
   - Répéter jusqu'à trouver la cause

### Si une Erreur n'est pas Capturée

1. **Vérifier l'ErrorBoundary**
   ```typescript
   // S'assurer que le composant est wrappé
   <ErrorBoundary>
     <MyComponent />
   </ErrorBoundary>
   ```

2. **Ajouter des Try-Catch**
   ```typescript
   try {
     await riskyOperation();
   } catch (error) {
     logError(error, { component: 'MyComponent' }, 'high');
   }
   ```

3. **Logger les Promesses**
   ```typescript
   somePromise()
     .catch(error => {
       logError(error, { component: 'MyComponent' }, 'high');
     });
   ```

## 📞 Support

### Informations à Fournir

Si vous avez besoin d'aide:

1. **Plateforme:** iOS / Android / Web
2. **Version:** Numéro de build
3. **Logs:** Copier les logs console
4. **Étapes:** Comment reproduire l'erreur
5. **Screenshots:** Si possible

### Contact

- **Email:** support@universalshippingservices.com
- **Documentation:** Voir `/docs` folder

## 🎯 Résultat Attendu

Après implémentation:

✅ **Aucun crash lié aux boucles de navigation**
✅ **Toutes les erreurs sont capturées et affichées proprement**
✅ **Logs détaillés pour le debugging**
✅ **Expérience utilisateur cohérente sur toutes les plateformes**
✅ **Écran d'erreur professionnel avec branding USS**

---

**Version:** 1.0
**Date:** 2024
**Statut:** ✅ Implémenté et Testé
