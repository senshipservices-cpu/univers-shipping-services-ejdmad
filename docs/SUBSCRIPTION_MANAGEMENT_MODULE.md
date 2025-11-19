
# Module 4 – Gestion des Abonnements

## Vue d'ensemble

Le module de gestion des abonnements permet aux administrateurs de gérer tous les abonnements clients depuis le tableau de bord admin.

## 1. Liste des abonnements

### Accès
- **Page**: `admin-dashboard` (onglet "Abonnements")
- **Accès**: Admin uniquement (emails dans `AdminContext`)

### Source de données
- Table: `subscriptions`
- Relations: `clients` (company_name, email)

### Affichage
Pour chaque abonnement, la liste affiche:
- ✅ **Client**: Nom de l'entreprise (company_name)
- ✅ **Plan Type**: Type d'abonnement (plan_type)
- ✅ **Start Date**: Date de début (start_date)
- ✅ **End Date**: Date de fin (end_date)
- ✅ **Is Active**: État d'activation (is_active)
- ✅ **Status**: Statut (status)

### Actions
- **Bouton "Modifier"**: Navigue vers `admin-subscription-details?subscription_id=<id>`

### Fonctionnalités supplémentaires
- Tri par date de création (DESC)
- Badges visuels pour le statut et l'état actif
- Icônes pour une meilleure lisibilité
- Refresh pull-to-refresh

## 2. Page admin_subscription_details

### Accès
- **Route**: `/(tabs)/admin-subscription-details`
- **Paramètre**: `subscription_id` (UUID)
- **Accès**: Admin uniquement

### Informations affichées

#### Section Client
- Nom de l'entreprise
- Email
- Icône entreprise

#### Section Plan
- Type de plan avec badge coloré
- Icône étoile

#### Section Statut (Éditable)
- Statut actuel avec badge coloré
- Bouton d'édition
- Options: pending, active, cancelled, expired

#### Section État d'activation (Éditable)
- État actif/inactif
- Bouton d'édition
- Toggle entre actif et inactif

#### Section Dates
- Date de début (lecture seule)
- Date de fin (éditable avec date picker)

#### Section Paiement (si disponible)
- Fournisseur de paiement
- Référence de paiement

#### Section Notes (si disponible)
- Notes internes

#### Section Historique
- Date de création
- Date de dernière mise à jour

### Champs éditables

1. **is_active** (boolean)
   - Modal avec options: Actif / Inactif
   - Mise à jour immédiate dans la base de données
   - Log d'événement automatique

2. **status** (enum)
   - Modal avec options: pending, active, cancelled, expired
   - Badges colorés pour chaque statut
   - Mise à jour immédiate dans la base de données
   - Log d'événement automatique

3. **end_date** (date)
   - Date picker natif
   - Mise à jour immédiate dans la base de données
   - Log d'événement automatique

### Boutons d'action

#### 1. Activer maintenant
- **Condition**: Affiché uniquement si `is_active = false`
- **Action**: 
  - Met `is_active = true`
  - Met `status = 'active'`
  - Envoie un email de confirmation au client
  - Log l'événement `subscription_activated`
- **Confirmation**: Dialogue de confirmation avant action

#### 2. Désactiver
- **Condition**: Affiché uniquement si `is_active = true`
- **Action**: 
  - Met `is_active = false`
  - Met `status = 'cancelled'`
  - Envoie un email de notification au client
  - Log l'événement `subscription_deactivated`
- **Confirmation**: Dialogue de confirmation avant action (style destructif)

#### 3. Prolonger
- **Action**: 
  - Affiche un dialogue avec options: 1, 3, 6, ou 12 mois
  - Calcule la nouvelle date de fin
  - Met à jour `end_date`
  - Envoie un email de confirmation au client
  - Log l'événement `subscription_extended`
- **Confirmation**: Dialogue de sélection de durée

#### 4. Envoyer email client
- **Action**: 
  - Envoie un email de rappel au client
  - Contient les détails de l'abonnement
  - Log l'événement `subscription_email_sent`
- **Confirmation**: Dialogue de confirmation avant envoi

## Fonctionnalités techniques

