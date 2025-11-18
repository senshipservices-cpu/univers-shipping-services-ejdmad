
# Guide de Tests - UNIVERSAL SHIPPING SERVICES

## Vue d'ensemble

Ce guide décrit les stratégies de tests pour l'application UNIVERSAL SHIPPING SERVICES.

---

## 1. Tests Unitaires

### 1.1 Validation (`utils/validation.ts`)

**Tests à implémenter**:

```typescript
describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('test@example.com')).toEqual({ isValid: true });
    expect(validateEmail('user.name+tag@example.co.uk')).toEqual({ isValid: true });
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid')).toEqual({ isValid: false, error: expect.any(String) });
    expect(validateEmail('test@')).toEqual({ isValid: false, error: expect.any(String) });
    expect(validateEmail('@example.com')).toEqual({ isValid: false, error: expect.any(String) });
  });

  it('should reject empty emails', () => {
    expect(validateEmail('')).toEqual({ isValid: false, error: expect.any(String) });
  });
});

describe('validatePhone', () => {
  it('should accept valid phone numbers', () => {
    expect(validatePhone('+33612345678')).toEqual({ isValid: true });
    expect(validatePhone('+1234567890')).toEqual({ isValid: true });
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toEqual({ isValid: false, error: expect.any(String) });
    expect(validatePhone('abcdefghij')).toEqual({ isValid: false, error: expect.any(String) });
  });
});

describe('validatePassword', () => {
  it('should accept strong passwords', () => {
    expect(validatePassword('StrongP@ss123')).toEqual({ isValid: true });
  });

  it('should reject weak passwords', () => {
    expect(validatePassword('weak')).toEqual({ isValid: false, error: expect.any(String) });
    expect(validatePassword('12345678')).toEqual({ isValid: false, error: expect.any(String) });
  });
});
```

### 1.2 Formatters (`utils/formatters.ts`)

**Tests à implémenter**:

```typescript
describe('formatCurrency', () => {
  it('should format EUR correctly', () => {
    expect(formatCurrency(1234.56, 'EUR', 'fr-FR')).toBe('1 234,56 €');
  });

  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD', 'en-US')).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0, 'EUR', 'fr-FR')).toBe('0,00 €');
  });
});

describe('formatDate', () => {
  it('should format dates correctly', () => {
    const date = new Date('2025-01-15T10:30:00Z');
    expect(formatDate(date, 'fr-FR')).toMatch(/15 janv\. 2025/);
  });
});

describe('formatStatus', () => {
  it('should format snake_case to Title Case', () => {
    expect(formatStatus('in_progress')).toBe('In Progress');
    expect(formatStatus('sent_to_client')).toBe('Sent To Client');
  });
});
```

### 1.3 Security (`utils/security.ts`)

**Tests à implémenter**:

```typescript
describe('sanitizeInput', () => {
  it('should remove dangerous characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(sanitizeInput('SELECT * FROM users')).not.toContain('SELECT');
  });

  it('should preserve safe input', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });
});

describe('detectSqlInjection', () => {
  it('should detect SQL injection attempts', () => {
    expect(detectSqlInjection("'; DROP TABLE users; --")).toBe(true);
    expect(detectSqlInjection("1' OR '1'='1")).toBe(true);
  });

  it('should not flag safe input', () => {
    expect(detectSqlInjection('Hello World')).toBe(false);
  });
});

describe('maskEmail', () => {
  it('should mask email addresses', () => {
    expect(maskEmail('test@example.com')).toBe('t***@example.com');
    expect(maskEmail('john.doe@company.co.uk')).toBe('j***@company.co.uk');
  });
});
```

### 1.4 Data Integrity (`utils/dataIntegrity.ts`)

**Tests à implémenter**:

```typescript
describe('generateUniqueTrackingNumber', () => {
  it('should generate unique tracking numbers', async () => {
    const tn1 = await generateUniqueTrackingNumber();
    const tn2 = await generateUniqueTrackingNumber();
    expect(tn1).not.toBe(tn2);
    expect(tn1).toMatch(/^USS-\d{4}-\d{6}$/);
  });
});

describe('validateTrackingNumberUnique', () => {
  it('should return true for unique tracking numbers', async () => {
    const result = await validateTrackingNumberUnique('USS-2025-999999');
    expect(result).toBe(true);
  });

  it('should return false for existing tracking numbers', async () => {
    // Assuming USS-2025-000001 exists
    const result = await validateTrackingNumberUnique('USS-2025-000001');
    expect(result).toBe(false);
  });
});
```

---

## 2. Tests d'Intégration

