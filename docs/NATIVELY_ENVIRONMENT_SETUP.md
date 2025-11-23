
# Configuration des Variables d'Environnement - Guide Complet

## 📋 Vue d'ensemble

Ce document décrit la configuration complète des variables d'environnement pour l'application Universal Shipping Services (3S Global) dans Natively.

**Important :** Toutes les clés sensibles doivent être stockées dans les variables d'environnement Natively et **jamais** dans le code source.

---

## 🔐 Variables d'environnement requises

### 1. Configuration de l'application

#### `APP_ENV`
- **Description :** Environnement de l'application
- **Valeurs possibles :** `production`, `dev`, `staging`
- **Exemple :** `production`
- **Utilisation :** Détermine le comportement de l'application (logs, features, etc.)

#### `ADMIN_EMAILS`
- **Description :** Liste d'emails administrateurs séparés par des virgules
- **Exemple :** `cheikh@universalshipping.com,admin@uss.com,admin@3sglobal.com`
- **Utilisation :** Définit qui a accès aux fonctionnalités administratives
- **Important :** Les emails doivent être en minuscules et sans espaces

---

### 2. Configuration Supabase

#### `EXPO_PUBLIC_SUPABASE_URL`
- **Description :** URL de votre projet Supabase
- **Exemple :** `https://lnfsjpuffrcyenuuoxxk.supabase.co`
- **Visibilité :** Public (accessible côté client)
- **Où trouver :** Supabase Dashboard > Project Settings > API

#### `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Description :** Clé anonyme Supabase (JWT)
- **Exemple :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Visibilité :** Public (accessible côté client)
- **Où trouver :** Supabase Dashboard > Project Settings > API
- **Note :** Cette clé est sécurisée par les politiques RLS

#### `SUPABASE_SERVICE_KEY`
- **Description :** Clé de service Supabase (accès complet)
- **Exemple :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Visibilité :** **SECRET** (backend uniquement)
- **Où trouver :** Supabase Dashboard > Project Settings > API
- **⚠️ ATTENTION :** Ne jamais exposer cette clé côté client !

---

### 3. Configuration PayPal

#### `EXPO_PUBLIC_PAYPAL_CLIENT_ID`
- **Description :** Client ID de l'application PayPal
- **Exemple :** `AYourClientIDHere...`
- **Visibilité :** Public (nécessaire pour le SDK JavaScript)
- **Où trouver :** PayPal Developer Dashboard > My Apps & Credentials

#### `PAYPAL_CLIENT_SECRET`
- **Description :** Secret de l'application PayPal
- **Exemple :** `YourClientSecretHere...`
- **Visibilité :** **SECRET** (backend uniquement)
- **Où trouver :** PayPal Developer Dashboard > My Apps & Credentials
- **⚠️ ATTENTION :** Ne jamais exposer ce secret côté client !

#### `PAYPAL_WEBHOOK_ID`
- **Description :** ID du webhook PayPal pour la vérification des notifications
- **Exemple :** `WH-1AB23456CD789012E-3FG45678HI901234`
- **Visibilité :** Secret (backend uniquement)
- **Où trouver :** PayPal Developer Dashboard > Webhooks

#### `PAYPAL_ENV`
- **Description :** Environnement PayPal
- **Valeurs possibles :** `sandbox`, `live`
- **Exemple :** `sandbox` (dev), `live` (production)
- **Important :** Doit correspondre à l'environnement de l'application

#### `PAYMENT_PROVIDER`
- **Description :** Fournisseur de paiement actif
- **Valeurs possibles :** `paypal`, `stripe`
- **Exemple :** `paypal`
- **Utilisation :** Détermine quel système de paiement utiliser

---

### 4. Configuration SMTP (Emails)

#### `SMTP_HOST`
- **Description :** Hôte du serveur SMTP
- **Exemple :** `smtp.gmail.com`, `smtp.sendgrid.net`
- **Utilisation :** Envoi d'emails transactionnels

#### `SMTP_PORT`
- **Description :** Port du serveur SMTP
- **Valeurs courantes :** `587` (TLS), `465` (SSL), `25` (non sécurisé)
- **Exemple :** `587`

#### `SMTP_USERNAME`
- **Description :** Nom d'utilisateur SMTP
- **Exemple :** `noreply@universalshipping.com`
- **Visibilité :** Secret

#### `SMTP_PASSWORD`
- **Description :** Mot de passe SMTP
- **Exemple :** `YourSMTPPassword...`
- **Visibilité :** **SECRET**
- **⚠️ ATTENTION :** Ne jamais exposer ce mot de passe !

---

### 5. Configuration Google Maps

