
# Supabase Vault vs Environment Variables

## 🎯 Résumé Rapide

**Vous avez ajouté les variables dans Supabase Vault** ✅ - C'est correct pour les Edge Functions!

**Mais votre app React Native a besoin des variables dans Natively** ⚠️ - Il faut les ajouter aussi là!

---

## 📚 Comprendre la Différence

### Supabase Vault (Ce que vous avez fait)
- **Pour :** Edge Functions (code serveur)
- **Accessible depuis :** `Deno.env.get('VARIABLE_NAME')` dans les Edge Functions
- **Utilisation :** Secrets côté serveur (API keys, webhooks, etc.)
- **Exemple :** PayPal Client Secret, Stripe Secret Key, SMTP Password

### Environment Variables dans Natively (Ce qu'il faut faire)
- **Pour :** Application React Native (code client)
- **Accessible depuis :** `process.env.VARIABLE_NAME` ou `Constants.expoConfig.extra`
- **Utilisation :** Configuration client (URLs publiques, clés publiques)
- **Exemple :** Supabase URL, Supabase Anon Key, PayPal Client ID

---

## 🔐 Quelle Variable Va Où ?

### ✅ Dans Supabase Vault (Edge Functions)
```
SUPABASE_SERVICE_KEY          ← Clé secrète (jamais dans le client!)
PAYPAL_CLIENT_SECRET          ← Secret PayPal
PAYPAL_WEBHOOK_ID             ← ID webhook PayPal
STRIPE_SECRET_KEY             ← Clé secrète Stripe
STRIPE_WEBHOOK_SECRET         ← Secret webhook Stripe
SMTP_PASSWORD                 ← Mot de passe email
ADMIN_EMAILS                  ← Liste des admins
```

### ✅ Dans Natively (React Native App)
```
EXPO_PUBLIC_SUPABASE_URL      ← URL publique Supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY ← Clé anonyme Supabase (publique)
EXPO_PUBLIC_PAYPAL_CLIENT_ID  ← Client ID PayPal (public)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ← Clé publique Stripe
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY    ← Clé Google Maps
PAYMENT_PROVIDER              ← Provider de paiement (stripe/paypal)
PAYPAL_ENV                    ← Environnement PayPal (sandbox/live)
APP_ENV                       ← Environnement app (dev/production)
```

---

## 🚀 Comment Ajouter les Variables dans Natively

### Méthode 1 : Via l'Interface Natively (Recommandé)

1. **Ouvrez votre projet dans Natively**

2. **Cliquez sur l'icône ⚙️ (Settings)** en haut à droite

3. **Allez dans "Environment Variables"**

4. **Ajoutez chaque variable :**
   ```
   Nom: EXPO_PUBLIC_SUPABASE_URL
   Valeur: https://lnfsjpuffrcyenuuoxxk.supabase.co
   
   Nom: EXPO_PUBLIC_SUPABASE_ANON_KEY
   Valeur: [votre clé anon depuis Supabase Dashboard]
   ```

5. **Sauvegardez et redémarrez l'app**

### Méthode 2 : Via Fichier .env (Développement Local)

Si vous développez localement, créez un fichier `.env` :

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
EXPO_PUBLIC_PAYPAL_CLIENT_ID=votre-paypal-client-id
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=sandbox
APP_ENV=dev
```

⚠️ **Important :** Ne commitez JAMAIS le fichier `.env` dans Git!

---

## 🔍 Où Trouver les Valeurs Supabase

### Dans Supabase Dashboard :

1. **Allez sur** https://supabase.com/dashboard
2. **Sélectionnez votre projet** "UNIVERS SHIPPING SERVICES"
3. **Cliquez sur Settings (⚙️)** dans la barre latérale
4. **Allez dans "API"**
5. **Copiez les valeurs :**

```
Project URL (EXPO_PUBLIC_SUPABASE_URL):
https://lnfsjpuffrcyenuuoxxk.supabase.co

anon/public key (EXPO_PUBLIC_SUPABASE_ANON_KEY):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎨 Architecture Complète

