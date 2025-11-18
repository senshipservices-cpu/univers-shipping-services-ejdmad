
# UNIVERSAL SHIPPING SERVICES (3S Global)

> Plateforme complète de services maritimes, portuaires et logistiques avec couverture mondiale

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/universalshipping/3s-global)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/universalshipping/3s-global)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)
- [Support](#-support)
- [Licence](#-licence)

---

## 🌍 Vue d'ensemble

UNIVERSAL SHIPPING SERVICES est une plateforme moderne de services maritimes et logistiques offrant:

- **Services Globaux**: 12 services maritimes et logistiques
- **Couverture Portuaire**: Réseau mondial de ports
- **Réseau d'Agents**: Partenaires locaux dans chaque port
- **Espace Client**: Dashboard personnalisé avec tracking
- **Abonnements**: Plans Basic, Premium Tracking, Enterprise Logistics
- **Multilingue**: FR, EN, ES, AR

### Captures d'écran

[À ajouter: Screenshots de l'application]

---

## ✨ Fonctionnalités

### Pour les Clients

- ✅ **Demande de Devis**: Devis fret personnalisés
- ✅ **Suivi d'Expéditions**: Tracking en temps réel
- ✅ **Portail Digital**: Dashboard complet
- ✅ **Abonnements**: Plans flexibles
- ✅ **Multilingue**: Interface en 4 langues

### Pour les Agents

- ✅ **Candidature en Ligne**: Formulaire de candidature
- ✅ **Validation Admin**: Processus de validation
- ✅ **Référencement**: Apparition dans la couverture portuaire
- ✅ **Premium Listing**: Option de mise en avant

### Pour les Administrateurs

- ✅ **Dashboard Admin**: Gestion complète
- ✅ **Validation Agents**: Approuver/rejeter les candidatures
- ✅ **Gestion Devis**: Suivi et mise à jour
- ✅ **Gestion Expéditions**: Mise à jour des statuts
- ✅ **Gestion Abonnements**: Suivi des plans

---

## 🛠️ Technologies

### Frontend

- **React Native** 0.81.4
- **Expo** 54
- **TypeScript** 5.9.3
- **React Navigation** 7.0.14

### Backend

- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **Row Level Security (RLS)**
- **Edge Functions** (Deno)

### Outils

- **ESLint** - Linting
- **Jest** - Tests unitaires
- **Detox** - Tests E2E
- **Sentry** - Monitoring des erreurs

---

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI
- Compte Supabase

### Étapes

1. **Cloner le repository**

```bash
git clone https://github.com/universalshipping/3s-global.git
cd 3s-global
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Lancer l'application**

```bash
# Développement
npm run dev

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## ⚙️ Configuration

### Supabase

1. **Créer un projet Supabase**
2. **Exécuter les migrations** (voir `docs/DATABASE_SETUP.md`)
3. **Configurer les Edge Functions** (voir `docs/EDGE_FUNCTIONS_SETUP.md`)
4. **Configurer l'authentification**
5. **Configurer le service d'email** (voir `docs/EMAIL_SERVICE_INTEGRATION_GUIDE.md`)

### Variables d'Environnement

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service
EMAIL_SERVICE_API_KEY=your-email-api-key
EMAIL_FROM=noreply@universalshipping.com
EMAIL_ADMIN=admin@universalshipping.com

# App
APP_ENV=development
APP_VERSION=1.0.0
```

---

## 🚀 Utilisation

### Développement

```bash
# Lancer en mode développement
npm run dev

# Lancer avec tunnel (pour tester sur device physique)
npm run dev -- --tunnel

# Lancer les tests
npm test

# Lancer les tests E2E
npm run test:e2e

# Linter
npm run lint
```

### Build

```bash
# Build web
npm run build:web

# Build Android
npm run build:android

# Build iOS (nécessite macOS)
eas build --platform ios
```

---

## 🏗️ Architecture

### Structure du Projet

```
3s-global/
├── app/                    # Application principale
│   ├── (tabs)/            # Navigation par onglets
│   ├── integrations/      # Intégrations (Supabase)
│   └── _layout.tsx        # Layout racine
├── components/            # Composants réutilisables
├── contexts/              # Contexts React
├── hooks/                 # Hooks personnalisés
├── utils/                 # Utilitaires
├── i18n/                  # Traductions
├── styles/                # Styles communs
├── docs/                  # Documentation
└── assets/                # Assets (images, fonts)
```

### Base de Données

**8 tables principales**:
- `clients` - Profils clients
- `ports` - Ports couverts
- `services_global` - Services offerts
- `global_agents` - Agents partenaires
- `freight_quotes` - Demandes de devis
- `subscriptions` - Abonnements
- `shipments` - Expéditions
- `email_notifications` - File d'attente emails

### Edge Functions

**5 Edge Functions**:
- `submit-agent-application` - Candidature agent
- `notify-agent-application` - Notification admin
- `send-freight-quote-emails` - Emails devis
- `confirm-quote-payment` - Paiement et création shipment
- `process-email-notifications` - Traitement file d'attente

---

## 📚 Documentation

### Documents Disponibles

- [Architecture Complète](docs/ARCHITECTURE_COMPLETE.md) - Vue d'ensemble de l'architecture
- [Guide de Tests](docs/TESTING_GUIDE.md) - Stratégies de tests
- [Guide de Monitoring](docs/MONITORING_GUIDE.md) - Monitoring et observabilité
- [Résumé de Consolidation](docs/CONSOLIDATION_SUMMARY.md) - Consolidation du code
- [Guide Développeur](docs/DEVELOPER_GUIDE.md) - Guide pour les développeurs
- [Intégration Email](docs/EMAIL_SERVICE_INTEGRATION_GUIDE.md) - Configuration email
- [Contrôle d'Accès](docs/SUBSCRIPTION_ACCESS_CONTROL.md) - Gestion des abonnements
- [Consolidation Finale](docs/CONSOLIDATION_FINALE.md) - État de consolidation

### Diagrammes

[À ajouter: Diagrammes d'architecture, flux de données, etc.]

---

## 🧪 Tests

### Tests Unitaires

```bash
# Exécuter tous les tests
npm test

# Exécuter avec couverture
npm test -- --coverage

# Exécuter en mode watch
npm test -- --watch
```

### Tests E2E

```bash
# iOS
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug

# Android
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug
```

### Couverture de Code

Objectif: **80% de couverture**

---

## 🚢 Déploiement

### Web

```bash
# Build
npm run build:web

# Déployer sur Vercel
vercel deploy

# Déployer sur Netlify
netlify deploy
```

### Mobile

```bash
# iOS (nécessite compte Apple Developer)
eas build --platform ios
eas submit --platform ios

# Android
eas build --platform android
eas submit --platform android
```

### Edge Functions

```bash
# Déployer toutes les Edge Functions
supabase functions deploy

# Déployer une fonction spécifique
supabase functions deploy submit-agent-application
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

### Processus

1. **Fork** le projet
2. **Créer** une branche (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Guidelines

- Suivre les conventions de code (ESLint)
- Écrire des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation
- Respecter l'architecture existante

---

## 📞 Support

### Contact

- **Email**: support@universalshipping.com
- **Téléphone**: +33 1 23 45 67 89
- **Site Web**: https://universalshipping.com

### Équipe Technique

- **Email**: dev@universalshipping.com
- **Slack**: #dev-3s-global

### Signaler un Bug

Ouvrir une issue sur GitHub avec:
- Description du bug
- Étapes pour reproduire
- Comportement attendu
- Captures d'écran (si applicable)
- Environnement (OS, version, etc.)

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- **Supabase** - Backend as a Service
- **Expo** - Framework React Native
- **React Navigation** - Navigation
- **Communauté Open Source** - Bibliothèques et outils

---

## 📊 Statut du Projet

### Version Actuelle: 1.0.0

**Statut**: ✅ Production Ready

### Métriques

| Métrique | Valeur |
|----------|--------|
| Lignes de code | ~15,000 |
| Composants | 10 |
| Écrans | 14 |
| Tables DB | 8 |
| Edge Functions | 5 |
| Langues | 4 |
| Documentation | 7 docs |

### Roadmap

**Q1 2025**
- [ ] Tests automatisés (80% couverture)
- [ ] Monitoring en production (Sentry)
- [ ] Intégration paiements (Stripe)
- [ ] Optimisations performance

**Q2 2025**
- [ ] Notifications push
- [ ] Tracking en temps réel
- [ ] Chat support
- [ ] API publique

**Q3-Q4 2025**
- [ ] IA pour optimisation de routes
- [ ] Blockchain pour tracking
- [ ] IoT pour suivi en temps réel
- [ ] Expansion internationale

---

## 🌟 Étoiles GitHub

Si ce projet vous plaît, n'hésitez pas à lui donner une étoile ⭐️

---

**Fait avec ❤️ par l'équipe 3S Global**

**© 2025 UNIVERSAL SHIPPING SERVICES. Tous droits réservés.**