#### `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Description :** Clé API Google Maps
- **Exemple :** `AIzaSyYourAPIKeyHere...`
- **Visibilité :** Public (avec restrictions d'origine)
- **Où trouver :** Google Cloud Console > APIs & Services > Credentials
- **Important :** Restreindre l'utilisation par domaine/bundle ID

---

## 📝 Configuration dans Natively

### Étape 1 : Accéder aux variables d'environnement

1. Ouvrez votre projet dans Natively
2. Allez dans **Settings** > **Environment Variables**
3. Cliquez sur **Add Variable**

### Étape 2 : Ajouter les variables

Pour chaque variable :

1. **Name :** Nom de la variable (ex: `APP_ENV`)
2. **Value :** Valeur de la variable
3. **Visibility :** 
   - **Public** : Pour les variables `EXPO_PUBLIC_*`
   - **Secret** : Pour toutes les autres variables sensibles
4. **Environment :** Sélectionnez l'environnement (Development, Production, ou Both)

### Étape 3 : Vérifier la configuration

Utilisez le composant `ConfigStatus` pour vérifier que toutes les variables sont correctement configurées :

```typescript
import { ConfigStatus } from '@/components/ConfigStatus';

// Dans votre écran de développement
<ConfigStatus />
```

---

## 🔒 Sécurité et bonnes pratiques

### Variables publiques vs secrètes

#### Variables publiques (`EXPO_PUBLIC_*`)
- Accessibles côté client (frontend)
- Peuvent être vues dans le code JavaScript compilé
- Exemples : URLs, clés API publiques, client IDs

#### Variables secrètes
- Accessibles uniquement côté serveur (Edge Functions)
- Ne doivent **jamais** être exposées côté client
- Exemples : Secrets, mots de passe, clés de service

### Règles de sécurité

1. **Ne jamais hardcoder les clés sensibles dans le code**
   ```typescript
   // ❌ MAUVAIS
   const apiKey = 'sk_live_abc123...';
   
   // ✅ BON
   const apiKey = process.env.STRIPE_SECRET_KEY;
   ```

2. **Utiliser le préfixe `EXPO_PUBLIC_` uniquement pour les variables publiques**
   ```typescript
   // ✅ BON - Variable publique
   EXPO_PUBLIC_SUPABASE_URL=https://...
   
   // ❌ MAUVAIS - Secret exposé
   EXPO_PUBLIC_STRIPE_SECRET_KEY=sk_live_...
   ```

3. **Vérifier l'environnement avant d'utiliser des clés de test**
   ```typescript
   if (appConfig.isProduction && apiKey.startsWith('test_')) {
     throw new Error('Test key used in production!');
   }
   ```

4. **Restreindre les clés API par domaine/origine**
   - Google Maps : Restreindre par domaine et bundle ID
   - PayPal : Configurer les URLs de retour autorisées
   - Supabase : Utiliser les politiques RLS

---

## 🔗 Connexion avec Supabase RLS

### Configuration de la fonction `is_admin_user()`

Pour que les politiques RLS utilisent la variable `ADMIN_EMAILS`, vous devez configurer Supabase :

#### Option 1 : Configuration Postgres (Recommandé)

1. Allez dans **Database** > **Settings** > **Custom Postgres Configuration**
2. Ajoutez la ligne suivante :
   ```
   app.settings.admin_emails = 'cheikh@universalshipping.com,admin@uss.com'
   ```
3. Redémarrez la base de données

#### Option 2 : Table `admin_users` (Alternative)

Créez une table dédiée pour gérer les admins :

```sql
-- Créer la table admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir/modifier
CREATE POLICY "Only admins can manage admin_users"
ON admin_users FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Insérer les admins initiaux
INSERT INTO admin_users (email) VALUES
  ('cheikh@universalshipping.com'),
  ('admin@uss.com'),
  ('admin@3sglobal.com');

-- Mettre à jour la fonction is_admin_user()
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  IF user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE lower(trim(email)) = lower(trim(user_email))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Avantages de cette approche :**
- Gestion dynamique des admins sans redémarrage
- Interface d'administration possible
- Historique des modifications
- Plus flexible que les variables d'environnement

---

## 🧪 Tests et validation

### Vérifier les variables d'environnement

```typescript
import appConfig from '@/config/appConfig';

// Vérifier la configuration
const validation = appConfig.validateConfig();

console.log('Configuration valide:', validation.valid);
console.log('Erreurs:', validation.errors);
console.log('Avertissements:', validation.warnings);
```

### Tester l'accès admin

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, currentUserIsAdmin } = useAuth();

console.log('Utilisateur:', user?.email);
console.log('Est admin:', currentUserIsAdmin);
```

### Tester les politiques RLS

```sql
-- Se connecter en tant qu'utilisateur spécifique
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id", "email": "test@example.com"}';

-- Tester l'accès
SELECT * FROM global_agents; -- Devrait voir uniquement les agents validés
UPDATE global_agents SET status = 'validated' WHERE id = 'agent-id'; -- Devrait échouer
```

---

## 📊 Environnements

### Développement (`dev`)

```bash
APP_ENV=dev
PAYPAL_ENV=sandbox
STRIPE_PUBLIC_KEY=pk_test_...
# Logs verbeux activés
# Fonctionnalités de debug activées
```

### Staging (`staging`)

```bash
APP_ENV=staging
PAYPAL_ENV=sandbox
STRIPE_PUBLIC_KEY=pk_test_...
# Configuration proche de la production
# Tests finaux avant déploiement
```

### Production (`production`)

```bash
APP_ENV=production
PAYPAL_ENV=live
STRIPE_PUBLIC_KEY=pk_live_...
# Logs minimaux
# Fonctionnalités de debug désactivées
# Clés de production uniquement
```

---

## 🚨 Dépannage

### Problème : Variables non chargées

**Symptômes :**
- `undefined` lors de l'accès à `process.env.VARIABLE_NAME`
- Erreurs de configuration

**Solutions :**
1. Vérifiez que la variable est bien définie dans Natively
2. Vérifiez le préfixe `EXPO_PUBLIC_` pour les variables publiques
3. Redémarrez le serveur de développement
4. Vérifiez l'environnement actif (dev/production)

### Problème : Clés PayPal invalides

**Symptômes :**
- Erreur "Invalid client credentials"
- Paiements échoués

**Solutions :**
1. Vérifiez que `PAYPAL_ENV` correspond aux clés utilisées
2. Sandbox keys → `PAYPAL_ENV=sandbox`
3. Live keys → `PAYPAL_ENV=live`
4. Vérifiez que les clés sont complètes (pas de caractères manquants)

### Problème : Supabase RLS bloque les requêtes

**Symptômes :**
- Erreur "new row violates row-level security policy"
- Données non accessibles

**Solutions :**
1. Vérifiez que l'utilisateur est authentifié
2. Vérifiez les politiques RLS de la table
3. Testez la fonction `is_admin_user()` :
   ```sql
   SELECT is_admin_user();
   ```
4. Vérifiez que l'email de l'utilisateur est dans `ADMIN_EMAILS`

---

## 📚 Ressources

### Documentation officielle
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/managing-environments)
- [PayPal REST API](https://developer.paypal.com/api/rest/)

### Documentation interne
- [SECURITY_ADMIN_ROLES_IMPLEMENTATION.md](./SECURITY_ADMIN_ROLES_IMPLEMENTATION.md) - Gestion des rôles admin
- [PAYPAL_CONFIGURATION_COMPLETE.md](./PAYPAL_CONFIGURATION_COMPLETE.md) - Configuration PayPal
- [ENVIRONMENT_VARIABLES_SETUP_COMPLETE.md](./ENVIRONMENT_VARIABLES_SETUP_COMPLETE.md) - Guide de configuration

---

## ✅ Checklist de configuration

Avant de déployer :

### Variables générales
- [ ] `APP_ENV` configuré (`production` en prod)
- [ ] `ADMIN_EMAILS` configuré avec les bons emails

### Supabase
- [ ] `EXPO_PUBLIC_SUPABASE_URL` configuré
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` configuré
- [ ] `SUPABASE_SERVICE_KEY` configuré (secret)
- [ ] Politiques RLS activées sur toutes les tables
- [ ] Fonction `is_admin_user()` déployée

### PayPal
- [ ] `EXPO_PUBLIC_PAYPAL_CLIENT_ID` configuré
- [ ] `PAYPAL_CLIENT_SECRET` configuré (secret)
- [ ] `PAYPAL_WEBHOOK_ID` configuré
- [ ] `PAYPAL_ENV` correspond à l'environnement
- [ ] `PAYMENT_PROVIDER` défini sur `paypal`
- [ ] Webhooks configurés dans PayPal Dashboard

### SMTP
- [ ] `SMTP_HOST` configuré
- [ ] `SMTP_PORT` configuré
- [ ] `SMTP_USERNAME` configuré
- [ ] `SMTP_PASSWORD` configuré (secret)

### Google Maps
- [ ] `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` configuré
- [ ] Restrictions d'origine configurées

### Tests
- [ ] Validation de la configuration réussie
- [ ] Tests d'accès admin réussis
- [ ] Tests de paiement réussis
- [ ] Tests d'envoi d'emails réussis

---

## 📞 Support

Pour toute question ou problème :
- **Email :** support@universalshipping.com
- **Documentation :** `/docs/`
- **Équipe technique :** Cheikh (cheikh@universalshipping.com)
