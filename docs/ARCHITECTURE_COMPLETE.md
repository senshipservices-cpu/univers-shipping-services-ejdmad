
# Architecture Complète - UNIVERSAL SHIPPING SERVICES

## Vue d'ensemble

UNIVERSAL SHIPPING SERVICES (3S Global) est une plateforme complète de services maritimes, portuaires et logistiques avec couverture mondiale.

**Date de consolidation**: Janvier 2025  
**Version**: 1.0.0  
**Stack technique**: React Native + Expo 54 + Supabase

---

## 1. Structure de l'Application

### 1.1 Architecture des Dossiers

```
app/
├── (tabs)/                    # Navigation principale
│   ├── (home)/               # Écran d'accueil
│   ├── global-services.tsx   # Services globaux
│   ├── port-coverage.tsx     # Couverture portuaire
│   ├── pricing.tsx           # Plans tarifaires
│   ├── become-agent.tsx      # Devenir agent
│   ├── client-space.tsx      # Connexion client
│   ├── client-dashboard.tsx  # Tableau de bord client
│   ├── client-profile.tsx    # Profil client
│   ├── shipment-detail.tsx   # Détail expédition
│   ├── admin-dashboard.tsx   # Panneau admin
│   ├── freight-quote.tsx     # Demande de devis
│   ├── contact.tsx           # Contact
│   └── subscription-confirm.tsx # Confirmation abonnement
├── _layout.tsx               # Layout racine
└── integrations/
    └── supabase/
        ├── client.ts         # Client Supabase
        └── types.ts          # Types TypeScript

components/
├── FloatingTabBar.tsx        # Barre de navigation
├── IconSymbol.tsx            # Icônes multi-plateforme
├── ErrorBoundary.tsx         # Gestion des erreurs React
├── LoadingSpinner.tsx        # Indicateur de chargement
├── EmptyState.tsx            # État vide
├── ListItem.tsx              # Élément de liste
└── button.tsx                # Bouton personnalisé

contexts/
├── AuthContext.tsx           # Authentification
├── LanguageContext.tsx       # Multilingue
└── WidgetContext.tsx         # Widgets

hooks/
├── useClient.ts              # Gestion client
└── useSubscriptionAccess.ts  # Accès abonnements

utils/
├── constants.ts              # Constantes globales
├── validation.ts             # Validations
├── formatters.ts             # Formatage de données
├── security.ts               # Sécurité
├── dataIntegrity.ts          # Intégrité des données
└── errorLogger.ts            # Logging d'erreurs

styles/
└── commonStyles.ts           # Styles communs

i18n/
└── translations.ts           # Traductions FR/EN/ES/AR
```

### 1.2 Navigation

**Structure de navigation**:
- **FloatingTabBar**: Barre de navigation flottante avec 6 onglets principaux
- **Stack Navigation**: Navigation par pile pour les écrans secondaires
- **Conditional Rendering**: Affichage conditionnel basé sur l'authentification

**Onglets principaux**:
1. **Accueil** - Hub principal
2. **Services** - Services globaux
3. **Ports** - Couverture portuaire
4. **Pricing** - Plans tarifaires
5. **Devenir Agent** - Candidature agent
6. **Mon Espace / Connexion** - Espace client (conditionnel)

---

## 2. Base de Données Supabase

### 2.1 Schéma des Tables

#### **clients**
Profils des clients de la plateforme.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  country TEXT,
  city TEXT,
  sector TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Les utilisateurs peuvent voir uniquement leur propre profil
- Les utilisateurs peuvent mettre à jour uniquement leur propre profil

#### **ports**
Ports couverts par le réseau.