### 2.1 Flux d'Authentification

**Scénario**: Inscription → Confirmation → Connexion

```typescript
describe('Authentication Flow', () => {
  it('should sign up a new user', async () => {
    const { error } = await signUp('test@example.com', 'StrongP@ss123', {
      companyName: 'Test Company',
      contactName: 'John Doe',
    });
    expect(error).toBeNull();
  });

  it('should send confirmation email', async () => {
    // Vérifier que l'email de confirmation a été envoyé
    // (nécessite un mock du service d'email)
  });

  it('should sign in after confirmation', async () => {
    const { error } = await signIn('test@example.com', 'StrongP@ss123');
    expect(error).toBeNull();
  });

  it('should load client profile after sign in', async () => {
    await signIn('test@example.com', 'StrongP@ss123');
    const { client } = useAuth();
    expect(client).not.toBeNull();
    expect(client?.company_name).toBe('Test Company');
  });
});
```

### 2.2 Flux de Demande de Devis

**Scénario**: Demande → Validation → Envoi → Acceptation → Paiement → Création Shipment

```typescript
describe('Freight Quote Flow', () => {
  let quoteId: string;

  it('should create a freight quote', async () => {
    const { data, error } = await supabase
      .from('freight_quotes')
      .insert({
        client_email: 'test@example.com',
        client_name: 'Test Client',
        origin_port: 'port-uuid-1',
        destination_port: 'port-uuid-2',
        cargo_type: 'Container',
        volume_details: '1 x 20DC',
        status: 'received',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    quoteId = data.id;
  });

  it('should send quote received email', async () => {
    // Appeler l'Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-freight-quote-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        quote_id: quoteId,
        email_type: 'quote_received',
      }),
    });

    expect(response.ok).toBe(true);
  });

  it('should update quote with amount', async () => {
    const { error } = await supabase
      .from('freight_quotes')
      .update({
        quote_amount: 1500,
        quote_currency: 'EUR',
        status: 'sent_to_client',
      })
      .eq('id', quoteId);

    expect(error).toBeNull();
  });

  it('should accept quote', async () => {
    const { error } = await supabase
      .from('freight_quotes')
      .update({
        client_decision: 'accepted',
        status: 'accepted',
      })
      .eq('id', quoteId);

    expect(error).toBeNull();
  });

  it('should confirm payment and create shipment', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/confirm-quote-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        quote_id: quoteId,
      }),
    });

    expect(response.ok).toBe(true);

    // Vérifier que le shipment a été créé
    const { data: quote } = await supabase
      .from('freight_quotes')
      .select('ordered_as_shipment')
      .eq('id', quoteId)
      .single();

    expect(quote?.ordered_as_shipment).not.toBeNull();
  });
});
```

### 2.3 Flux de Candidature Agent

**Scénario**: Candidature → Notification → Validation → Email

```typescript
describe('Agent Application Flow', () => {
  let agentId: string;

  it('should submit agent application', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-agent-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_name: 'Test Agent Company',
        port_id: 'port-uuid-1',
        activities: ['consignation', 'customs'],
        years_experience: 10,
        email: 'agent@example.com',
        whatsapp: '+33612345678',
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    agentId = data.agent_id;
  });

  it('should send notification email to admins', async () => {
    // Vérifier que l'email a été créé dans email_notifications
    const { data } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('email_type', 'agent_application')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(data).not.toBeNull();
  });

  it('should validate agent', async () => {
    const { error } = await supabase
      .from('global_agents')
      .update({ status: 'validated' })
      .eq('id', agentId);

    expect(error).toBeNull();
  });

  it('should send validation email to agent', async () => {
    // Vérifier que l'email de validation a été créé
    const { data } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('email_type', 'agent_validated')
      .eq('recipient_email', 'agent@example.com')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(data).not.toBeNull();
  });
});
```

### 2.4 Flux d'Abonnement

**Scénario**: Sélection → Confirmation → Activation → Accès

```typescript
describe('Subscription Flow', () => {
  let subscriptionId: string;
  let clientId: string;

  beforeAll(async () => {
    // Créer un client de test
    const { data: client } = await supabase
      .from('clients')
      .insert({
        user_id: 'test-user-uuid',
        company_name: 'Test Company',
        email: 'test@example.com',
      })
      .select()
      .single();

    clientId = client.id;
  });

  it('should create pending subscription', async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        client: clientId,
        plan_type: 'premium_tracking',
        status: 'pending',
        start_date: new Date().toISOString().split('T')[0],
        is_active: false,
      })
      .select()
      .single();

    expect(error).toBeNull();
    subscriptionId = data.id;
  });

  it('should activate subscription after payment', async () => {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        is_active: true,
        payment_reference: 'test-payment-ref',
      })
      .eq('id', subscriptionId);

    expect(error).toBeNull();
  });

  it('should grant digital portal access', async () => {
    const { hasDigitalPortalAccess } = useSubscriptionAccess();
    expect(hasDigitalPortalAccess).toBe(true);
  });

  it('should grant full tracking access', async () => {
    const { hasFullTrackingAccess } = useSubscriptionAccess();
    expect(hasFullTrackingAccess).toBe(true);
  });
});
```

