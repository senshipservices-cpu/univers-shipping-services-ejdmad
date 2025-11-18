
# Quick Reference - UNIVERSAL SHIPPING SERVICES

Guide de référence rapide pour les commandes et opérations courantes.

---

## 🚀 Commandes de Développement

### Démarrage

```bash
# Démarrer l'application en mode développement
npm run dev

# Démarrer avec tunnel (pour tester sur device physique)
npm run dev -- --tunnel

# Démarrer sur iOS
npm run ios

# Démarrer sur Android
npm run android

# Démarrer sur Web
npm run web
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

### Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --coverage

# Tests en mode watch
npm test -- --watch

# Tests E2E iOS
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug

# Tests E2E Android
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug
```

### Linting

```bash
# Linter
npm run lint

# Fix automatique
npm run lint -- --fix
```

---

## 🗄️ Commandes Supabase

### Connexion

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref lnfsjpuffrcyenuuoxxk
```

### Base de Données

```bash
# Lister les tables
supabase db list

# Exécuter une migration
supabase db push

# Créer une migration
supabase migration new migration_name

# Réinitialiser la base de données locale
supabase db reset
```

### Edge Functions

```bash
# Lister les Edge Functions
supabase functions list

# Déployer toutes les Edge Functions
supabase functions deploy

# Déployer une fonction spécifique
supabase functions deploy submit-agent-application

# Voir les logs d'une fonction
supabase functions logs submit-agent-application

# Tester une fonction localement
supabase functions serve submit-agent-application
```

### Logs

```bash
# Logs de la base de données
supabase logs db

# Logs d'authentification
supabase logs auth

# Logs d'une Edge Function
supabase functions logs submit-agent-application
```

---

## 📊 Requêtes SQL Utiles

### Vérifier les Données

```sql
-- Nombre de clients
SELECT COUNT(*) FROM clients;

-- Nombre de ports
SELECT COUNT(*) FROM ports;

-- Nombre de services actifs
SELECT COUNT(*) FROM services_global WHERE is_active = true;

-- Nombre d'agents par statut
SELECT status, COUNT(*) FROM global_agents GROUP BY status;

-- Nombre de devis par statut
SELECT status, COUNT(*) FROM freight_quotes GROUP BY status;

-- Nombre d'abonnements actifs
SELECT COUNT(*) FROM subscriptions WHERE is_active = true;

-- Nombre de shipments par statut
SELECT current_status, COUNT(*) FROM shipments GROUP BY current_status;
```

### Vérifier les RLS Policies

```sql
-- Lister toutes les politiques RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier si RLS est activé sur une table
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'clients';
```

### Requêtes de Monitoring

```sql
-- Requêtes les plus lentes
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Taille de la base de données
SELECT
  pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Taille des tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Nombre de connexions actives
SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';
```

### Nettoyage

```sql
-- Supprimer les emails envoyés de plus de 30 jours
DELETE FROM email_notifications
WHERE sent_at < NOW() - INTERVAL '30 days'
  AND status = 'sent';

-- Supprimer les devis refusés de plus de 90 jours
DELETE FROM freight_quotes
WHERE status = 'refused'
  AND created_at < NOW() - INTERVAL '90 days';

-- Supprimer les agents rejetés de plus de 90 jours
DELETE FROM global_agents
WHERE status = 'rejected'
  AND created_at < NOW() - INTERVAL '90 days';
```

---

## 🔧 Commandes Git

### Workflow Standard

```bash
# Créer une nouvelle branche
git checkout -b feature/nom-de-la-feature

# Ajouter les changements
git add .

# Commit
git commit -m "feat: description de la feature"

# Push
git push origin feature/nom-de-la-feature

# Créer une Pull Request sur GitHub
```

### Conventions de Commit

```bash
# Feature
git commit -m "feat: add new feature"

# Bug fix
git commit -m "fix: fix bug in component"

# Documentation
git commit -m "docs: update README"

# Style
git commit -m "style: format code"

# Refactor
git commit -m "refactor: refactor component"

# Test
git commit -m "test: add tests for component"

