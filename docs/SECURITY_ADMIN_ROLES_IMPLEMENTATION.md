
# Sécurité & Rôles Admin - Documentation Complète

## Vue d'ensemble

Ce document décrit l'implémentation complète du système de sécurité et de gestion des rôles administrateurs pour l'application Universal Shipping Services (3S Global).

## 📋 Table des matières

1. [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
2. [Gestion des rôles administrateurs](#gestion-des-rôles-administrateurs)
3. [Protection des pages sensibles](#protection-des-pages-sensibles)
4. [Protection des fonctionnalités sensibles](#protection-des-fonctionnalités-sensibles)
5. [Intégration avec Supabase RLS](#intégration-avec-supabase-rls)
6. [Feedback visuel](#feedback-visuel)
7. [Tests et validation](#tests-et-validation)

---

## Configuration des variables d'environnement

### Variables requises

Les variables d'environnement suivantes doivent être configurées dans Natively :

#### Variables générales
- `APP_ENV` : Environnement de l'application (`production` ou `dev`)
- `ADMIN_EMAILS` : Liste d'emails admin séparés par des virgules

#### Variables Supabase
- `EXPO_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_KEY` : Clé de service (backend uniquement)

#### Variables PayPal
- `EXPO_PUBLIC_PAYPAL_CLIENT_ID` : Client ID PayPal
- `PAYPAL_CLIENT_SECRET` : Secret PayPal (backend uniquement)
- `PAYPAL_WEBHOOK_ID` : ID du webhook PayPal
- `PAYPAL_ENV` : Environnement PayPal (`sandbox` ou `live`)
- `PAYMENT_PROVIDER` : Fournisseur de paiement (`paypal`)

#### Variables SMTP
- `SMTP_HOST` : Hôte SMTP
- `SMTP_PORT` : Port SMTP
- `SMTP_USERNAME` : Nom d'utilisateur SMTP
- `SMTP_PASSWORD` : Mot de passe SMTP

#### Variables Google Maps
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` : Clé API Google Maps

### Exemple de configuration

```bash
# Environnement
APP_ENV=production

# Admins (séparés par des virgules)
ADMIN_EMAILS=cheikh@universalshipping.com,admin@uss.com,admin@3sglobal.com

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PayPal
EXPO_PUBLIC_PAYPAL_CLIENT_ID=AYourClientID...
PAYPAL_CLIENT_SECRET=YourClientSecret...
PAYPAL_WEBHOOK_ID=WH-...
PAYPAL_ENV=live
PAYMENT_PROVIDER=paypal

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@universalshipping.com
SMTP_PASSWORD=YourPassword...

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

## Gestion des rôles administrateurs

### Configuration côté application (Frontend)

#### 1. Fonction `isAdmin()` dans `config/appConfig.ts`

```typescript
/**
 * Admin Role Management
 * Check if a user email is in the admin list
 */
export const isAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;
  const normalizedEmail = userEmail.trim().toLowerCase();
  return env.ADMIN_EMAILS.includes(normalizedEmail);
};
```

**Fonctionnement :**
- Lit la variable d'environnement `ADMIN_EMAILS`
- Découpe la liste par virgule
- Compare l'email de l'utilisateur (en minuscules) avec la liste
- Retourne `true` si l'email est dans la liste

#### 2. Contexte d'authentification

Le contexte `AuthContext` expose un booléen global `currentUserIsAdmin` :

```typescript
// Dans AuthContext.tsx
const currentUserIsAdmin = appConfig.isAdmin(user?.email);

// Disponible dans toute l'application via useAuth()
const { currentUserIsAdmin } = useAuth();
```

### Configuration côté base de données (Backend)

#### Fonction PostgreSQL `is_admin_user()`

```sql
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
  admin_emails TEXT;
  admin_list TEXT[];
BEGIN
  -- Get the current user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- If no user is logged in, return false
  IF user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get admin emails from Supabase secrets
  admin_emails := COALESCE(
    current_setting('app.settings.admin_emails', true),
    'cheikh@universalshipping.com'
  );
  
  -- Split and trim
  admin_list := string_to_array(lower(admin_emails), ',');
  FOR i IN 1..array_length(admin_list, 1) LOOP
    admin_list[i] := trim(admin_list[i]);
  END LOOP;
  
  -- Check if user is admin
  RETURN lower(trim(user_email)) = ANY(admin_list);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Note importante :** Pour que cette fonction utilise la variable d'environnement `ADMIN_EMAILS`, vous devez configurer le paramètre `app.settings.admin_emails` dans Supabase :

1. Allez dans **Database** > **Settings** > **Custom Postgres Configuration**
2. Ajoutez : `app.settings.admin_emails = 'cheikh@universalshipping.com,admin@uss.com'`
3. Redémarrez la base de données

**Alternative :** Utilisez une table `admin_users` pour gérer les admins de manière plus flexible.

---

## Protection des pages sensibles

### Composant `ProtectedRoute`

Le composant `ProtectedRoute` protège les pages sensibles :

```typescript
<ProtectedRoute requireAdmin={true}>
  {/* Contenu réservé aux admins */}
</ProtectedRoute>
```

**Fonctionnalités :**
- Vérifie si l'utilisateur est connecté
- Vérifie si l'email est confirmé (optionnel)
- Vérifie si l'utilisateur est admin (si `requireAdmin={true}`)
- Redirige vers la page de connexion ou affiche un message d'accès refusé

### Pages protégées

Les pages suivantes sont protégées par `requireAdmin={true}` :

1. **Configuration Status** (`/config_status`)
   - Affiche l'état de la configuration
   - Réservé aux admins en mode développement

2. **Admin Dashboard** (`/admin-dashboard`)
   - Tableau de bord administrateur
   - Gestion des devis, agents, abonnements, expéditions

3. **Admin Agent Details** (`/admin-agent-details`)
   - Détails et validation des agents

4. **Admin Quote Details** (`/admin-quote-details`)
   - Détails et gestion des devis

5. **Admin Shipment Details** (`/admin-shipment-details`)
   - Détails et gestion des expéditions

6. **Admin Subscription Details** (`/admin-subscription-details`)
   - Détails et gestion des abonnements

### Exemple d'utilisation

```typescript
// Dans app/(tabs)/admin-dashboard.tsx
export default function AdminDashboardScreen() {
  const { user, currentUserIsAdmin } = useAuth();

  // Redirection si non admin
  if (!user || !currentUserIsAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  return (
    <View>
      {/* Contenu admin */}
    </View>
  );
}
```

---

## Protection des fonctionnalités sensibles

### Champs protégés

Les utilisateurs non-admin **ne peuvent pas** modifier les champs suivants :

#### 1. `global_agents.status`
- Validation d'un agent (`pending` → `validated` ou `rejected`)
- Seuls les admins peuvent changer le statut

#### 2. `subscriptions.is_active`
- Activation/désactivation d'un abonnement
- Seuls les admins peuvent modifier ce champ

#### 3. `shipments.current_status`
- Statut de l'expédition (`draft`, `in_transit`, `delivered`, etc.)
- Seuls les admins peuvent modifier manuellement le statut

### Implémentation côté frontend

```typescript
// Exemple : Mise à jour du statut d'un agent
const updateAgentStatus = async (agentId: string, newStatus: string) => {
  // Vérification admin côté client
  if (!currentUserIsAdmin) {
    Alert.alert('Erreur', 'Action réservée aux administrateurs');
    return;
  }

  // Mise à jour (protégée aussi par RLS côté base)
  const { error } = await supabase
    .from('global_agents')
    .update({ status: newStatus })
    .eq('id', agentId);

  if (error) {
    console.error('Error updating agent status:', error);
  }
};
```

### Implémentation côté backend (RLS)

Les politiques RLS empêchent les modifications non autorisées :

```sql
-- Exemple : Protection du statut des agents
CREATE POLICY "Only admins can update agent status"
ON global_agents
FOR UPDATE
USING (
  is_admin_user() 
  OR (
    auth.role() = 'authenticated' 
    AND status = (SELECT status FROM global_agents WHERE id = global_agents.id)
  )
)
WITH CHECK (
  is_admin_user() 
  OR status = (SELECT status FROM global_agents WHERE id = global_agents.id)
);
```

**Explication :**
- `USING` : Qui peut voir/modifier la ligne
- `WITH CHECK` : Quelles modifications sont autorisées
- Si non-admin : le statut ne peut pas changer
- Si admin : toutes les modifications sont autorisées

---

## Intégration avec Supabase RLS

### Politiques RLS existantes

#### Table `clients`
```sql
-- Les utilisateurs peuvent voir/modifier uniquement leur propre profil
CREATE POLICY "Users can view their own client profile"
ON clients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client profile"
ON clients FOR UPDATE
USING (auth.uid() = user_id);
```

#### Table `freight_quotes`
```sql
-- Les admins ont un accès complet
CREATE POLICY "Admins have full access to freight_quotes"
ON freight_quotes FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Les clients peuvent voir leurs propres devis
CREATE POLICY "Users can view their own freight quotes"
ON freight_quotes FOR SELECT
USING (
  client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);
```

#### Table `shipments`
```sql
-- Les admins ont un accès complet
CREATE POLICY "Admins have full access to shipments"
ON shipments FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Les clients peuvent voir leurs propres expéditions
CREATE POLICY "Clients can view their own shipments"
ON shipments FOR SELECT
USING (
  client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- Les clients ne peuvent pas modifier le statut
CREATE POLICY "Clients can update their own shipments"
ON shipments FOR UPDATE
USING (
  client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  (
    is_admin_user() 
    OR current_status = (
      SELECT current_status FROM shipments WHERE id = shipments.id
    )
  )
  AND client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);
```

#### Table `subscriptions`
```sql
-- Les admins ont un accès complet
CREATE POLICY "Admins have full access to subscriptions"
ON subscriptions FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Les clients peuvent voir leurs propres abonnements
CREATE POLICY "Clients can view their own subscriptions"
ON subscriptions FOR SELECT
USING (
  client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- Les clients ne peuvent pas modifier is_active
CREATE POLICY "Clients can update their own subscriptions"
ON subscriptions FOR UPDATE
USING (
  client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  (
    is_admin_user() 
    OR is_active = (
      SELECT is_active FROM subscriptions WHERE id = subscriptions.id
    )
  )
  AND client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);
```

#### Table `global_agents`
```sql
-- Les admins ont un accès complet
CREATE POLICY "Admins have full access to global_agents"
ON global_agents FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Tout le monde peut soumettre une candidature
CREATE POLICY "Anyone can insert agent applications"
ON global_agents FOR INSERT
WITH CHECK (true);

-- Seuls les admins peuvent modifier le statut
CREATE POLICY "Only admins can update agent status"
ON global_agents FOR UPDATE
USING (
  is_admin_user() 
  OR (
    auth.role() = 'authenticated' 
    AND true
  )
)
WITH CHECK (
  is_admin_user() 
  OR status = (
    SELECT status FROM global_agents WHERE id = global_agents.id
  )
);

-- Tout le monde peut voir les agents validés
CREATE POLICY "Public can view validated agents"
ON global_agents FOR SELECT
USING (status = 'validated');
```

### Vérification des politiques RLS

Pour vérifier les politiques RLS d'une table :

```sql
SELECT * FROM pg_policies WHERE tablename = 'nom_de_la_table';
```

---

## Feedback visuel

### Badge d'environnement

Le composant `ConfigStatus` affiche un badge indiquant l'environnement actuel :

- **Production** : Badge vert avec texte "PRODUCTION"
- **Développement** : Badge orange avec texte "DEV" ou "STAGING"

```typescript
<View style={[
  styles.envBadge, 
  { backgroundColor: appConfig.isProduction ? '#10b981' : '#f59e0b' }
]}>
  <Text style={styles.envText}>
    {appConfig.appEnv.toUpperCase()}
  </Text>
</View>
```

### Section Sécurité

La page `ConfigStatus` affiche une section "Sécurité" avec :

1. **Email de l'utilisateur connecté**
   ```
   Utilisateur: cheikh@universalshipping.com
   ```

2. **Statut Admin ou Client**
   - Badge "Admin" avec icône étoile (bleu) si admin
   - Badge "Client" avec icône personne (gris) si client

3. **Message explicatif**
   - Si admin : "Vous avez accès à toutes les fonctionnalités administratives."
   - Si client : "Certaines actions sont réservées à l'équipe Universal Shipping Services."

### Message d'accès refusé

Lorsqu'un utilisateur non-admin tente d'accéder à une page protégée :

```
🛡️ Accès Restreint

Cette page est réservée à l'équipe Universal Shipping Services.

Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.

[Retour à l'accueil]
```

---

## Tests et validation

### Tests manuels

#### 1. Test de connexion admin

1. Connectez-vous avec un email admin (ex: `cheikh@universalshipping.com`)
2. Vérifiez que le badge "Admin" apparaît dans ConfigStatus
3. Vérifiez l'accès au Admin Dashboard
4. Vérifiez la possibilité de modifier les statuts

#### 2. Test de connexion client

1. Connectez-vous avec un email non-admin
2. Vérifiez que le badge "Client" apparaît dans ConfigStatus
3. Tentez d'accéder au Admin Dashboard → Message d'accès refusé
4. Tentez de modifier un statut → Erreur

#### 3. Test des politiques RLS

```sql
-- Se connecter en tant que client
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id-here", "email": "client@example.com"}';

-- Tenter de modifier le statut d'un agent (devrait échouer)
UPDATE global_agents SET status = 'validated' WHERE id = 'agent-id';
-- Erreur attendue : new row violates row-level security policy

-- Se connecter en tant qu'admin
SET LOCAL request.jwt.claims TO '{"sub": "admin-id-here", "email": "cheikh@universalshipping.com"}';

-- Tenter de modifier le statut d'un agent (devrait réussir)
UPDATE global_agents SET status = 'validated' WHERE id = 'agent-id';
-- Succès
```

### Tests automatisés

#### Test de la fonction `isAdmin()`

```typescript
import appConfig from '@/config/appConfig';

describe('isAdmin', () => {
  it('should return true for admin emails', () => {
    expect(appConfig.isAdmin('cheikh@universalshipping.com')).toBe(true);
    expect(appConfig.isAdmin('CHEIKH@UNIVERSALSHIPPING.COM')).toBe(true); // Case insensitive
  });

  it('should return false for non-admin emails', () => {
    expect(appConfig.isAdmin('client@example.com')).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(appConfig.isAdmin(null)).toBe(false);
    expect(appConfig.isAdmin(undefined)).toBe(false);
  });
});
```

#### Test du composant `ProtectedRoute`

```typescript
import { render } from '@testing-library/react-native';
import { ProtectedRoute } from '@/components/ProtectedRoute';

describe('ProtectedRoute', () => {
  it('should redirect non-admin users', () => {
    // Mock useAuth to return non-admin user
    jest.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { email: 'client@example.com' },
        currentUserIsAdmin: false,
      }),
    }));

    const { getByText } = render(
      <ProtectedRoute requireAdmin={true}>
        <Text>Admin Content</Text>
      </ProtectedRoute>
    );

    expect(getByText('Accès Restreint')).toBeTruthy();
  });

  it('should allow admin users', () => {
    // Mock useAuth to return admin user
    jest.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { email: 'cheikh@universalshipping.com' },
        currentUserIsAdmin: true,
      }),
    }));

    const { getByText } = render(
      <ProtectedRoute requireAdmin={true}>
        <Text>Admin Content</Text>
      </ProtectedRoute>
    );

    expect(getByText('Admin Content')).toBeTruthy();
  });
});
```

---

## Dépannage

### Problème : L'utilisateur admin n'a pas accès aux pages admin

**Solution :**
1. Vérifiez que l'email est bien dans `ADMIN_EMAILS`
2. Vérifiez que l'email est en minuscules et sans espaces
3. Vérifiez que la variable d'environnement est bien chargée :
   ```typescript
   console.log('ADMIN_EMAILS:', appConfig.env.ADMIN_EMAILS);
   ```

### Problème : Les politiques RLS bloquent les admins

**Solution :**
1. Vérifiez que la fonction `is_admin_user()` fonctionne :
   ```sql
   SELECT is_admin_user();
   ```
2. Vérifiez que le paramètre `app.settings.admin_emails` est configuré dans Supabase
3. Redémarrez la base de données après modification de la configuration

### Problème : Le badge d'environnement n'apparaît pas

**Solution :**
1. Vérifiez que `APP_ENV` est défini dans les variables d'environnement
2. Vérifiez que `appConfig.isDevelopment` est `true` pour afficher ConfigStatus
3. Le composant ConfigStatus n'apparaît qu'en mode développement

---

## Checklist de déploiement

Avant de déployer en production :

- [ ] Toutes les variables d'environnement sont configurées
- [ ] `APP_ENV=production` en production
- [ ] `PAYPAL_ENV=live` en production (si PayPal est utilisé)
- [ ] Les emails admin sont corrects dans `ADMIN_EMAILS`
- [ ] La fonction `is_admin_user()` est déployée
- [ ] Les politiques RLS sont activées sur toutes les tables sensibles
- [ ] Les tests manuels ont été effectués
- [ ] Le composant ConfigStatus est désactivé en production (automatique)
- [ ] Les logs sensibles sont désactivés en production (automatique via `appConfig.logger`)

---

## Ressources supplémentaires

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentation Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Guide de sécurité Supabase](https://supabase.com/docs/guides/auth/managing-user-data)

---

## Support

Pour toute question ou problème :
- Email : support@universalshipping.com
- Documentation interne : `/docs/`
- Équipe technique : Cheikh (cheikh@universalshipping.com)