---

## 3. Tests E2E (End-to-End)

### 3.1 Parcours Utilisateur Complet

**Scénario**: Inscription → Demande de devis → Suivi

```typescript
describe('Complete User Journey', () => {
  it('should complete full user journey', async () => {
    // 1. Ouvrir l'application
    await device.launchApp();

    // 2. Aller à l'écran de connexion
    await element(by.text('Connexion')).tap();

    // 3. Créer un compte
    await element(by.id('signup-tab')).tap();
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('StrongP@ss123');
    await element(by.id('company-input')).typeText('New Company');
    await element(by.id('signup-button')).tap();

    // 4. Vérifier le message de confirmation
    await expect(element(by.text('Vérifiez votre email'))).toBeVisible();

    // 5. Simuler la confirmation d'email (en dev)
    // ...

    // 6. Se connecter
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('StrongP@ss123');
    await element(by.id('signin-button')).tap();

    // 7. Vérifier qu'on est sur le dashboard
    await expect(element(by.text('Mon espace'))).toBeVisible();

    // 8. Demander un devis
    await element(by.text('Demander un devis')).tap();
    await element(by.id('origin-port-select')).tap();
    await element(by.text('Port de Marseille')).tap();
    await element(by.id('destination-port-select')).tap();
    await element(by.text('Port de Shanghai')).tap();
    await element(by.id('cargo-type-input')).typeText('Container');
    await element(by.id('submit-quote-button')).tap();

    // 9. Vérifier le message de succès
    await expect(element(by.text('Devis envoyé'))).toBeVisible();

    // 10. Retourner au dashboard
    await element(by.text('Retour')).tap();

    // 11. Vérifier que le devis apparaît
    await expect(element(by.text('Devis en cours'))).toBeVisible();
  });
});
```

### 3.2 Parcours Admin

**Scénario**: Connexion admin → Validation agent → Mise à jour shipment

```typescript
describe('Admin Journey', () => {
  it('should complete admin tasks', async () => {
    // 1. Se connecter en tant qu'admin
    await device.launchApp();
    await element(by.text('Connexion')).tap();
    await element(by.id('email-input')).typeText('admin@universalshipping.com');
    await element(by.id('password-input')).typeText('AdminP@ss123');
    await element(by.id('signin-button')).tap();

    // 2. Aller au panneau admin
    await element(by.id('admin-button')).tap();

    // 3. Aller à l'onglet Agents
    await element(by.text('Agents')).tap();

    // 4. Valider un agent en attente
    await element(by.id('agent-pending-0')).tap();
    await element(by.text('Valider')).tap();
    await element(by.text('Confirmer')).tap();

    // 5. Vérifier le message de succès
    await expect(element(by.text('Agent validé'))).toBeVisible();

    // 6. Aller à l'onglet Expéditions
    await element(by.text('Expéditions')).tap();

    // 7. Mettre à jour le statut d'une expédition
    await element(by.id('shipment-0')).tap();
    await element(by.id('edit-status-button')).tap();
    await element(by.text('In Transit')).tap();
    await element(by.text('Enregistrer')).tap();

    // 8. Vérifier le message de succès
    await expect(element(by.text('Statut mis à jour'))).toBeVisible();
  });
});
```

---

## 4. Tests de Performance

### 4.1 Temps de Chargement

**Tests à implémenter**:

```typescript
describe('Performance Tests', () => {
  it('should load home screen in less than 1 second', async () => {
    const startTime = Date.now();
    await device.launchApp();
    await waitFor(element(by.text('Accueil'))).toBeVisible().withTimeout(1000);
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1000);
  });

  it('should load client dashboard in less than 2 seconds', async () => {
    await signIn('test@example.com', 'StrongP@ss123');
    const startTime = Date.now();
    await element(by.text('Mon espace')).tap();
    await waitFor(element(by.text('Mes dossiers logistiques'))).toBeVisible().withTimeout(2000);
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  it('should load shipment list in less than 1.5 seconds', async () => {
    await signIn('test@example.com', 'StrongP@ss123');
    await element(by.text('Mon espace')).tap();
    const startTime = Date.now();
    await waitFor(element(by.id('shipment-list'))).toBeVisible().withTimeout(1500);
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1500);
  });
});
```

