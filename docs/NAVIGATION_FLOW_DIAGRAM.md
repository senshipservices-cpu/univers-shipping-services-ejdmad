
# Diagramme de Navigation - Universal Shipping Services

## 🎯 Vue d'ensemble

Ce document présente le flux de navigation complet de l'application, avec identification des points critiques où des boucles peuvent se produire.

## 📊 Flux de Navigation Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP START                                 │
│                     (app/_layout.tsx)                            │
│                                                                   │
│  ✅ Pas de redirection automatique                               │
│  ✅ Validation de configuration                                  │
│  ✅ Setup error logging                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HOME SCREEN                                   │
│              (app/(tabs)/(home)/index.tsx)                       │
│                                                                   │
│  ✅ Pas de redirection automatique                               │
│  ✅ Affiche contenu public                                       │
│  ✅ Boutons pour navigation manuelle                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   SERVICES   │  │    PORTS     │  │   PRICING    │
    │              │  │              │  │              │
    │ ✅ Pas de    │  │ ✅ Pas de    │  │ ✅ Pas de    │
    │ redirection  │  │ redirection  │  │ redirection  │
    │ auto         │  │ auto         │  │ auto         │
    └──────────────┘  └──────────────┘  └──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  USER CLICKS     │
                    │  "Se connecter"  │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN SCREEN                                  │
│                (app/(tabs)/login.tsx)                            │
│                                                                   │
│  ✅ Redirection UNIQUEMENT après connexion réussie               │
│  ✅ Utilise router.replace() au lieu de router.push()            │
│  ✅ Vérifie email avant redirection                              │
│  ✅ Gère returnTo pour éviter les boucles                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  LOGIN SUCCESS   │
                    └──────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   VERIFY     │  │   CLIENT     │  │ SUBSCRIPTION │
    │   EMAIL      │  │  DASHBOARD   │  │   CONFIRM    │
    │              │  │              │  │              │
    │ ✅ Redir.    │  │ ✅ Redir.    │  │ ✅ Pas de    │
    │ vers login   │  │ vers profile │  │ boucle       │
    │ après verif  │  │ si incomplet │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
```

## 🔴 Points Critiques (Risque de Boucle)

### 1. Home ↔ Login

**❌ SCÉNARIO PROBLÉMATIQUE:**
```
Home (pas connecté) → Auto-redirect vers Login
Login (connecté) → Auto-redirect vers Home
Home (pas connecté) → Auto-redirect vers Login
... BOUCLE INFINIE
```

**✅ SOLUTION APPLIQUÉE:**
```
Home → Affiche contenu public + bouton "Se connecter"
User clicks "Se connecter" → Login
Login (après connexion) → Dashboard
```

### 2. Pricing ↔ Login

**❌ SCÉNARIO PROBLÉMATIQUE:**
```
Pricing → User clicks plan → Auto-redirect vers Login (pas connecté)
Login (connecté) → Auto-redirect vers Pricing
Pricing → User clicks plan → Auto-redirect vers Login
... BOUCLE INFINIE
```

**✅ SOLUTION APPLIQUÉE:**
```
Pricing → User clicks plan → Check auth
Si pas connecté → Alert + bouton Login avec returnTo
Login (connecté) → Redirect vers returnTo (subscription-confirm)
Subscription Confirm → Pas de redirection auto
```

### 3. Services ↔ Digital Portal ↔ Pricing

**❌ SCÉNARIO PROBLÉMATIQUE:**
```
Services → User clicks Digital Portal → Check access
Pas d'accès → Auto-redirect vers Pricing
Pricing → Auto-redirect vers Services
Services → User clicks Digital Portal → Check access
... BOUCLE INFINIE
```

**✅ SOLUTION APPLIQUÉE:**
```
Services → User clicks Digital Portal → Check access
Pas d'accès → Redirect vers Pricing avec highlight=digital_portal
Pricing → Affiche plans avec highlight
User choisit plan → Subscription flow
Pas de redirection automatique
```

## ✅ Navigation Sécurisée

### Règles Appliquées

1. **Pas de redirection automatique dans le rendu**
   ```typescript
   // ❌ MAUVAIS
   if (condition) {
     router.push('/screen');
   }
   
   // ✅ BON
   useEffect(() => {
     if (condition && !hasRedirected) {
       setHasRedirected(true);
       router.replace('/screen');
     }
   }, [condition, hasRedirected]);
   ```

2. **Utiliser router.replace() pour les redirections d'authentification**
   ```typescript
   // ❌ MAUVAIS
   router.push('/(tabs)/client-dashboard');
   
   // ✅ BON
   router.replace('/(tabs)/client-dashboard');
   ```

3. **Ajouter des flags de protection**
   ```typescript
   const [hasRedirected, setHasRedirected] = useState(false);
   
   useEffect(() => {
     if (shouldRedirect && !hasRedirected) {
       setHasRedirected(true);
       router.replace('/destination');
     }
   }, [shouldRedirect, hasRedirected]);
   ```

4. **Conditions strictes dans useEffect**
   ```typescript
   // ❌ MAUVAIS
   useEffect(() => {
     if (user) {
       router.push('/dashboard');
     }
   }, [user]);
   
   // ✅ BON
   useEffect(() => {
     if (user && !client && !loading && !hasRedirected) {
       setHasRedirected(true);
       router.replace('/client-profile');
     }
   }, [user, client, loading, hasRedirected]);
   ```

## 🎯 Flux d'Authentification

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

User not authenticated
        │
        ▼
┌──────────────────┐
│  Public Screens  │
│  - Home          │
│  - Services      │
│  - Ports         │
│  - Pricing       │
│  - Become Agent  │
└──────────────────┘
        │
        ▼ User clicks "Se connecter"
┌──────────────────┐
│  Login Screen    │
│                  │
│  ✅ Email/Pass   │
│  ✅ Google Auth  │
└──────────────────┘
        │
        ▼ Login success
┌──────────────────┐
│  Check Email     │
│  Verified?       │
└──────────────────┘
        │
    ┌───┴───┐
    │       │
    ▼       ▼
  NO       YES
    │       │
    ▼       ▼
┌────────┐ ┌──────────────────┐
│ Verify │ │ Check returnTo   │
│ Email  │ │ parameter        │
└────────┘ └──────────────────┘
    │              │
    │          ┌───┴───┐
    │          │       │
    │          ▼       ▼
    │      returnTo  No returnTo
    │          │       │
    │          ▼       ▼
    │   ┌──────────┐ ┌──────────────────┐
    │   │ Navigate │ │ Client Dashboard │
    │   │ to       │ │                  │
    │   │ returnTo │ │ ✅ Check profile │
    │   └──────────┘ │ ✅ Show services │
    │                └──────────────────┘
    │
    ▼ After verification
┌──────────────────┐
│  Login Screen    │
│  (retry login)   │
└──────────────────┘
```

