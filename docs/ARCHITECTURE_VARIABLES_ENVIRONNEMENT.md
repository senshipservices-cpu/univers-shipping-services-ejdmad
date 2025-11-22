
# 🏗️ Architecture des Variables d'Environnement

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                        3S GLOBAL - ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          UTILISATEUR                                 │
│                              👤                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION REACT NATIVE                          │
│                         (Client-Side)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Variables d'Environnement depuis:                                  │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ 📱 Natively Settings                                    │        │
│  │ • EXPO_PUBLIC_SUPABASE_URL                             │        │
│  │ • EXPO_PUBLIC_SUPABASE_ANON_KEY                        │        │
│  │ • EXPO_PUBLIC_PAYPAL_CLIENT_ID                         │        │
│  │ • PAYMENT_PROVIDER                                      │        │
│  │ • PAYPAL_ENV                                            │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  Accès via:                                                         │
│  • process.env.EXPO_PUBLIC_SUPABASE_URL                            │
│  • Constants.expoConfig.extra.supabaseUrl                          │
│                                                                      │
│  Fichiers:                                                          │
│  • config/appConfig.ts                                              │
│  • app/integrations/supabase/client.ts                             │
│                                                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ API Calls
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                     │
│                      (Backend Services)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │   Database (Postgres) │         │   Edge Functions     │        │
│  │                       │         │   (Server-Side)      │        │
│  │ • Tables              │         │                      │        │
│  │ • RLS Policies        │         │ Variables depuis:    │        │
│  │ • Migrations          │         │ ┌──────────────────┐ │        │
│  │                       │         │ │ 🔐 Supabase Vault│ │        │
│  └──────────────────────┘         │ │                  │ │        │
│                                    │ │ Secrets:         │ │        │
│  ┌──────────────────────┐         │ │ • SERVICE_KEY    │ │        │
│  │   Authentication      │         │ │ • PAYPAL_SECRET  │ │        │
│  │                       │         │ │ • SMTP_PASSWORD  │ │        │
│  │ • Email/Password      │         │ │ • WEBHOOK_IDS    │ │        │
│  │ • OAuth (Google)      │         │ └──────────────────┘ │        │
│  │ • Magic Links         │         │                      │        │
│  └──────────────────────┘         │ Accès via:           │        │
│                                    │ Deno.env.get()       │        │
│  ┌──────────────────────┐         │                      │        │
│  │   Storage             │         │ Fichiers:            │        │
│  │                       │         │ • functions/*/index  │        │
│  │ • Files               │         └──────────────────────┘        │
│  │ • Images              │                                          │
│  └──────────────────────┘                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données

### 1. Authentification

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Client  │────▶│  Supabase    │────▶│ Database │
│  (App)   │     │  Auth        │     │          │
└──────────┘     └──────────────┘     └──────────┘
     │                  │
     │                  │
     ▼                  ▼
Variables:         Variables:
• SUPABASE_URL     • SERVICE_KEY
• ANON_KEY         • (Vault)
```

### 2. Paiement PayPal

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Client  │────▶│  Edge        │────▶│  PayPal  │
│  (App)   │     │  Function    │     │  API     │
└──────────┘     └──────────────┘     └──────────┘
     │                  │
     │                  │
     ▼                  ▼
Variables:         Variables:
• PAYPAL_CLIENT_ID • PAYPAL_SECRET
• PAYPAL_ENV       • WEBHOOK_ID
                   • (Vault)
```

### 3. Emails Automatiques

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Database │────▶│  Edge        │────▶│  SMTP    │
│ Trigger  │     │  Function    │     │  Server  │
└──────────┘     └──────────────┘     └──────────┘
                        │
                        │
                        ▼
                   Variables:
                   • SMTP_HOST
                   • SMTP_PASSWORD
                   • (Vault)
```

---

## 🔐 Sécurité des Variables

### Variables Publiques (Client-Side)

✅ **Peuvent être exposées** dans le code client

```typescript
// Ces variables sont PUBLIQUES
EXPO_PUBLIC_SUPABASE_URL          // URL publique
EXPO_PUBLIC_SUPABASE_ANON_KEY     // Clé publique (protégée par RLS)
EXPO_PUBLIC_PAYPAL_CLIENT_ID      // Client ID public
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY   // Clé API publique
```

**Pourquoi c'est sécurisé ?**
- L'URL Supabase est publique par design
- L'Anon Key est protégée par Row Level Security (RLS)
- Le Client ID PayPal est public (pas de secret)
- Les clés API sont restreintes par domaine/bundle ID

### Variables Secrètes (Server-Side)

❌ **NE DOIVENT JAMAIS** être exposées dans le code client

```typescript
// Ces variables sont SECRÈTES
SUPABASE_SERVICE_KEY              // Accès complet à la DB
PAYPAL_CLIENT_SECRET              // Secret PayPal
PAYPAL_WEBHOOK_ID                 // ID webhook
STRIPE_SECRET_KEY                 // Clé secrète Stripe
SMTP_PASSWORD                     // Mot de passe email
```

**Pourquoi c'est dangereux ?**
- Accès complet aux données
- Possibilité de contourner RLS
- Fraude financière possible
- Accès aux comptes email

---

## 📍 Où Stocker Quoi ?

### Natively Settings (React Native App)

```bash
# Configuration Client
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_PAYPAL_CLIENT_ID=AYourPayPalClientID...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# Configuration App
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=sandbox
APP_ENV=dev
```

### Supabase Vault (Edge Functions)

```bash
# Secrets Serveur
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PAYPAL_CLIENT_SECRET=EYourPayPalClientSecret...
PAYPAL_WEBHOOK_ID=WH-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Admin
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

---

## 🔧 Configuration par Environnement

### Développement (Dev)

```bash
# Natively
APP_ENV=dev
PAYPAL_ENV=sandbox
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_PAYPAL_CLIENT_ID=sandbox-client-id

# Supabase Vault
PAYPAL_CLIENT_SECRET=sandbox-secret
```

### Production

```bash
# Natively
APP_ENV=production
PAYPAL_ENV=live
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_PAYPAL_CLIENT_ID=live-client-id

# Supabase Vault
PAYPAL_CLIENT_SECRET=live-secret
```

---

## 📂 Structure des Fichiers

```
3s-global/
├── config/
│   └── appConfig.ts                    # Configuration centralisée
│       ├── getEnvVar()                 # Récupère les variables
│       ├── env {}                      # Toutes les variables
│       ├── payment {}                  # Config paiement
│       └── validateConfig()            # Validation
│
├── app/
│   └── integrations/
│       └── supabase/
│           ├── client.ts               # Client Supabase
│           │   ├── Utilise appConfig
│           │   ├── Crée le client
│           │   └── Exporte isConfigured
│           └── types.ts                # Types TypeScript
│
├── components/
│   ├── SupabaseConfigCheck.tsx        # Vérifie la config
│   ├── ConfigStatus.tsx               # Bannière de statut
│   └── EnvironmentSetupGuide.tsx      # Guide de setup
│
├── supabase/
│   └── functions/
│       ├── create-paypal-order/
│       │   └── index.ts               # Utilise Deno.env.get()
│       └── paypal-webhook/
│           └── index.ts               # Utilise Deno.env.get()
│
└── docs/
    ├── CONFIGURATION_SUMMARY_FR.md
    ├── SUPABASE_VAULT_VS_ENV_VARS.md
    └── QUICK_FIX_ENVIRONMENT_VARIABLES.md
```

---

## 🎯 Flux de Configuration

### 1. Démarrage de l'App

```typescript
// app/_layout.tsx
import SupabaseConfigCheck from '@/components/SupabaseConfigCheck';

export default function RootLayout() {
  return (
    <SupabaseConfigCheck>
      {/* App content */}
    </SupabaseConfigCheck>
  );
}
```

### 2. Vérification de la Configuration

```typescript
// config/appConfig.ts
const getEnvVar = (key: string): string | undefined => {
  // 1. Essaie Constants.expoConfig.extra (Natively)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key];
  }
  
  // 2. Essaie process.env (Web/Dev)
  if (process.env[key]) {
    return process.env[key];
  }
  
  // 3. Retourne undefined
  return undefined;
};
```

### 3. Initialisation Supabase

```typescript
// app/integrations/supabase/client.ts
import appConfig from '@/config/appConfig';