# Chore
git commit -m "chore: update dependencies"
```

---

## 📱 Commandes Expo

### Développement

```bash
# Démarrer Expo
expo start

# Démarrer avec tunnel
expo start --tunnel

# Démarrer sur iOS
expo start --ios

# Démarrer sur Android
expo start --android

# Démarrer sur Web
expo start --web

# Nettoyer le cache
expo start --clear
```

### Build

```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Build tous les platforms
eas build --platform all

# Build en mode développement
eas build --profile development --platform ios
```

### Submit

```bash
# Submit iOS
eas submit --platform ios

# Submit Android
eas submit --platform android
```

---

## 🔍 Debugging

### Logs

```bash
# Logs React Native
npx react-native log-ios
npx react-native log-android

# Logs Expo
expo start --dev-client

# Logs Supabase Edge Functions
supabase functions logs function-name --follow
```

### Outils

```bash
# React Native Debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# Flipper
open /Applications/Flipper.app

# Chrome DevTools
# Ouvrir chrome://inspect dans Chrome
```

---

## 📦 Gestion des Dépendances

### Installation

```bash
# Installer une dépendance
npm install package-name

# Installer une dépendance de développement
npm install --save-dev package-name

# Installer toutes les dépendances
npm install
```

### Mise à Jour

```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour une dépendance
npm update package-name

# Mettre à jour toutes les dépendances
npm update

# Mettre à jour Expo
expo upgrade
```

### Nettoyage

```bash
# Nettoyer node_modules
rm -rf node_modules
npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer le cache Expo
expo start --clear
```

---

## 🔐 Sécurité

### Vérifier les Vulnérabilités

```bash
# Audit npm
npm audit

# Fix automatique
npm audit fix

# Fix avec breaking changes
npm audit fix --force
```

### Variables d'Environnement

```bash
# Créer un fichier .env
cp .env.example .env

# Éditer le fichier .env
nano .env

# Ne jamais commit le fichier .env
echo ".env" >> .gitignore
```

---

## 📊 Monitoring

### Sentry

```bash
# Installer Sentry
npm install @sentry/react-native

# Configurer Sentry
npx @sentry/wizard -i reactNative

# Upload source maps
sentry-cli releases files VERSION upload-sourcemaps ./dist
```

### Logs

```bash
# Voir les logs en temps réel
tail -f logs/app.log

# Rechercher dans les logs
grep "ERROR" logs/app.log

# Compter les erreurs
grep -c "ERROR" logs/app.log
```

---

## 🚀 Déploiement

### Web

```bash
# Build
npm run build:web

# Déployer sur Vercel
vercel deploy

# Déployer sur Netlify
netlify deploy

# Déployer sur Firebase
firebase deploy
```

### Mobile

```bash
# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Submit iOS
eas submit --platform ios

# Submit Android
eas submit --platform android
```

---

## 📚 Documentation

### Générer la Documentation

```bash
# TypeDoc
npx typedoc --out docs/api src

# JSDoc
npx jsdoc -c jsdoc.json
```

### Lire la Documentation

```bash
# Ouvrir la documentation
open docs/ARCHITECTURE_COMPLETE.md
open docs/TESTING_GUIDE.md
open docs/MONITORING_GUIDE.md
```

---

## 🆘 Aide

### Commandes d'Aide

```bash
# Aide npm
npm help

# Aide Expo
expo --help

# Aide Supabase
supabase --help

# Aide EAS
eas --help
```

### Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)

---

## 🔗 Liens Utiles

### Dashboards

- [Supabase Dashboard](https://app.supabase.com/project/lnfsjpuffrcyenuuoxxk)
- [Expo Dashboard](https://expo.dev/)
- [Sentry Dashboard](https://sentry.io/)

### Repositories

- [GitHub Repository](https://github.com/universalshipping/3s-global)
- [Documentation](https://github.com/universalshipping/3s-global/tree/main/docs)

### Support

- Email: dev@universalshipping.com
- Slack: #dev-3s-global

---

**Dernière mise à jour**: Janvier 2025  
**Version**: 1.0.0