## 🔄 Flux de Souscription

```
┌─────────────────────────────────────────────────────────────────┐
│                   SUBSCRIPTION FLOW                              │
└─────────────────────────────────────────────────────────────────┘

User on Pricing Screen
        │
        ▼ User clicks plan
┌──────────────────┐
│  Check Auth      │
└──────────────────┘
        │
    ┌───┴───┐
    │       │
    ▼       ▼
  NO       YES
    │       │
    ▼       ▼
┌────────┐ ┌──────────────────┐
│ Alert  │ │ Check Plan Type  │
│ Login  │ └──────────────────┘
│ Req.   │         │
└────────┘     ┌───┴───┐
    │          │       │
    │          ▼       ▼
    │      Basic   Premium/Enterprise
    │          │       │
    │          ▼       ▼
    │   ┌──────────┐ ┌──────────────────┐
    │   │ Create   │ │ Navigate to      │
    │   │ Free     │ │ Subscription     │
    │   │ Sub      │ │ Confirm          │
    │   └──────────┘ └──────────────────┘
    │          │              │
    │          ▼              ▼
    │   ┌──────────┐ ┌──────────────────┐
    │   │ Navigate │ │ User confirms    │
    │   │ to       │ │ and pays         │
    │   │ Dashboard│ └──────────────────┘
    │   └──────────┘         │
    │                        ▼
    │                 ┌──────────────────┐
    │                 │ Payment Success  │
    │                 │ or Cancel        │
    │                 └──────────────────┘
    │                        │
    │                        ▼
    │                 ┌──────────────────┐
    │                 │ Navigate to      │
    │                 │ Dashboard        │
    │                 └──────────────────┘
    │
    ▼ User clicks "Login"
┌──────────────────┐
│  Login Screen    │
│  with returnTo=  │
│  pricing         │
└──────────────────┘
        │
        ▼ After login
┌──────────────────┐
│  Pricing Screen  │
│  (retry plan     │
│   selection)     │
└──────────────────┘
```

## 🛡️ Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Any Screen
        │
        ▼ Error occurs
┌──────────────────┐
│  Error Type?     │
└──────────────────┘
        │
    ┌───┴───────────────┐
    │                   │
    ▼                   ▼
React Error      JavaScript Error
    │                   │
    ▼                   ▼
┌────────────┐   ┌──────────────────┐
│ Error      │   │ Error Logger     │
│ Boundary   │   │ catches          │
│ catches    │   └──────────────────┘
└────────────┘           │
    │                    │
    ├────────────────────┤
    │                    │
    ▼                    ▼
┌─────────────────────────────────┐
│  Log Error                      │
│  - Platform                     │
│  - Stack trace                  │
│  - Context                      │
│  - Severity                     │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Display Error Screen           │
│                                 │
│  Options:                       │
│  1. ErrorBoundary fallback      │
│  2. USS Error Screen            │
└─────────────────────────────────┘
    │
    ▼ User action
┌─────────────────────────────────┐
│  Recovery Options               │
│                                 │
│  - Try Again (reload)           │
│  - Go Home                      │
│  - Contact Support              │
└─────────────────────────────────┘
```

## 📝 Résumé des Écrans

### Écrans Publics (Pas de redirection auto)
- ✅ Home
- ✅ Services
- ✅ Ports
- ✅ Pricing
- ✅ Become Agent
- ✅ Contact

### Écrans Authentifiés (Redirection conditionnelle)
- ⚠️ Login (redirige après connexion)
- ⚠️ Signup (redirige vers verify-email)
- ⚠️ Verify Email (redirige vers login)
- ⚠️ Client Dashboard (redirige vers profile si incomplet)
- ⚠️ Digital Portal (vérifie accès)

### Écrans d'Erreur
- 🔴 ErrorBoundary (fallback automatique)
- 🔴 USS Error Screen (navigation manuelle)

## 🎯 Conclusion

Le flux de navigation est maintenant **sécurisé** et **sans boucle infinie**:

1. ✅ Pas de redirection automatique dans les écrans publics
2. ✅ Redirections conditionnelles avec flags de protection
3. ✅ Utilisation de `router.replace()` pour l'authentification
4. ✅ Gestion des paramètres `returnTo` pour éviter les boucles
5. ✅ Error handling robuste avec ErrorBoundary et USS Error Screen

---

**Dernière mise à jour:** $(date)
**Version:** 1.0.0