const validation = appConfig.validateConfig();

if (validation.valid) {
  supabase = createClient(
    appConfig.env.SUPABASE_URL,
    appConfig.env.SUPABASE_ANON_KEY
  );
} else {
  // Affiche le guide de configuration
  console.error('Configuration invalide');
}
```

### 4. Affichage Conditionnel

```typescript
// components/SupabaseConfigCheck.tsx
export default function SupabaseConfigCheck({ children }) {
  if (isSupabaseConfigured) {
    return <>{children}</>;  // App normale
  }
  
  return <EnvironmentSetupGuide />;  // Guide de setup
}
```

---

## 🔍 Débogage

### Vérifier les Variables Chargées

```typescript
// Dans config/appConfig.ts
console.log('=== Configuration Status ===');
console.log('SUPABASE_URL:', env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
console.log('===========================');
```

### Logs Attendus (Succès)

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

### Logs Attendus (Erreur)

```
===========================================
🔧 Supabase Configuration Check
===========================================
Supabase URL: (not set)
Supabase Anon Key: (not set)
Validation: ✗ Invalid

❌ Configuration Errors:
   1. SUPABASE_URL is not set
   2. SUPABASE_ANON_KEY is not set
===========================================
✗ Supabase client not initialized
```

---

## 📚 Ressources

- **Documentation Supabase :** https://supabase.com/docs
- **Documentation Expo :** https://docs.expo.dev/guides/environment-variables/
- **Documentation PayPal :** https://developer.paypal.com/docs/

---

## ✅ Checklist Finale

- [ ] Variables ajoutées dans Natively Settings
- [ ] Variables ajoutées dans Supabase Vault
- [ ] App redémarrée
- [ ] Logs vérifiés
- [ ] Configuration validée
- [ ] App fonctionne normalement

---

**Note :** Cette architecture garantit la sécurité en séparant clairement les variables publiques (client) des variables secrètes (serveur).
