
# Guide de Monitoring - UNIVERSAL SHIPPING SERVICES

## Vue d'ensemble

Ce guide décrit les stratégies de monitoring et d'observabilité pour l'application UNIVERSAL SHIPPING SERVICES.

---

## 1. Métriques Clés (KPIs)

### 1.1 Métriques Applicatives

#### **Performance**
- **Temps de chargement moyen**: < 2s
- **Temps de réponse API**: < 500ms
- **Taux d'erreur**: < 1%
- **Disponibilité**: > 99.9%

#### **Utilisation**
- **Utilisateurs actifs quotidiens (DAU)**
- **Utilisateurs actifs mensuels (MAU)**
- **Taux de rétention**: > 70% à 30 jours
- **Durée moyenne de session**: > 5 minutes

#### **Business**
- **Nombre de devis créés par jour**
- **Taux de conversion devis → commande**: > 30%
- **Nombre d'abonnements actifs**
- **Taux d'activation des abonnements**: > 50%
- **Nombre d'agents validés**
- **Nombre de shipments en cours**

### 1.2 Métriques Techniques

#### **Base de Données**
- **Nombre de requêtes par seconde**
- **Temps de réponse moyen des requêtes**: < 100ms
- **Taille de la base de données**
- **Nombre de connexions actives**
- **Taux de cache hit**: > 80%

#### **Edge Functions**
- **Nombre d'invocations par fonction**
- **Temps d'exécution moyen**: < 1s
- **Taux d'erreur par fonction**: < 1%
- **Coût par invocation**

#### **Authentification**
- **Nombre de connexions par jour**
- **Nombre d'inscriptions par jour**
- **Taux d'échec de connexion**: < 5%
- **Durée moyenne de session**

---

## 2. Logging

### 2.1 Niveaux de Log

**Hiérarchie**:
1. **ERROR**: Erreurs critiques nécessitant une action immédiate
2. **WARN**: Avertissements, situations anormales mais gérables
3. **INFO**: Informations importantes sur le flux de l'application
4. **DEBUG**: Informations détaillées pour le débogage

### 2.2 Structure des Logs

**Format standard**:
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "ERROR",
  "service": "client-dashboard",
  "message": "Failed to load shipments",
  "error": {
    "code": "PGRST116",
    "message": "No rows found",
    "stack": "..."
  },
  "context": {
    "userId": "uuid",
    "clientId": "uuid",
    "action": "loadShipments"
  }
}
```

### 2.3 Implémentation du Logging

**Fichier**: `utils/logger.ts`

```typescript
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogContext {
  userId?: string;
  clientId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  private log(level: LogLevel, message: string, error?: Error, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
        },
      }),
      ...(context && { context }),
    };

    // En développement: console.log
    if (__DEV__) {
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      // En production: envoyer à un service de logging
      // (Sentry, LogRocket, etc.)
      this.sendToLoggingService(logEntry);
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, error, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, undefined, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }

  private sendToLoggingService(logEntry: any) {
    // Implémenter l'envoi vers Sentry, LogRocket, etc.
    // Exemple avec Sentry:
    // Sentry.captureMessage(logEntry.message, {
    //   level: logEntry.level.toLowerCase(),
    //   extra: logEntry,
    // });
  }
}

export const createLogger = (service: string) => new Logger(service);
```

**Utilisation**:
```typescript
import { createLogger } from '@/utils/logger';

const logger = createLogger('client-dashboard');

try {
  await loadShipments();
  logger.info('Shipments loaded successfully', { count: shipments.length });
} catch (error) {
  logger.error('Failed to load shipments', error as Error, {
    userId: user?.id,
    clientId: client?.id,
  });
}
```

---

## 3. Monitoring des Erreurs

### 3.1 Intégration Sentry

**Installation**:
```bash
npm install @sentry/react-native
```

**Configuration**:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 10000,
});
```

**Capture d'erreurs**:
```typescript
try {
  // Code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'client-dashboard',
      action: 'loadShipments',
    },
    extra: {
      userId: user?.id,
      clientId: client?.id,
    },
  });
}
```

### 3.2 ErrorBoundary avec Sentry

**Fichier**: `components/ErrorBoundary.tsx` (déjà existant)

```typescript
import * as Sentry from '@sentry/react-native';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Envoyer à Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
}
```

---

## 4. Monitoring des Performances

### 4.1 Métriques de Performance

**Temps de chargement des écrans**:
```typescript
import { performance } from 'react-native-performance';

const startTime = performance.now();

// Charger les données
await loadData();

const endTime = performance.now();
const loadTime = endTime - startTime;

logger.info('Screen loaded', {
  screen: 'client-dashboard',
  loadTime: `${loadTime.toFixed(2)}ms`,
});

// Alerter si trop lent
if (loadTime > 2000) {
  logger.warn('Slow screen load', {
    screen: 'client-dashboard',
    loadTime: `${loadTime.toFixed(2)}ms`,
  });
}
```

