
# 🔧 Dépannage - Configuration des Variables d'Environnement

## 🚨 Problèmes Courants et Solutions

### 1. "SUPABASE_URL is not set"

#### Symptômes
```
❌ Configuration Errors:
   1. SUPABASE_URL is not set
```

#### Causes Possibles
- ❌ Variables ajoutées uniquement dans Supabase Vault
- ❌ Variables non ajoutées dans Natively Settings
- ❌ Orthographe incorrecte du nom de variable
- ❌ App non redémarrée après ajout

#### Solutions

**Solution 1 : Ajouter dans Natively**
```
1. Ouvrir Natively
2. ⚙️ Settings → Environment Variables
3. Add New Variable
4. Nom: EXPO_PUBLIC_SUPABASE_URL
5. Valeur: https://lnfsjpuffrcyenuuoxxk.supabase.co
6. Save
7. Redémarrer l'app (Stop → Start)
```

**Solution 2 : Vérifier l'orthographe**
```
✅ Correct: EXPO_PUBLIC_SUPABASE_URL
❌ Incorrect: EXPO_PUBLIC_SUPABASE-URL
❌ Incorrect: EXPO_PUBLIC_SUPABASEURL
❌ Incorrect: SUPABASE_URL (manque EXPO_PUBLIC_)
```

**Solution 3 : Vérifier la valeur**
```
✅ Correct: https://lnfsjpuffrcyenuuoxxk.supabase.co
❌ Incorrect: ${EXPO_PUBLIC_SUPABASE_URL}
❌ Incorrect: lnfsjpuffrcyenuuoxxk.supabase.co (manque https://)
❌ Incorrect: https://lnfsjpuffrcyenuuoxxk (incomplet)
```

---

### 2. "Invalid Supabase URL"

#### Symptômes
```
❌ Configuration Errors:
   1. SUPABASE_URL must be a valid HTTP or HTTPS URL
```