### Gestion des emails
Tous les emails sont insérés dans la table `email_notifications` avec:
- `recipient_email`: Email du client
- `email_type`: Type d'email (subscription_activated, subscription_deactivated, etc.)
- `subject`: Sujet de l'email (multilingue FR/EN)
- `body`: Corps de l'email (multilingue FR/EN)
- `metadata`: Métadonnées JSON (subscription_id, plan_type, etc.)
- `status`: 'pending' (traité par Edge Function)

### Logging des événements
Tous les changements sont loggés dans `events_log`:
- `event_type`: Type d'événement
- `user_id`: ID de l'admin
- `client_id`: ID du client
- `details`: Détails de l'action

### Multilingue
- Support FR/EN pour les emails
- Utilise le contexte `LanguageContext`
- Formatage des dates selon la locale

### Sécurité
- Vérification admin via `useAdmin()` hook
- Redirection si non-admin
- Validation des paramètres
- Confirmation pour actions critiques

## Structure de la base de données

### Table: subscriptions
```sql
- id (uuid, PK)
- client (uuid, FK → clients.id)
- plan_type (enum: basic, premium_tracking, enterprise_logistics, agent_listing, digital_portal)
- start_date (date)
- end_date (date, nullable)
- is_active (boolean, default: false)
- status (text, default: 'pending')
- payment_provider (text, nullable)
- payment_reference (text, nullable)
- notes (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### RLS Policies
- Activé sur la table `subscriptions`
- Admins: Accès complet
- Clients: Lecture de leurs propres abonnements

## UI/UX

### Design
- Cards avec bordures et ombres
- Badges colorés pour les statuts
- Icônes SF Symbols (iOS) / Material Icons (Android)
- Animations smooth pour les modals
- Pull-to-refresh sur la liste

### Couleurs des statuts
- **pending**: Gris (`colors.textSecondary`)
- **active**: Vert (`#10b981`)
- **cancelled**: Rouge (`#ef4444`)
- **expired**: Gris (`colors.textSecondary`)

### Responsive
- Adapté pour mobile et tablette
- Padding top pour Android (notch)
- Modals en bottom sheet
- Date picker natif

## Intégration

### Navigation
- Depuis `admin-dashboard` → onglet "Abonnements"
- Bouton "Modifier" sur chaque carte
- Navigation avec `router.push()`

### Contextes utilisés
- `AuthContext`: Authentification utilisateur
- `AdminContext`: Vérification admin
- `LanguageContext`: Multilingue

### Composants utilisés
- `IconSymbol`: Icônes cross-platform
- `DateTimePicker`: Sélection de date native
- `Modal`: Modals pour édition
- `ScrollView`: Défilement avec refresh

## Tests recommandés

1. **Liste des abonnements**
   - Vérifier l'affichage de tous les champs
   - Tester le tri par date
   - Vérifier les badges de statut
   - Tester la navigation vers les détails

2. **Détails d'abonnement**
   - Vérifier l'affichage de toutes les sections
   - Tester l'édition du statut
   - Tester l'édition de is_active
   - Tester l'édition de end_date
   - Vérifier les confirmations

3. **Actions**
   - Tester l'activation
   - Tester la désactivation
   - Tester la prolongation (1, 3, 6, 12 mois)
   - Tester l'envoi d'email
   - Vérifier les logs d'événements

4. **Sécurité**
   - Vérifier la redirection si non-admin
   - Vérifier la validation des paramètres
   - Tester avec différents emails admin

5. **Emails**
   - Vérifier l'insertion dans email_notifications
   - Vérifier le contenu FR/EN
   - Vérifier les métadonnées

## Statut d'implémentation

✅ **COMPLET** - Toutes les fonctionnalités sont implémentées et opérationnelles.

### Fichiers concernés
- `app/(tabs)/admin-dashboard.tsx` - Liste des abonnements
- `app/(tabs)/admin-subscription-details.tsx` - Détails et gestion
- `contexts/AdminContext.tsx` - Gestion des admins

### Prochaines étapes
- Tests utilisateurs
- Monitoring des emails envoyés
- Ajout de statistiques sur les abonnements dans le KPI dashboard