**Temps de réponse API**:
```typescript
const measureApiCall = async (apiCall: () => Promise<any>, apiName: string) => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    logger.info('API call completed', {
      api: apiName,
      responseTime: `${responseTime.toFixed(2)}ms`,
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    logger.error('API call failed', error as Error, {
      api: apiName,
      responseTime: `${responseTime.toFixed(2)}ms`,
    });
    
    throw error;
  }
};

// Utilisation
const shipments = await measureApiCall(
  () => supabase.from('shipments').select('*'),
  'loadShipments'
);
```

### 4.2 Monitoring des Requêtes Supabase

**Wrapper pour les requêtes**:
```typescript
const monitoredSupabase = {
  from: (table: string) => {
    const startTime = performance.now();
    
    return {
      select: (...args: any[]) => {
        const query = supabase.from(table).select(...args);
        
        return {
          ...query,
          then: async (resolve: any, reject: any) => {
            try {
              const result = await query;
              const endTime = performance.now();
              
              logger.info('Supabase query completed', {
                table,
                operation: 'select',
                responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                rowCount: result.data?.length || 0,
              });
              
              return resolve(result);
            } catch (error) {
              const endTime = performance.now();
              
              logger.error('Supabase query failed', error as Error, {
                table,
                operation: 'select',
                responseTime: `${(endTime - startTime).toFixed(2)}ms`,
              });
              
              return reject(error);
            }
          },
        };
      },
    };
  },
};
```

---

## 5. Monitoring des Edge Functions

### 5.1 Logs Supabase

**Accès aux logs**:
```bash
# Via Supabase CLI
supabase functions logs submit-agent-application

# Via Dashboard Supabase
# Aller dans Functions > [Function Name] > Logs
```

**Structure des logs**:
```typescript
// Dans l'Edge Function
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  function: 'submit-agent-application',
  event: 'start',
  payload: req.body,
}));

// Après traitement
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  function: 'submit-agent-application',
  event: 'success',
  agentId: agent.id,
  duration: `${duration}ms`,
}));

// En cas d'erreur
console.error(JSON.stringify({
  timestamp: new Date().toISOString(),
  function: 'submit-agent-application',
  event: 'error',
  error: error.message,
  stack: error.stack,
}));
```

### 5.2 Métriques des Edge Functions

**Tableau de bord personnalisé**:
```sql
-- Nombre d'invocations par fonction (dernières 24h)
SELECT
  function_name,
  COUNT(*) as invocations,
  AVG(duration_ms) as avg_duration,
  MAX(duration_ms) as max_duration,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
FROM edge_function_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY function_name
ORDER BY invocations DESC;
```

---

## 6. Monitoring de la Base de Données

### 6.1 Métriques Supabase

**Dashboard Supabase**:
- Database > Reports
- Métriques disponibles:
  - Nombre de connexions
  - Requêtes par seconde
  - Temps de réponse
  - Taille de la base
  - Utilisation CPU/RAM

### 6.2 Requêtes Lentes

**Identifier les requêtes lentes**:
```sql
-- Activer pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

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
```

**Optimiser les requêtes**:
```sql
-- Ajouter des index
CREATE INDEX idx_shipments_client ON shipments(client);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_freight_quotes_client_email ON freight_quotes(client_email);
```

### 6.3 Monitoring des RLS Policies

**Vérifier les politiques RLS**:
```sql
-- Lister toutes les politiques
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Tester les politiques**:
```sql
-- Se connecter en tant qu'utilisateur spécifique
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';