```
┌─────────────────────────────────────────────────────────────┐
│                    VOTRE APPLICATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │   React Native App   │      │   Edge Functions     │   │
│  │   (Client-Side)      │      │   (Server-Side)      │   │
│  ├──────────────────────┤      ├──────────────────────┤   │
│  │                      │      │                      │   │
│  │ Variables depuis:    │      │ Variables depuis:    │   │
│  │ • Natively Settings  │      │ • Supabase Vault     │   │
│  │ • .env (local)       │      │                      │   │
│  │ • app.json extra     │      │ Deno.env.get()       │   │
│  │                      │      │                      │   │
│  │ process.env.X        │      │ Secrets sécurisés    │   │
│  │ Constants.extra.X    │      │ Jamais exposés       │   │
│  │                      │      │                      │   │
│  └──────────────────────┘      └──────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Configuration

### Pour React Native App (Natively)
- [ ] EXPO_PUBLIC_SUPABASE_URL ajouté dans Natively
- [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY ajouté dans Natively
- [ ] EXPO_PUBLIC_PAYPAL_CLIENT_ID ajouté (si PayPal)
- [ ] PAYMENT_PROVIDER défini (stripe ou paypal)
- [ ] PAYPAL_ENV défini (sandbox ou live)
- [ ] App redémarrée après ajout des variables

### Pour Edge Functions (Supabase Vault)
- [x] SUPABASE_SERVICE_KEY ajouté ✅ (vous l'avez fait!)
- [x] EXPO_PUBLIC_SUPABASE_ANON_KEY ajouté ✅
- [x] EXPO_PUBLIC_SUPABASE_URL ajouté ✅
- [ ] PAYPAL_CLIENT_SECRET ajouté (si PayPal)
- [ ] PAYPAL_WEBHOOK_ID ajouté (si PayPal)
- [ ] SMTP_PASSWORD ajouté (si emails)

---

## 🐛 Dépannage

### Problème : "SUPABASE_URL is not set"

**Cause :** Les variables ne sont pas dans Natively, seulement dans Supabase Vault

**Solution :**
1. Ajoutez les variables dans Natively Settings
2. Redémarrez l'application
3. Vérifiez que les variables apparaissent dans les logs

### Problème : "Invalid Supabase URL"

**Cause :** La variable contient `${EXPO_PUBLIC_SUPABASE_URL}` au lieu de la vraie valeur

**Solution :**
1. Vérifiez que vous avez mis la VRAIE valeur, pas le placeholder
2. Format correct : `https://lnfsjpuffrcyenuuoxxk.supabase.co`
3. Pas de `${}` dans la valeur!

### Problème : Edge Function ne trouve pas les variables

**Cause :** Variables pas dans Supabase Vault

**Solution :**
1. Allez dans Supabase Dashboard → Integrations → Vault
2. Ajoutez les secrets nécessaires
3. Redéployez l'Edge Function

---

## 📖 Exemples de Code

### Accéder aux Variables dans React Native

```typescript
// config/appConfig.ts
import Constants from 'expo-constants';

const SUPABASE_URL = 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  Constants.expoConfig?.extra?.supabaseUrl;

const SUPABASE_ANON_KEY = 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  Constants.expoConfig?.extra?.supabaseAnonKey;

console.log('Supabase URL:', SUPABASE_URL);
```

### Accéder aux Variables dans Edge Function

```typescript
// supabase/functions/my-function/index.ts
Deno.serve(async (req) => {
  // Variables depuis Supabase Vault
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
  const paypalSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  console.log('Service Key:', serviceKey ? 'Set' : 'Missing');
  
  // ... votre code
});
```

---

## 🎯 Prochaines Étapes

1. **Ajoutez les variables dans Natively** (voir section "Comment Ajouter")
2. **Redémarrez l'application**
3. **Vérifiez les logs** - vous devriez voir "✓ Supabase client initialized successfully"
4. **Testez la connexion** - l'app devrait maintenant fonctionner!

---

## 💡 Besoin d'Aide ?

Si vous avez encore des problèmes :

1. **Vérifiez les logs** dans la console Natively
2. **Consultez** `docs/ENVIRONMENT_SETUP_GUIDE.md`
3. **Regardez** `components/SupabaseConfigCheck.tsx` pour le guide visuel
4. **Contactez** le support Natively si nécessaire

---

## 📚 Documentation Supplémentaire

- [Supabase Environment Variables](https://supabase.com/docs/guides/functions/secrets)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Natively Documentation](https://natively.dev/docs)