### 4.2 Tests de Charge

**Scénarios à tester**:

- 100 utilisateurs simultanés
- 1000 requêtes par minute
- Création de 50 devis simultanés
- Mise à jour de 100 shipments simultanés

**Outils recommandés**:
- Apache JMeter
- k6
- Artillery

---

## 5. Tests de Sécurité

### 5.1 Tests d'Injection SQL

```typescript
describe('SQL Injection Tests', () => {
  it('should prevent SQL injection in email field', async () => {
    const maliciousEmail = "'; DROP TABLE users; --";
    const { error } = await supabase
      .from('freight_quotes')
      .insert({
        client_email: maliciousEmail,
        origin_port: 'port-uuid-1',
        destination_port: 'port-uuid-2',
      });

    // L'insertion devrait échouer ou l'email devrait être sanitizé
    expect(error).not.toBeNull();
  });
});
```

### 5.2 Tests XSS

```typescript
describe('XSS Tests', () => {
  it('should prevent XSS in company name', async () => {
    const maliciousName = '<script>alert("xss")</script>';
    const { data } = await supabase
      .from('clients')
      .insert({
        user_id: 'test-user-uuid',
        company_name: maliciousName,
      })
      .select()
      .single();

    // Le nom devrait être sanitizé
    expect(data.company_name).not.toContain('<script>');
  });
});
```

### 5.3 Tests RLS

```typescript
describe('RLS Tests', () => {
  it('should prevent access to other users shipments', async () => {
    // Se connecter en tant qu'utilisateur A
    await signIn('userA@example.com', 'password');

    // Essayer d'accéder à un shipment de l'utilisateur B
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', 'userB-shipment-uuid')
      .single();

    // L'accès devrait être refusé
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  it('should allow access to own shipments', async () => {
    await signIn('userA@example.com', 'password');

    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('client', 'userA-client-uuid');

    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });
});
```

---

## 6. Configuration des Tests

### 6.1 Jest Configuration

**Fichier**: `jest.config.js`

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@supabase)/)',
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'utils/**/*.ts',
    'hooks/**/*.ts',
    'contexts/**/*.tsx',
    'components/**/*.tsx',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 6.2 Detox Configuration

**Fichier**: `.detoxrc.js`

```javascript
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/UniversalShipping.app',
      build: 'xcodebuild -workspace ios/UniversalShipping.xcworkspace -scheme UniversalShipping -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_31',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

---

## 7. Exécution des Tests

### 7.1 Tests Unitaires

```bash
# Exécuter tous les tests
npm test

# Exécuter avec couverture
npm test -- --coverage

# Exécuter en mode watch
npm test -- --watch

# Exécuter un fichier spécifique
npm test -- validation.test.ts
```

### 7.2 Tests E2E

```bash
# iOS
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug

# Android
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug
```

### 7.3 Tests de Performance

```bash
# Avec k6
k6 run performance-tests/load-test.js

# Avec Artillery
artillery run performance-tests/load-test.yml
```

---

## 8. CI/CD Integration

### 8.1 GitHub Actions

**Fichier**: `.github/workflows/tests.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: detox build --configuration ios.sim.debug
      - run: detox test --configuration ios.sim.debug
```

---

## 9. Bonnes Pratiques

### 9.1 Principes

- **AAA Pattern**: Arrange, Act, Assert
- **DRY**: Don't Repeat Yourself
- **FIRST**: Fast, Independent, Repeatable, Self-validating, Timely
- **Isolation**: Chaque test doit être indépendant
- **Clarté**: Les tests doivent être faciles à comprendre

### 9.2 Conventions de Nommage

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test
    });
  });
});
```

### 9.3 Mocking

**Supabase**:
```typescript
jest.mock('@/app/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    })),
  },
}));
```

**Navigation**:
```typescript
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
}));
```

---

## 10. Conclusion

Ce guide de tests assure:

✅ **Couverture complète**: Unitaires, intégration, E2E  
✅ **Qualité**: Tests automatisés et reproductibles  
✅ **Sécurité**: Tests de vulnérabilités  
✅ **Performance**: Tests de charge et de vitesse  
✅ **CI/CD**: Intégration continue  

**Objectif de couverture**: 80% minimum

---

**Dernière mise à jour**: Janvier 2025  
**Version**: 1.0.0
