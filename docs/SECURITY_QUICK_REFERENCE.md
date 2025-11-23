
# Sécurité & Rôles Admin - Guide Rapide

## 🎯 Résumé en 30 secondes

- **Admins définis par :** Variable `ADMIN_EMAILS` (emails séparés par virgules)
- **Vérification frontend :** `appConfig.isAdmin(email)` ou `currentUserIsAdmin` du contexte
- **Vérification backend :** Fonction PostgreSQL `is_admin_user()` dans les politiques RLS
- **Pages protégées :** Utilisent le composant `<ProtectedRoute requireAdmin={true}>`
- **Champs protégés :** `global_agents.status`, `subscriptions.is_active`, `shipments.current_status`

---

## 🔐 Configuration rapide

### 1. Définir les admins

Dans Natively > Environment Variables :

```bash
ADMIN_EMAILS=cheikh@universalshipping.com,admin@uss.com,admin@3sglobal.com
```

### 2. Vérifier l'environnement

```bash
APP_ENV=production  # ou 'dev'
```

### 3. Configurer Supabase (optionnel)

Dans Supabase > Database > Settings > Custom Postgres Configuration :

```
app.settings.admin_emails = 'cheikh@universalshipping.com,admin@uss.com'
```

---

## 💻 Utilisation dans le code

### Vérifier si un utilisateur est admin

```typescript
import appConfig from '@/config/appConfig';
import { useAuth } from '@/contexts/AuthContext';

// Méthode 1 : Via appConfig
const isUserAdmin = appConfig.isAdmin('cheikh@universalshipping.com');

// Méthode 2 : Via le contexte (recommandé)
const { currentUserIsAdmin } = useAuth();

if (currentUserIsAdmin) {
  // Afficher les fonctionnalités admin
}
```

### Protéger une page

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      {/* Contenu réservé aux admins */}
    </ProtectedRoute>
  );
}
```

### Protéger une action

```typescript
const updateAgentStatus = async (agentId: string, newStatus: string) => {
  if (!currentUserIsAdmin) {
    Alert.alert('Erreur', 'Action réservée aux administrateurs');
    return;
  }

  // Effectuer l'action
  const { error } = await supabase
    .from('global_agents')
    .update({ status: newStatus })
    .eq('id', agentId);
};
```

---

## 🗄️ Politiques RLS

### Accès complet pour les admins

```sql
CREATE POLICY "Admins have full access"
ON table_name FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());
```

### Empêcher la modification d'un champ

```sql
CREATE POLICY "Clients cannot modify status"
ON table_name FOR UPDATE
USING (client_id = get_client_id())
WITH CHECK (
  is_admin_user() 
  OR status = (SELECT status FROM table_name WHERE id = table_name.id)
);
```

### Voir uniquement ses propres données

```sql
CREATE POLICY "Users can view their own data"
ON table_name FOR SELECT
USING (
  client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);
```

---

## 🎨 Feedback visuel

### Badge d'environnement

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

### Badge Admin/Client

```typescript
<View style={[
  styles.roleBadge,
  { backgroundColor: currentUserIsAdmin ? colors.primary + '20' : colors.textSecondary + '20' }
]}>
  <IconSymbol
    ios_icon_name={currentUserIsAdmin ? 'star.fill' : 'person.fill'}
    android_material_icon_name={currentUserIsAdmin ? 'star' : 'person'}
    size={14}
    color={currentUserIsAdmin ? colors.primary : colors.textSecondary}
  />
  <Text style={[
    styles.roleText,
    { color: currentUserIsAdmin ? colors.primary : colors.textSecondary }
  ]}>
    {currentUserIsAdmin ? 'Admin' : 'Client'}
  </Text>
</View>
```

---

## 🧪 Tests rapides

### Tester la fonction isAdmin()

```typescript
console.log('Admin check:', appConfig.isAdmin('cheikh@universalshipping.com')); // true
console.log('Admin check:', appConfig.isAdmin('client@example.com')); // false
```

### Tester is_admin_user() dans Supabase

```sql
-- Se connecter en tant qu'admin
SELECT is_admin_user(); -- Devrait retourner true

-- Tester une politique RLS
SELECT * FROM global_agents WHERE status = 'pending'; -- Devrait voir tous les agents
```

### Tester l'accès aux pages

1. Connectez-vous avec un email admin
2. Accédez à `/admin-dashboard` → Devrait fonctionner
3. Déconnectez-vous et reconnectez-vous avec un email non-admin
4. Accédez à `/admin-dashboard` → Devrait afficher "Accès Restreint"

---

## 🚨 Dépannage rapide

### L'admin n'a pas accès

1. Vérifiez `ADMIN_EMAILS` dans les variables d'environnement
2. Vérifiez que l'email est en minuscules et sans espaces
3. Redémarrez l'application
4. Vérifiez dans ConfigStatus que l'utilisateur est bien marqué comme "Admin"

### Les politiques RLS bloquent l'admin

1. Testez `SELECT is_admin_user();` dans Supabase SQL Editor
2. Vérifiez que `app.settings.admin_emails` est configuré
3. Redémarrez la base de données
4. Vérifiez que les politiques utilisent bien `is_admin_user()`

### Le badge d'environnement n'apparaît pas

1. ConfigStatus n'apparaît qu'en mode développement (`APP_ENV != 'production'`)
2. Vérifiez que `APP_ENV` est défini
3. Redémarrez l'application

---

## 📋 Checklist de sécurité

Avant de déployer en production :

- [ ] `ADMIN_EMAILS` configuré avec les bons emails
- [ ] `APP_ENV=production` en production
- [ ] Fonction `is_admin_user()` déployée dans Supabase
- [ ] Politiques RLS activées sur toutes les tables sensibles
- [ ] Tests d'accès admin réussis
- [ ] Tests d'accès client réussis (blocage des actions admin)
- [ ] ConfigStatus désactivé en production (automatique)
- [ ] Logs sensibles désactivés en production (automatique)

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- [SECURITY_ADMIN_ROLES_IMPLEMENTATION.md](./SECURITY_ADMIN_ROLES_IMPLEMENTATION.md) - Documentation complète
- [NATIVELY_ENVIRONMENT_SETUP.md](./NATIVELY_ENVIRONMENT_SETUP.md) - Configuration des variables d'environnement

---

## 🆘 Support

- **Email :** support@universalshipping.com
- **Équipe technique :** Cheikh (cheikh@universalshipping.com)
