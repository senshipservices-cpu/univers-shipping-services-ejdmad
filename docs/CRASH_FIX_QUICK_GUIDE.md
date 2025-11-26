
# Guide Rapide - Correction des Crashes TestFlight

## 🎯 Objectif
Corriger les crashes de l'application sur TestFlight causés par des boucles de navigation infinies.

## 📋 Étape 1 – Désactiver tous les workflows auto-lancés

### Écrans à vérifier

#### 1. Home Screen (`app/(tabs)/(home)/index.tsx`)

**Vérifier:**
```typescript
// ❌ À SUPPRIMER ou DÉSACTIVER:
useEffect(() => {
  if (!user) {
    router.push('/(tabs)/login'); // Redirection automatique
  }
}, [user]);

// ✅ CORRECT: Pas de redirection automatique
// Afficher un bouton "Se connecter" à la place
```

**État actuel:** ✅ Pas de redirection automatique détectée

#### 2. Login Screen (`app/(tabs)/login.tsx`)

**Vérifier:**
```typescript
// ✅ CORRECT: Redirection uniquement après connexion réussie
useEffect(() => {
  if (user) {
    // Vérifier email vérifié
    if (!isEmailVerified()) {
      router.replace('/(tabs)/verify-email');
      return;
    }
    
    // Rediriger vers la destination appropriée
    const returnTo = params.returnTo as string;
    if (returnTo === 'subscription-confirm' && plan) {
      router.replace({ pathname: '/(tabs)/subscription-confirm', params: { plan } });
    } else {
      router.replace('/(tabs)/client-dashboard');
    }
  }
}, [user, isEmailVerified, router, params]);
```

**État actuel:** ✅ Redirection conditionnelle correcte

#### 3. Pricing Screen (`app/(tabs)/pricing.tsx`)

**Vérifier:**
```typescript
// ✅ CORRECT: Pas de redirection automatique
// Actions déclenchées uniquement par l'utilisateur via handleSelectPlan()
```

**État actuel:** ✅ Pas de redirection automatique

#### 4. Services Screen (`app/(tabs)/global-services.tsx`)

**Vérifier:**
```typescript
// ✅ CORRECT: Pas de redirection automatique
// Navigation conditionnelle via handleServiceAction()
```

**État actuel:** ✅ Pas de redirection automatique

#### 5. Become Agent Screen (`app/(tabs)/become-agent.tsx`)

**Vérifier:**
```typescript
// ✅ CORRECT: Pas de redirection automatique
// Soumission uniquement via handleSubmit()
```

**État actuel:** ✅ Pas de redirection automatique

### App-level checks

**Fichier:** `app/_layout.tsx`

```typescript
// ✅ CORRECT: Pas de redirection automatique au démarrage
// Seulement validation de configuration et logging
```

**État actuel:** ✅ Pas de redirection automatique

## 📋 Étape 2 – Désactiver les redirections automatiques

### Checklist des écrans critiques

- [x] **Accueil**: Pas de redirection automatique vers Login
- [x] **Login**: Redirection uniquement après connexion réussie
- [x] **Pricing**: Pas de redirection automatique
- [x] **Services**: Pas de redirection automatique
- [x] **Become Agent**: Pas de redirection automatique

### Patterns à éviter

```typescript
// ❌ MAUVAIS: Redirection dans le rendu
export default function MyScreen() {
  if (condition) {
    router.push('/other-screen'); // S'exécute à chaque rendu
  }
  return <View>...</View>;
}

// ❌ MAUVAIS: useEffect sans dépendances
useEffect(() => {
  router.push('/other-screen'); // S'exécute à chaque rendu
});

// ❌ MAUVAIS: useEffect avec condition trop large
useEffect(() => {
  if (user) {
    router.push('/dashboard'); // Peut s'exécuter plusieurs fois
  }
}, [user]);

// ✅ BON: useEffect avec condition stricte et flag
const [hasRedirected, setHasRedirected] = useState(false);
useEffect(() => {
  if (user && !hasRedirected) {
    setHasRedirected(true);
    router.replace('/dashboard'); // Utiliser replace
  }
}, [user, hasRedirected]);
```

## 📋 Étape 3 – Publier un build de test

### Commandes

```bash
# Build iOS Development
eas build --platform ios --profile development

# Ou via Natively
# Publish → Build iOS → Development Build
```

### Test

1. Installer le build sur iPhone
2. Lancer l'application
3. Vérifier qu'elle ne crash pas au démarrage
4. Naviguer entre les écrans principaux
5. Tester les actions utilisateur

### Si l'app ne crash plus

✅ **Succès!** La source du problème a été identifiée et corrigée.