#### Causes Possibles
- ❌ Placeholder `${}` au lieu de la vraie valeur
- ❌ URL incomplète
- ❌ Protocole manquant (http:// ou https://)

#### Solutions

**Vérifier le format**
```
Format attendu:
https://[project-id].supabase.co

Votre projet:
https://lnfsjpuffrcyenuuoxxk.supabase.co
```

**Copier depuis Supabase**
```
1. Aller sur https://supabase.com/dashboard
2. Sélectionner "UNIVERS SHIPPING SERVICES"
3. Settings → API
4. Copier "Project URL" (pas "Project ID"!)
5. Coller dans Natively
```

---

### 3. "SUPABASE_ANON_KEY is not set"

#### Symptômes
```
❌ Configuration Errors:
   1. SUPABASE_ANON_KEY is not set
```

#### Causes Possibles
- ❌ Clé non ajoutée dans Natively
- ❌ Clé incomplète (trop courte)
- ❌ Mauvaise clé copiée (service key au lieu d'anon key)

#### Solutions

**Trouver la bonne clé**
```
Supabase Dashboard → Settings → API

✅ Copier: "anon" / "public" key
   (Commence par: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
   (Très longue: ~200+ caractères)

❌ Ne PAS copier: "service_role" key
   (C'est pour Supabase Vault uniquement!)
```

**Ajouter dans Natively**
```
1. Natively → ⚙️ Settings → Environment Variables
2. Add New Variable
3. Nom: EXPO_PUBLIC_SUPABASE_ANON_KEY
4. Valeur: [coller la clé complète]
5. Save
6. Redémarrer l'app
```

---

### 4. Variables Ajoutées Mais Toujours Pas Détectées

#### Symptômes
- Variables ajoutées dans Natively
- App redémarrée
- Mais toujours "not set" dans les logs

#### Causes Possibles
- ❌ Redémarrage incomplet (refresh au lieu de stop/start)
- ❌ Mauvais projet Natively
- ❌ Cache non vidé

#### Solutions

**Redémarrage complet**
```
1. Stop l'application complètement
2. Attendre 5 secondes
3. Start l'application
4. Attendre le chargement complet
5. Vérifier les logs
```

**Vider le cache**
```
1. Dans Natively, aller dans Settings
2. Clear Cache / Reset
3. Redémarrer l'app
```

**Vérifier le projet**
```
1. Vérifier que vous êtes dans le bon projet Natively
2. Vérifier le nom du projet: "3S Global"
3. Vérifier l'organisation
```

---

### 5. Edge Functions Ne Trouvent Pas les Variables

#### Symptômes
```
Error in Edge Function:
PAYPAL_CLIENT_SECRET is undefined
```

#### Causes Possibles
- ❌ Variables ajoutées dans Natively au lieu de Supabase Vault
- ❌ Edge Function non redéployée
- ❌ Nom de variable incorrect

#### Solutions

**Ajouter dans Supabase Vault**
```
1. Supabase Dashboard → Integrations → Vault
2. Add new secret
3. Nom: PAYPAL_CLIENT_SECRET (sans EXPO_PUBLIC_)
4. Valeur: [votre secret PayPal]
5. Save
```

**Redéployer l'Edge Function**
```
Après avoir ajouté des secrets dans Vault,
redéployez l'Edge Function pour qu'elle les détecte.
```

**Vérifier l'accès dans le code**
```typescript
// ✅ Correct
const secret = Deno.env.get('PAYPAL_CLIENT_SECRET');

// ❌ Incorrect
const secret = process.env.PAYPAL_CLIENT_SECRET;
```

---

### 6. "You are offline" / Problèmes de Connexion

#### Symptômes
- Message "You are offline"
- Impossible de se connecter à Supabase
- Timeouts

#### Causes Possibles
- ❌ Pas de connexion Internet
- ❌ Firewall bloque Supabase
- ❌ URL Supabase incorrecte

#### Solutions

**Vérifier la connexion**
```
1. Vérifier que vous avez Internet
2. Tester dans un navigateur: https://lnfsjpuffrcyenuuoxxk.supabase.co
3. Vérifier que le projet Supabase est actif
```

**Vérifier le firewall**
```
1. Désactiver temporairement le firewall
2. Tester l'app
3. Si ça marche, ajouter une exception pour Supabase
```

---

### 7. Logs Montrent des Placeholders

#### Symptômes
```
Supabase URL: ${EXPO_PUBLIC_SUPABASE_URL}
```

#### Causes Possibles
- ❌ Valeur placeholder non remplacée
- ❌ Variables non définies dans Natively

#### Solutions

**Remplacer les placeholders**
```
❌ Ne PAS mettre: ${EXPO_PUBLIC_SUPABASE_URL}
✅ Mettre: https://lnfsjpuffrcyenuuoxxk.supabase.co

Les placeholders ${} sont pour les templates,
pas pour les valeurs réelles!
```

---

### 8. App Fonctionne en Dev Mais Pas en Production

#### Symptômes
- Fonctionne en développement local
- Erreurs en production / build

#### Causes Possibles
- ❌ Variables dans .env local mais pas dans Natively
- ❌ Variables de dev au lieu de prod
- ❌ Build cache

#### Solutions

**Vérifier les variables de production**
```
1. Vérifier que les variables sont dans Natively (pas juste .env)
2. Vérifier que vous utilisez les bonnes clés (prod vs dev)
3. Rebuild l'app complètement
```

**Variables par environnement**
```
Dev:
- PAYPAL_ENV=sandbox
- Clés de test

Production:
- PAYPAL_ENV=live
- Clés de production
```

---

## 🔍 Outils de Débogage

### Vérifier les Variables Chargées

Ajoutez temporairement dans `config/appConfig.ts` :

```typescript
console.log('=== DEBUG: Environment Variables ===');
console.log('SUPABASE_URL:', env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? 'Set (length: ' + env.SUPABASE_ANON_KEY.length + ')' : 'Not set');
console.log('PAYPAL_CLIENT_ID:', env.PAYPAL_CLIENT_ID);
console.log('PAYMENT_PROVIDER:', env.PAYMENT_PROVIDER);
console.log('===================================');
```

### Vérifier Constants.expoConfig

```typescript
import Constants from 'expo-constants';

console.log('=== DEBUG: Expo Config ===');
console.log('Extra:', Constants.expoConfig?.extra);
console.log('=========================');
```

### Tester la Connexion Supabase

```typescript
// Test simple
const { data, error } = await supabase.from('profiles').select('count');
console.log('Supabase test:', error ? 'Failed' : 'Success');
```

---

## 📋 Checklist de Dépannage

Quand quelque chose ne marche pas, suivez cette checklist :

- [ ] **Vérifier l'orthographe**
  - Nom exact : `EXPO_PUBLIC_SUPABASE_URL`
  - Pas d'espaces, pas de tirets

- [ ] **Vérifier la valeur**
  - Pas de `${}`
  - URL complète avec `https://`
  - Clé complète (très longue)

- [ ] **Vérifier l'emplacement**
  - Variables publiques → Natively Settings
  - Variables secrètes → Supabase Vault

- [ ] **Redémarrer complètement**
  - Stop → Start (pas juste refresh)
  - Attendre le chargement complet

- [ ] **Vérifier les logs**
  - Chercher "Configuration Check"
  - Vérifier "Valid" ou "Invalid"

- [ ] **Tester la connexion**
  - Vérifier Internet
  - Tester l'URL dans un navigateur

- [ ] **Vider le cache**
  - Clear cache dans Natively
  - Redémarrer

- [ ] **Vérifier le projet**
  - Bon projet Natively
  - Bon projet Supabase

---

## 🆘 Besoin d'Aide Supplémentaire ?

### Documentation

- `docs/CONFIGURATION_SUMMARY_FR.md` - Guide complet
- `docs/SUPABASE_VAULT_VS_ENV_VARS.md` - Différence Vault vs Env
- `docs/QUICK_FIX_ENVIRONMENT_VARIABLES.md` - Solution rapide

### Logs à Fournir

Si vous demandez de l'aide, fournissez :

```
1. Logs de démarrage (Configuration Check)
2. Capture d'écran de Natively Settings
3. Capture d'écran de Supabase Vault
4. Version de l'app
5. Plateforme (iOS/Android/Web)
```

### Contacts

- Support Natively
- Documentation Supabase
- GitHub Issues (si applicable)

---

## ✅ Vérification Finale

Quand tout fonctionne, vous devriez voir :

```
===========================================
🔧 Supabase Configuration Check
===========================================
Supabase URL: https://lnfsjpuffrcyenuuoxxk.supabase.co
Supabase Anon Key: (set)
Validation: ✓ Valid
===========================================
✓ Initializing Supabase client...
✓ Supabase client initialized successfully
```

Et l'application devrait :
- ✅ Démarrer sans erreur
- ✅ Ne pas afficher l'écran de configuration
- ✅ Permettre la connexion/inscription
- ✅ Fonctionner normalement

---

**Dernière mise à jour :** Après ajout des variables dans Supabase Vault  
**Prochaine action :** Ajouter les variables dans Natively Settings et redémarrer