-- Tester l'accès
SELECT * FROM shipments WHERE client = 'client-uuid';
```

---

## 7. Alertes et Notifications

### 7.1 Alertes Critiques

**Conditions d'alerte**:
- Taux d'erreur > 5%
- Temps de réponse > 5s
- Disponibilité < 99%
- Espace disque > 80%
- CPU > 90%
- Échec d'Edge Function > 10 fois/heure

**Canaux de notification**:
- Email
- Slack
- SMS (pour les alertes critiques)
- PagerDuty (pour les incidents)

### 7.2 Configuration des Alertes

**Exemple avec Sentry**:
```typescript
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  beforeSend(event, hint) {
    // Filtrer les erreurs non critiques
    if (event.level === 'warning') {
      return null;
    }
    
    // Enrichir les événements
    event.tags = {
      ...event.tags,
      environment: __DEV__ ? 'development' : 'production',
      version: '1.0.0',
    };
    
    return event;
  },
});
```

**Exemple avec Supabase**:
```sql
-- Créer une fonction pour envoyer des alertes
CREATE OR REPLACE FUNCTION send_alert(
  alert_type TEXT,
  message TEXT,
  severity TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO email_notifications (
    recipient_email,
    email_type,
    subject,
    body,
    metadata
  ) VALUES (
    'admin@universalshipping.com',
    'system_alert',
    '[' || severity || '] ' || alert_type,
    message,
    jsonb_build_object('severity', severity, 'timestamp', NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- Utiliser la fonction
SELECT send_alert(
  'High Error Rate',
  'Error rate exceeded 5% in the last hour',
  'CRITICAL'
);
```

---

## 8. Dashboards

### 8.1 Dashboard Applicatif

**Métriques à afficher**:
- Utilisateurs actifs (DAU/MAU)
- Nombre de devis créés
- Taux de conversion
- Nombre d'abonnements actifs
- Nombre de shipments en cours
- Taux d'erreur
- Temps de réponse moyen

**Outils recommandés**:
- Grafana
- Metabase
- Supabase Dashboard

### 8.2 Dashboard Technique

**Métriques à afficher**:
- Temps de réponse API
- Nombre de requêtes par seconde
- Taux d'erreur par endpoint
- Utilisation CPU/RAM
- Taille de la base de données
- Nombre de connexions actives
- Performance des Edge Functions

### 8.3 Dashboard Business

**Métriques à afficher**:
- Revenus mensuels
- Nombre de nouveaux clients
- Taux de rétention
- Valeur vie client (LTV)
- Coût d'acquisition client (CAC)
- Taux de churn
- NPS (Net Promoter Score)

---

## 9. Rapports Automatisés

### 9.1 Rapport Quotidien

**Contenu**:
- Nombre d'utilisateurs actifs
- Nombre de devis créés
- Nombre d'abonnements activés
- Nombre d'agents validés
- Taux d'erreur
- Incidents critiques

**Envoi**: Email à 9h00 tous les jours

### 9.2 Rapport Hebdomadaire

**Contenu**:
- Résumé de la semaine
- Tendances (utilisateurs, devis, abonnements)
- Top 5 des erreurs
- Performance des Edge Functions
- Recommandations d'optimisation

**Envoi**: Email le lundi à 9h00

### 9.3 Rapport Mensuel

**Contenu**:
- Résumé du mois
- Métriques business (revenus, clients, rétention)
- Métriques techniques (performance, disponibilité)
- Incidents majeurs
- Roadmap du mois suivant

**Envoi**: Email le 1er du mois à 9h00

---

## 10. Outils Recommandés

### 10.1 Monitoring et Observabilité

**Sentry**:
- Monitoring des erreurs
- Performance monitoring
- Release tracking
- Alertes

**LogRocket**:
- Session replay
- Performance monitoring
- Error tracking
- User analytics

**Datadog**:
- Infrastructure monitoring
- APM (Application Performance Monitoring)
- Log management
- Alertes

### 10.2 Analytics

**Google Analytics**:
- Tracking des événements
- Analyse des parcours utilisateur
- Conversion tracking

**Mixpanel**:
- Product analytics
- Funnel analysis
- Retention analysis
- A/B testing

**Amplitude**:
- User behavior analytics
- Cohort analysis
- Retention tracking

### 10.3 Uptime Monitoring

**UptimeRobot**:
- Monitoring de disponibilité
- Alertes par email/SMS
- Status page public

**Pingdom**:
- Uptime monitoring
- Performance monitoring
- Real user monitoring

---

## 11. Checklist de Monitoring

### 11.1 Quotidien

- [ ] Vérifier le dashboard applicatif
- [ ] Vérifier les alertes Sentry
- [ ] Vérifier les logs d'erreur
- [ ] Vérifier les métriques de performance
- [ ] Traiter les incidents critiques

### 11.2 Hebdomadaire

- [ ] Analyser les tendances
- [ ] Identifier les requêtes lentes
- [ ] Optimiser les performances
- [ ] Mettre à jour les alertes
- [ ] Réviser les logs

### 11.3 Mensuel

- [ ] Analyser les métriques business
- [ ] Réviser les politiques RLS
- [ ] Nettoyer les logs anciens
- [ ] Optimiser la base de données
- [ ] Mettre à jour la documentation

---

## 12. Conclusion

Ce guide de monitoring assure:

✅ **Visibilité complète**: Métriques applicatives, techniques et business  
✅ **Réactivité**: Alertes en temps réel  
✅ **Optimisation**: Identification des goulots d'étranglement  
✅ **Fiabilité**: Monitoring de la disponibilité  
✅ **Amélioration continue**: Rapports et analyses  

**Objectif**: Maintenir une disponibilité > 99.9% et un temps de réponse < 2s

---

**Dernière mise à jour**: Janvier 2025  
**Version**: 1.0.0