### Si l'app crash encore

❌ Passer à l'étape 4 pour identifier l'action spécifique qui cause le crash.

## 📋 Étape 4 – Réactiver les actions UNE PAR UNE

### Processus

1. **Réactiver une action**
   ```typescript
   // Décommenter une action à la fois
   useEffect(() => {
     if (condition) {
       router.replace('/destination');
     }
   }, [condition]);
   ```

2. **Publier un build**
   ```bash
   eas build --platform ios --profile development
   ```

3. **Tester**
   - Installer le build
   - Tester l'action réactivée
   - Vérifier qu'il n'y a pas de crash

4. **Répéter**
   - Si pas de crash: réactiver l'action suivante
   - Si crash: l'action réactivée est la cause du problème

### Actions à tester dans l'ordre

1. ✅ Home → Services (navigation simple)
2. ✅ Home → Ports (navigation simple)
3. ✅ Home → Pricing (navigation simple)
4. ⚠️ Login → Dashboard (redirection après auth)
5. ⚠️ Pricing → Subscription (redirection conditionnelle)
6. ⚠️ Services → Digital Portal (redirection conditionnelle)

## 🎯 Résultat attendu

### Après correction

- ✅ L'application démarre sans crash
- ✅ Toutes les navigations fonctionnent correctement
- ✅ Pas de boucle infinie
- ✅ Comportement identique sur Web, iOS et Android

### Écran d'erreur USS

- ✅ Écran d'erreur universel créé
- ✅ Affichage cohérent sur toutes les plateformes
- ✅ Bouton "Réessayer" fonctionnel
- ✅ Contact support intégré

## 🔍 Debugging

### Ajouter des logs

```typescript
useEffect(() => {
  console.log('🔍 Navigation check:', {
    user: !!user,
    hasRedirected,
    returnTo: params.returnTo,
  });
  
  if (user && !hasRedirected) {
    console.log('➡️ Navigating to dashboard');
    setHasRedirected(true);
    router.replace('/(tabs)/client-dashboard');
  }
}, [user, hasRedirected, params]);
```

### Vérifier les logs

```bash
# iOS
# Safari → Develop → [Your Device] → [Your App]

# Android
adb logcat | grep "Navigation"

# Web
# Console du navigateur
```

## 📊 État actuel de l'application

### ✅ Corrections déjà appliquées

1. **ErrorBoundary amélioré**
   - Affiche les détails d'erreur en production
   - Logging détaillé pour iOS
   - Bouton "Try Again" fonctionnel

2. **Error Logger platform-agnostic**
   - Pas d'appels web-specific sur iOS/Android
   - Logging centralisé
   - Support de toutes les plateformes

3. **Navigation sécurisée**
   - Pas de redirection automatique dans Home
   - Redirections conditionnelles dans Login
   - Actions utilisateur uniquement dans Pricing/Services

### 🎯 Prochaines étapes

1. **Tester le build actuel**
   - Vérifier qu'il n'y a plus de crash
   - Tester toutes les navigations
   - Valider sur iOS, Android et Web

2. **Monitorer les erreurs**
   - Configurer un service de monitoring (optionnel)
   - Suivre les erreurs en production
   - Réagir rapidement aux problèmes

3. **Documenter les corrections**
   - Partager ce guide avec l'équipe
   - Former sur les bonnes pratiques
   - Établir des procédures de test

## 🔗 Ressources

- [Navigation Loop Prevention Guide](./NAVIGATION_LOOP_PREVENTION.md)
- [Error Screen Implementation Guide](./ERROR_SCREEN_IMPLEMENTATION.md)
- [iOS Crash Diagnostic Guide](./IOS_CRASH_DIAGNOSTIC_GUIDE.md)
- [Cross-Platform Debugging Guide](./CROSS_PLATFORM_DEBUGGING_QUICK_REFERENCE.md)

## 📝 Notes importantes

1. **Toujours utiliser `router.replace()` pour les redirections d'authentification**
2. **Jamais de redirection automatique dans le rendu**
3. **Ajouter des flags de protection pour éviter les navigations multiples**
4. **Logger toutes les décisions de navigation en développement**
5. **Tester sur toutes les plateformes après chaque modification**

## ✅ Checklist finale

- [x] Tous les workflows auto-lancés désactivés
- [x] Toutes les redirections automatiques vérifiées
- [x] Écran d'erreur USS créé et intégré
- [x] ErrorBoundary fonctionnel sur toutes les plateformes
- [x] Logging centralisé et platform-agnostic
- [ ] Build de test publié et testé
- [ ] Toutes les actions réactivées et validées
- [ ] Documentation partagée avec l'équipe
