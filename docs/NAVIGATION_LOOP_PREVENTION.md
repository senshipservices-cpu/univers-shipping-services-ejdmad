
# Guide de Prévention des Boucles de Navigation

## 🚨 Problème: Stack Overflow Crash

### Symptômes
- L'app plante après 2-3 secondes sur iOS/Android
- Message d'erreur: "Maximum call stack size exceeded"
- L'app se ferme brutalement sans message

### Cause Principale
**Boucles de navigation automatique:**
```
Écran A → useEffect → Navigate to B
Écran B → useEffect → Navigate to A
Écran A → useEffect → Navigate to B
... → CRASH
```

## ✅ Solution: Règles de Navigation

### Règle #1: Pas de Navigation Automatique dans useEffect

❌ **MAUVAIS:**
```typescript
useEffect(() => {
  if (user) {
    router.push('/(tabs)/dashboard'); // AUTO-NAVIGATION = DANGER
  }
}, [user]);
```

✅ **BON:**
```typescript
// Navigation UNIQUEMENT sur action utilisateur
const handleLogin = async () => {
  const { error } = await signIn(email, password);
  if (!error) {
    router.push('/(tabs)/dashboard'); // OK: Action manuelle
  }
};
```

### Règle #2: Utiliser replace() au lieu de push() pour les Redirections

❌ **MAUVAIS:**
```typescript
router.push('/(tabs)/home'); // Ajoute à la pile de navigation
```

✅ **BON:**
```typescript
router.replace('/(tabs)/home'); // Remplace l'écran actuel
```

### Règle #3: Conditions de Navigation Claires

❌ **MAUVAIS:**
```typescript
useEffect(() => {
  if (user) router.push('/dashboard');
  if (!user) router.push('/login');
  // Peut créer une boucle si les conditions changent rapidement
}, [user]);
```

✅ **BON:**
```typescript
// Pas de navigation automatique
// L'utilisateur navigue manuellement via les boutons
```

## 🔍 Comment Identifier les Boucles

### 1. Chercher les useEffect avec Navigation
```bash
# Dans votre terminal
grep -r "useEffect" app/(tabs)/*.tsx | grep "router\."
```

### 2. Logs à Surveiller
```typescript
// Ajouter des logs pour tracer la navigation
useEffect(() => {
  console.log('[SCREEN_NAME] useEffect triggered');
  console.log('[SCREEN_NAME] User:', user);
  console.log('[SCREEN_NAME] Navigating to:', destination);
}, [user]);
```

### 3. Compteur de Renders
```typescript
const renderCount = useRef(0);

useEffect(() => {
  renderCount.current += 1;
  console.log('[SCREEN_NAME] Render count:', renderCount.current);
  
  if (renderCount.current > 5) {
    console.error('⚠️ POSSIBLE LOOP DETECTED');
  }
}, []);
```

## 📋 Checklist par Écran

### Écrans à Vérifier en Priorité

#### 1. Login (app/(tabs)/login.tsx)
- [x] ✅ Auto-navigation désactivée
- [x] ✅ Navigation uniquement après clic bouton
- [x] ✅ Utilise router.replace()

#### 2. Home (app/(tabs)/(home)/index.tsx)
- [ ] Vérifier les useEffect
- [ ] Vérifier les redirections conditionnelles
- [ ] Vérifier les appels API avec navigation

#### 3. Pricing (app/(tabs)/pricing.tsx)
- [ ] Vérifier les useEffect
- [ ] Vérifier les redirections après paiement
- [ ] Vérifier les conditions d'accès

#### 4. Client Dashboard (app/(tabs)/client-dashboard.tsx)
- [ ] Vérifier les useEffect
- [ ] Vérifier les redirections si non authentifié
- [ ] Vérifier les conditions d'abonnement

#### 5. Become Agent (app/(tabs)/become-agent.tsx)
- [ ] Vérifier les useEffect
- [ ] Vérifier les redirections après soumission
- [ ] Vérifier les conditions d'accès

## 🛠️ Outils de Debugging

### 1. Navigation Logger
```typescript
// utils/navigationLogger.ts
export const logNavigation = (from: string, to: string, reason: string) => {
  console.log(`[NAV] ${from} → ${to} (${reason})`);
};

// Utilisation
logNavigation('login', 'dashboard', 'successful login');
router.replace('/(tabs)/dashboard');
```

### 2. Navigation Guard
```typescript
// Empêcher les navigations trop rapides
let lastNavigation = 0;
const NAVIGATION_COOLDOWN = 1000; // 1 seconde

const safeNavigate = (destination: string) => {
  const now = Date.now();
  if (now - lastNavigation < NAVIGATION_COOLDOWN) {
    console.warn('⚠️ Navigation too fast, ignoring');
    return;
  }
  lastNavigation = now;
  router.replace(destination);
};
```

## 🎯 Pattern Recommandé

### Structure d'Écran Sans Boucle
```typescript
export default function MyScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  // ✅ Pas de navigation automatique
  // useEffect(() => {
  //   if (!user) router.push('/login'); // ❌ NE PAS FAIRE
  // }, [user]);
  
  // ✅ Navigation sur action utilisateur
  const handleAction = async () => {
    const result = await doSomething();
    if (result.success) {
      router.replace('/success'); // ✅ OK
    }
  };
  
  // ✅ Afficher un message si conditions non remplies
  if (!user) {
    return (
      <View>
        <Text>Vous devez être connecté</Text>
        <Button onPress={() => router.push('/login')}>
          Se connecter
        </Button>
      </View>
    );
  }
  
  return (
    <View>
      {/* Contenu normal */}
    </View>
  );
}
```

## 🚀 Tests

### Test Manuel
1. Ouvrir l'app
2. Naviguer vers chaque écran
3. Observer les logs console
4. Vérifier qu'aucun écran ne redirige automatiquement

### Test Automatisé
```typescript
// __tests__/navigation.test.ts
describe('Navigation', () => {
  it('should not auto-navigate on mount', () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.navigate).not.toHaveBeenCalled();
  });
});
```

## 📞 En Cas de Problème

Si vous détectez une boucle:

1. **Identifier l'écran**
   - Noter le nom de l'écran
   - Noter les conditions de navigation

2. **Désactiver temporairement**
   ```typescript
   // Commenter la navigation problématique
   // if (condition) {
   //   router.push('/destination');
   // }
   ```

3. **Rebuild et tester**
   ```bash
   expo start --clear
   ```

4. **Implémenter la solution**
   - Remplacer par navigation manuelle
   - Ajouter des guards
   - Utiliser replace() au lieu de push()

---

**Important:** Toute navigation automatique doit être justifiée et documentée.