```sql
CREATE TABLE ports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  region port_region,
  services_available port_service[],
  description_fr TEXT,
  description_en TEXT,
  is_hub BOOLEAN DEFAULT false,
  status port_status DEFAULT 'actif',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Enums**:
- `port_region`: Afrique, Europe, Asie, Amériques, Océanie, Moyen-Orient
- `port_status`: actif, en_preparation, futur
- `port_service`: consignation, chartering, customs, logistics, ship_supply, crew_support, warehousing, door_to_door

**RLS Policies**:
- Lecture publique
- Écriture réservée aux utilisateurs authentifiés

#### **services_global**
Services offerts par la plateforme.

```sql
CREATE TABLE services_global (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category service_category NOT NULL,
  name_fr TEXT NOT NULL,
  name_en TEXT,
  short_desc_fr TEXT NOT NULL,
  short_desc_en TEXT,
  full_desc_fr TEXT,
  full_desc_en TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER,
  menu_group TEXT,
  cta_type TEXT,
  billing_model TEXT,
  base_price NUMERIC,
  currency TEXT DEFAULT 'EUR',
  is_quote_required BOOLEAN DEFAULT false,
  allow_online_payment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Enums**:
- `service_category`: maritime_shipping, logistics_port_handling, trade_consulting, digital_services

**CTA Types**:
- `quote`: Demander un devis
- `pricing`: Voir les tarifs
- `expert`: Consulter un expert
- `portal`: Accéder au portail

**RLS Policies**:
- Lecture publique pour les services actifs
- Écriture réservée aux admins

#### **global_agents**
Agents partenaires du réseau.

```sql
CREATE TABLE global_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  port UUID REFERENCES ports(id),
  activities agent_activity[] NOT NULL,
  years_experience INTEGER,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  certifications TEXT,
  logo TEXT,
  status agent_status DEFAULT 'pending',
  is_premium_listing BOOLEAN DEFAULT false,
  notes_internal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Enums**:
- `agent_status`: pending, validated, rejected
- `agent_activity`: consignation, customs, freight_forwarding, ship_supply, warehousing, trucking, consulting

**RLS Policies**:
- Lecture publique pour les agents validés uniquement
- Écriture réservée aux admins

#### **freight_quotes**
Demandes de devis fret.

```sql
CREATE TABLE freight_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client UUID REFERENCES clients(id),
  service_id UUID REFERENCES services_global(id),
  origin_port UUID REFERENCES ports(id) NOT NULL,
  destination_port UUID REFERENCES ports(id) NOT NULL,
  cargo_type TEXT,
  volume_details TEXT,
  incoterm TEXT,
  desired_eta TIMESTAMPTZ,
  status freight_quote_status DEFAULT 'received',
  quote_amount NUMERIC,
  quote_currency TEXT DEFAULT 'EUR',
  payment_status TEXT DEFAULT 'pending',
  client_decision TEXT,
  can_pay_online BOOLEAN DEFAULT false,
  ordered_as_shipment UUID REFERENCES shipments(id),
  client_email TEXT,
  client_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Enums**:
- `freight_quote_status`: received, in_progress, sent_to_client, accepted, refused

**RLS Policies**:
- Les utilisateurs peuvent voir leurs propres devis (par email ou client_id)
- Création publique autorisée
- Mise à jour réservée aux admins

#### **subscriptions**
Abonnements des clients.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client UUID REFERENCES clients(id) NOT NULL,
  plan_type plan_type NOT NULL,
  status TEXT DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  payment_provider TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Enums**:
- `plan_type`: basic, premium_tracking, enterprise_logistics, agent_listing

**Plans disponibles**:
- **Basic**: Gratuit, accès limité
- **Premium Tracking**: Suivi complet des expéditions
- **Enterprise Logistics**: Portail digital complet
- **Agent Listing**: Référencement agent

**RLS Policies**:
- Les clients peuvent voir uniquement leurs propres abonnements
- Mise à jour réservée aux admins

#### **shipments**
Expéditions en cours.

```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT UNIQUE NOT NULL,
  client UUID REFERENCES clients(id) NOT NULL,
  origin_port UUID REFERENCES ports(id) NOT NULL,
  destination_port UUID REFERENCES ports(id) NOT NULL,
  cargo_type TEXT,
  container_type container_type,
  incoterm TEXT,
  current_status shipment_status DEFAULT 'draft',
  eta TIMESTAMPTZ,
  etd TIMESTAMPTZ,
  last_update TIMESTAMPTZ,
  internal_notes TEXT,
  client_visible_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Enums**:
- `shipment_status`: draft, quote_pending, confirmed, in_transit, at_port, delivered, on_hold, cancelled
- `container_type`: FCL_20DC, FCL_40DC, FCL_40HC, LCL, BULK, RORO, OTHER

**RLS Policies**:
- Les clients peuvent voir uniquement leurs propres expéditions
- Mise à jour réservée aux admins

#### **email_notifications**
File d'attente des emails.

```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Types d'emails**:
- `shipment_created`: Création d'expédition
- `shipment_status_changed`: Changement de statut
- `agent_validated`: Validation d'agent
- `subscription_expiring`: Expiration imminente
- `subscription_expired`: Abonnement expiré
- `quote_received`: Devis reçu
- `quote_sent`: Devis envoyé

**RLS Policies**:
- Accès réservé au service role

---

## 3. Edge Functions Supabase

### 3.1 Liste des Edge Functions

#### **submit-agent-application**
Soumet une candidature d'agent.

**Endpoint**: `/functions/v1/submit-agent-application`  
**Méthode**: POST  
**Authentification**: Non requise

**Payload**:
```json
{
  "company_name": "string",
  "port_id": "uuid",
  "activities": ["string"],
  "years_experience": "number",
  "whatsapp": "string",
  "email": "string",
  "website": "string",
  "certifications": "string"
}
```

**Actions**:
1. Valide les données
2. Insère dans `global_agents` avec status='pending'
3. Appelle `notify-agent-application`

#### **notify-agent-application**
Envoie une notification email pour une nouvelle candidature.

**Endpoint**: `/functions/v1/notify-agent-application`  
**Méthode**: POST  
**Authentification**: Requise (service role)

**Payload**:
```json
{
  "agent_id": "uuid"
}
```

**Actions**:
1. Récupère les détails de l'agent
2. Crée une notification email dans `email_notifications`
3. Envoie l'email aux admins

#### **send-freight-quote-emails**
Envoie des emails pour les devis fret.

**Endpoint**: `/functions/v1/send-freight-quote-emails`  
**Méthode**: POST  
**Authentification**: Requise

**Payload**:
```json
{
  "quote_id": "uuid",
  "email_type": "quote_received | quote_sent"
}
```

**Actions**:
1. Récupère les détails du devis
2. Crée une notification email
3. Envoie l'email au client et/ou aux admins

#### **confirm-quote-payment**
Confirme le paiement d'un devis et crée l'expédition.

**Endpoint**: `/functions/v1/confirm-quote-payment`  
**Méthode**: POST  
**Authentification**: Requise

**Payload**:
```json
{
  "quote_id": "uuid"
}
```

**Actions**:
1. Vérifie que le devis existe et est accepté
2. Met à jour `payment_status` = 'paid'
3. Crée un `shipment` avec un tracking number unique
4. Lie le shipment au devis
5. Envoie un email de confirmation

#### **process-email-notifications**
Traite la file d'attente des emails (job planifié).

**Endpoint**: `/functions/v1/process-email-notifications`  
**Méthode**: POST  
**Authentification**: Requise (service role)  
**Planification**: Toutes les 5 minutes via pg_cron

**Actions**:
1. Récupère les emails en attente (status='pending')
2. Envoie chaque email via le service d'email
3. Met à jour le statut (sent/failed)
4. Log les erreurs

---

## 4. Flux de Données Critiques

### 4.1 Flux d'Authentification

```
1. Utilisateur → signUp(email, password, metadata)
   ↓
2. Supabase Auth → Crée user dans auth.users
   ↓
3. Database Trigger → Crée client dans clients
   ↓
4. Email de confirmation → Envoyé à l'utilisateur
   ↓
5. Utilisateur confirme → Compte activé
   ↓
6. signIn(email, password) → Session créée
   ↓
7. AuthContext → Charge client + session
```

### 4.2 Flux de Demande de Devis

```
1. Client → Remplit formulaire freight-quote
   ↓
2. Validation côté client → validation.ts
   ↓
3. Insertion dans freight_quotes → status='received'
   ↓
4. Edge Function → send-freight-quote-emails
   ↓
5. Email → Envoyé au client + admins
   ↓
6. Admin → Met à jour le devis (montant, status)
   ↓
7. Email → Devis envoyé au client
   ↓
8. Client → Accepte ou refuse
   ↓
9. Si accepté + paiement → confirm-quote-payment
   ↓
10. Création shipment → Tracking number généré
```

### 4.3 Flux de Candidature Agent

```
1. Entreprise → Remplit formulaire become-agent
   ↓
2. Validation → validation.ts
   ↓
3. Edge Function → submit-agent-application
   ↓
4. Insertion dans global_agents → status='pending'
   ↓
5. Edge Function → notify-agent-application
   ↓
6. Email → Envoyé aux admins
   ↓
7. Admin → Valide ou rejette (admin-dashboard)
   ↓
8. Mise à jour status → 'validated' ou 'rejected'
   ↓
9. Email → Notification à l'agent
   ↓
10. Si validé → Apparaît dans port-coverage
```

### 4.4 Flux d'Abonnement

```
1. Client → Sélectionne un plan (pricing)
   ↓
2. Redirection → subscription-confirm
   ↓
3. Confirmation → Crée subscription (status='pending')
   ↓
4. Paiement simulé → Met à jour status='active', is_active=true
   ↓
5. useSubscriptionAccess → Charge l'abonnement actif
   ↓
6. Accès conditionnel → Portail digital / Tracking complet
   ↓
7. Job quotidien → Vérifie les expirations
   ↓
8. Si expiré → is_active=false, email de notification
```

### 4.5 Flux de Suivi d'Expédition

```
1. Client → Accède à client-dashboard
   ↓
2. useSubscriptionAccess → Vérifie les droits
   ↓
3. Si accès limité → Affiche badge "Passez à Premium"
   ↓
4. Si accès complet → Affiche détails complets
   ↓
5. Clic sur shipment → shipment-detail
   ↓
6. Affiche tracking complet → Statut, ETA, notes
   ↓
7. Admin met à jour statut → Notification email automatique
```

---

## 5. Sécurité et Permissions

### 5.1 Row Level Security (RLS)

**Toutes les tables ont RLS activé**.

**Politiques par table**:

| Table | Lecture | Écriture |
|-------|---------|----------|
| clients | Propre profil uniquement | Propre profil uniquement |
| ports | Public | Authentifié |
| services_global | Public (actifs) | Admin |
| global_agents | Public (validés) | Admin |
| freight_quotes | Par email ou client_id | Admin |
| subscriptions | Propre abonnement | Admin |
| shipments | Propre expédition | Admin |
| email_notifications | Service role | Service role |

### 5.2 Validation des Données

**Côté client** (`utils/validation.ts`):
- Email format
- Téléphone international
- Longueurs min/max
- Champs requis
- Formats de dates

**Côté serveur** (Edge Functions):
- Validation des UUIDs
- Vérification d'existence des références
- Sanitization des inputs
- Détection d'injections SQL

### 5.3 Sanitization

**Utilisation de** `utils/security.ts`:
- `sanitizeInput()`: Nettoie les entrées utilisateur
- `sanitizeHtml()`: Prévient les attaques XSS
- `detectSqlInjection()`: Détecte les tentatives d'injection
- `maskEmail()` / `maskPhone()`: Masque les données sensibles

---

## 6. Gestion des États

### 6.1 Contexts React

#### **AuthContext**
Gère l'authentification et le profil client.

**État**:
- `session`: Session Supabase
- `user`: Utilisateur authentifié
- `client`: Profil client
- `loading`: État de chargement

**Méthodes**:
- `signIn(email, password)`
- `signUp(email, password, metadata)`
- `signOut()`
- `refreshClient()`

#### **LanguageContext**
Gère le multilingue.

**État**:
- `language`: Langue actuelle (fr, en, es, ar)
- `t`: Fonction de traduction

**Méthodes**:
- `setLanguage(lang)`

### 6.2 Custom Hooks

#### **useClient**
Gère les opérations sur le profil client.

**Retour**:
- `client`: Profil client
- `loading`: État de chargement
- `error`: Erreur éventuelle
- `updateClient(updates)`: Met à jour le profil
- `refreshClient()`: Recharge le profil

#### **useSubscriptionAccess**
Vérifie les droits d'accès basés sur l'abonnement.

**Retour**:
- `hasActiveSubscription`: Boolean
- `hasPremiumTracking`: Boolean
- `hasEnterpriseLogistics`: Boolean
- `hasDigitalPortalAccess`: Boolean
- `hasFullTrackingAccess`: Boolean
- `subscription`: Abonnement actif
- `loading`: État de chargement
- `refresh()`: Recharge l'abonnement

---

## 7. Utilitaires et Helpers

### 7.1 Constants (`utils/constants.ts`)

**Couleurs de statuts**:
```typescript
export const STATUS_COLORS = {
  received: '#666666',
  in_progress: '#03A9F4',
  sent_to_client: '#f59e0b',
  accepted: '#10b981',
  refused: '#ef4444',
  // ... etc
};
```

**Types de statuts**:
- Shipment statuses
- Agent statuses
- Freight quote statuses
- Subscription statuses
- Payment statuses

**Limites de validation**:
```typescript
export const VALIDATION_LIMITS = {
  companyName: { min: 2, max: 200 },
  contactName: { min: 2, max: 100 },
  email: { max: 255 },
  phone: { min: 8, max: 20 },
  // ... etc
};
```

### 7.2 Formatters (`utils/formatters.ts`)

**Fonctions disponibles**:
- `formatDate(date, locale)`: Formate une date
- `formatDateTime(date, locale)`: Formate date + heure
- `formatRelativeTime(date, locale)`: "Il y a 2 heures"
- `formatCurrency(amount, currency, locale)`: "1 234,56 €"
- `formatNumber(number, locale)`: "1 234 567"
- `formatPhoneNumber(phone)`: "+33 6 12 34 56 78"
- `formatStatus(status)`: "In Progress"
- `formatPlanType(planType)`: "Premium Tracking"
- `truncateText(text, maxLength)`: "Lorem ipsum..."
- `formatFileSize(bytes)`: "1.5 MB"
- `formatPercentage(value)`: "75%"
- `formatTrackingNumber(trackingNumber)`: "USS-2025-001234"

### 7.3 Validation (`utils/validation.ts`)

**Validateurs disponibles**:
- `validateEmail(email)`: Valide un email
- `validatePhone(phone)`: Valide un téléphone
- `validateUrl(url)`: Valide une URL
- `validateRequired(value, fieldName)`: Champ requis
- `validateMinLength(value, minLength, fieldName)`: Longueur min
- `validateMaxLength(value, maxLength, fieldName)`: Longueur max
- `validateNumberRange(value, min, max, fieldName)`: Plage numérique
- `validateArray(array, fieldName)`: Tableau non vide
- `validatePassword(password)`: Force du mot de passe
- `validateTrackingNumber(trackingNumber)`: Format tracking
- `validateDate(date)`: Date valide
- `validateFutureDate(date)`: Date future
- `validatePastDate(date)`: Date passée
- `validateComposite(value, validators)`: Validations multiples

### 7.4 Security (`utils/security.ts`)

**Fonctions de sécurité**:
- `sanitizeInput(input)`: Nettoie une entrée
- `sanitizeHtml(html)`: Nettoie du HTML
- `isAdmin(client)`: Vérifie les droits admin
- `canAccessResource(userId, resourceOwnerId)`: Vérifie la propriété
- `maskEmail(email)`: Masque un email
- `maskPhone(phone)`: Masque un téléphone
- `generateSecureToken(length)`: Génère un token
- `detectSqlInjection(input)`: Détecte les injections SQL
- `sanitizeUrl(url)`: Nettoie une URL
- `rateLimit(key, maxRequests, windowMs)`: Rate limiting
- `detectPII(text)`: Détecte les données personnelles

### 7.5 Data Integrity (`utils/dataIntegrity.ts`)

**Fonctions d'intégrité**:
- `checkClientExists(clientId)`: Vérifie l'existence d'un client
- `checkPortExists(portId)`: Vérifie l'existence d'un port
- `checkShipmentExists(shipmentId)`: Vérifie l'existence d'une expédition
- `validateTrackingNumberUnique(trackingNumber)`: Vérifie l'unicité
- `checkShipmentOwnership(shipmentId, clientId)`: Vérifie la propriété
- `checkSubscriptionOwnership(subscriptionId, clientId)`: Vérifie la propriété
- `findOrphanedRecords(tableName, foreignKey)`: Trouve les enregistrements orphelins
- `validateForeignKey(tableName, columnName, value)`: Valide une clé étrangère
- `checkClientDataConsistency(clientId)`: Vérifie la cohérence
- `generateUniqueTrackingNumber()`: Génère un tracking number unique

---

## 8. Composants Réutilisables

### 8.1 ErrorBoundary

Capture les erreurs React et affiche un écran de secours.

**Props**:
- `children`: Composants enfants
- `fallback`: Composant de secours (optionnel)

**Utilisation**:
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 8.2 LoadingSpinner

Affiche un indicateur de chargement.

**Props**:
- `size`: 'small' | 'large'
- `color`: Couleur du spinner
- `message`: Message optionnel

**Utilisation**:
```tsx
<LoadingSpinner size="large" message="Chargement..." />
```

### 8.3 EmptyState

Affiche un état vide avec icône et message.

**Props**:
- `icon`: Nom de l'icône
- `title`: Titre
- `message`: Message
- `actionLabel`: Label du bouton (optionnel)
- `onAction`: Callback du bouton (optionnel)

**Utilisation**:
```tsx
<EmptyState
  icon="inbox"
  title="Aucun résultat"
  message="Aucune donnée disponible"
  actionLabel="Actualiser"
  onAction={refresh}
/>
```

### 8.4 FloatingTabBar

Barre de navigation flottante personnalisée.

**Props**:
- `tabs`: Tableau de TabBarItem
- `containerWidth`: Largeur du conteneur

**Utilisation**:
```tsx
<FloatingTabBar
  tabs={[
    { name: 'home', route: '/home', icon: 'home', label: 'Accueil' },
    // ...
  ]}
  containerWidth={420}
/>
```

### 8.5 IconSymbol

Icône multi-plateforme (iOS SF Symbols + Android Material Icons).

**Props**:
- `ios_icon_name`: Nom de l'icône iOS
- `android_material_icon_name`: Nom de l'icône Android
- `size`: Taille
- `color`: Couleur

**Utilisation**:
```tsx
<IconSymbol
  ios_icon_name="house.fill"
  android_material_icon_name="home"
  size={24}
  color={colors.primary}
/>
```

---

## 9. Multilingue

### 9.1 Langues Supportées

- **Français (FR)**: Langue par défaut
- **Anglais (EN)**: Traduction complète
- **Espagnol (ES)**: Traduction partielle
- **Arabe (AR)**: Traduction partielle

### 9.2 Structure des Traductions

Fichier: `i18n/translations.ts`

```typescript
export const translations = {
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      // ...
    },
    globalServices: {
      title: 'Services Globaux',
      // ...
    },
    // ...
  },
  en: {
    // ...
  },
  // ...
};
```

### 9.3 Utilisation

```tsx
const { t, language, setLanguage } = useLanguage();

<Text>{t.common.loading}</Text>
<Text>{t.globalServices.title}</Text>
```

---

## 10. Styles et Thèmes

### 10.1 Palette de Couleurs

```typescript
export const colors = {
  primary: '#03A9F4',      // Bleu principal
  secondary: '#FF5722',    // Orange secondaire
  accent: '#FF9800',       // Orange accent
  success: '#4CAF50',      // Vert succès
  error: '#F44336',        // Rouge erreur
  warning: '#FFC107',      // Jaune avertissement
  background: '#FFFFFF',   // Fond clair
  backgroundDark: '#121212', // Fond sombre
  card: '#F5F5F5',         // Carte claire
  cardDark: '#1E1E1E',     // Carte sombre
  text: '#000000',         // Texte clair
  textDark: '#FFFFFF',     // Texte sombre
  textSecondary: '#666666', // Texte secondaire clair
  textSecondaryDark: '#B0B0B0', // Texte secondaire sombre
  border: '#E0E0E0',       // Bordure claire
  borderDark: '#333333',   // Bordure sombre
};
```

### 10.2 Hook useColors

```tsx
const colors = useColors();
// Retourne les couleurs adaptées au thème (clair/sombre)
```

### 10.3 Support Dark Mode

L'application supporte automatiquement le mode sombre via:
- `useColorScheme()` de React Native
- `useTheme()` de React Navigation
- `useColors()` pour les couleurs dynamiques

---

## 11. Performance et Optimisation

### 11.1 Optimisations Implémentées

**React**:
- `useCallback` pour mémoriser les fonctions
- `useMemo` pour mémoriser les calculs coûteux
- Lazy loading des composants
- Éviter les re-renders inutiles

**Supabase**:
- Requêtes optimisées avec `select()` spécifique
- Utilisation de `limit()` pour paginer
- Index sur les colonnes fréquemment requêtées
- RLS pour filtrer côté serveur

**Images**:
- Utilisation d'images optimisées
- Lazy loading des images
- Compression des assets

### 11.2 Métriques de Performance

**Temps de chargement cibles**:
- Écran d'accueil: < 1s
- Dashboard client: < 2s
- Liste de shipments: < 1.5s
- Détail shipment: < 1s

**Taille du bundle**:
- Bundle JS: < 5 MB
- Assets: < 10 MB
- Total: < 15 MB

---

## 12. Tests et Qualité

### 12.1 Types de Tests Recommandés

**Tests unitaires**:
- Fonctions de validation
- Fonctions de formatage
- Fonctions de sécurité
- Hooks personnalisés

**Tests d'intégration**:
- Flux d'authentification
- Flux de demande de devis
- Flux de candidature agent
- Flux d'abonnement

**Tests E2E**:
- Parcours utilisateur complet
- Création de compte
- Demande de devis
- Suivi d'expédition

### 12.2 Outils Recommandés

- **Jest**: Tests unitaires
- **React Native Testing Library**: Tests de composants
- **Detox**: Tests E2E
- **ESLint**: Linting
- **TypeScript**: Type checking

---

## 13. Déploiement et CI/CD

### 13.1 Environnements

**Développement**:
- Supabase: Projet de développement
- Expo: Mode développement
- Hot reload activé

**Production**:
- Supabase: Projet de production
- Expo: Build de production
- Optimisations activées

### 13.2 Build et Déploiement

**Web**:
```bash
npm run build:web
```

**Android**:
```bash
npm run build:android
```

**iOS**:
```bash
eas build --platform ios
```

### 13.3 Variables d'Environnement

**Supabase**:
- `SUPABASE_URL`: URL du projet
- `SUPABASE_ANON_KEY`: Clé anonyme
- `SUPABASE_SERVICE_ROLE_KEY`: Clé service (Edge Functions)

**Email**:
- `EMAIL_SERVICE_API_KEY`: Clé API du service d'email
- `EMAIL_FROM`: Email expéditeur
- `EMAIL_ADMIN`: Email admin

---

## 14. Monitoring et Logs

### 14.1 Logging

**Côté client**:
- `console.log()` pour le développement
- `errorLogger.ts` pour les erreurs en production

**Côté serveur**:
- Logs Supabase pour les Edge Functions
- Logs de la base de données

### 14.2 Métriques à Surveiller

**Application**:
- Temps de chargement des écrans
- Taux d'erreur
- Taux de conversion (devis → commande)
- Taux d'activation des abonnements

**Base de données**:
- Nombre de requêtes
- Temps de réponse
- Taille de la base
- Nombre d'utilisateurs actifs

**Edge Functions**:
- Nombre d'invocations
- Temps d'exécution
- Taux d'erreur
- Coût

---

## 15. Maintenance et Évolution

### 15.1 Tâches de Maintenance Régulières

**Quotidien**:
- Vérifier les logs d'erreur
- Traiter les demandes de devis
- Valider les candidatures d'agents

**Hebdomadaire**:
- Vérifier les performances
- Analyser les métriques
- Mettre à jour les dépendances

**Mensuel**:
- Nettoyer les données obsolètes
- Optimiser les requêtes lentes
- Réviser les politiques RLS

### 15.2 Roadmap Future

**Court terme** (1-3 mois):
- Intégration paiement réel (Stripe)
- Notifications push
- Tests automatisés
- Amélioration du tracking en temps réel

**Moyen terme** (3-6 mois):
- Application mobile native
- Optimisation des routes IA
- Analytics avancés
- API publique

**Long terme** (6-12 mois):
- Blockchain pour le tracking
- IoT pour le suivi en temps réel
- Marketplace de services
- Expansion internationale

---

## 16. Support et Documentation

### 16.1 Documentation Disponible

- `ARCHITECTURE_COMPLETE.md`: Ce document
- `CONSOLIDATION_SUMMARY.md`: Résumé de la consolidation
- `DEVELOPER_GUIDE.md`: Guide développeur
- `EMAIL_SERVICE_INTEGRATION_GUIDE.md`: Intégration email
- `SUBSCRIPTION_ACCESS_CONTROL.md`: Contrôle d'accès
- `ADMIN_PANEL_IMPLEMENTATION.md`: Panneau admin
- `AUTOMATION_IMPLEMENTATION_SUMMARY.md`: Automatisations

### 16.2 Contact et Support

**Équipe technique**:
- Email: dev@universalshipping.com
- Slack: #dev-3s-global

**Support utilisateur**:
- Email: support@universalshipping.com
- Téléphone: +33 1 23 45 67 89

---

## 17. Conclusion

Cette architecture complète assure:

✅ **Solidité**: RLS, validation, intégrité des données  
✅ **Scalabilité**: Structure modulaire, optimisations  
✅ **Maintenabilité**: Code organisé, documentation complète  
✅ **Sécurité**: Sanitization, authentification, permissions  
✅ **Performance**: Requêtes optimisées, caching, lazy loading  
✅ **Expérience utilisateur**: UI/UX cohérente, multilingue, responsive  

L'application est prête pour la production et l'évolution future.

---

**Dernière mise à jour**: Janvier 2025  
**Version**: 1.0.0  
**Auteur**: Équipe 3S Global
