
# Subscription Flow Verification Guide

## Overview
This document provides a comprehensive guide to verify the subscription flow for the Universal Shipping Services application. It covers all test cases as specified in the requirements.

## Test Cases

### A. Cas 1 — Utilisateur non connecté

**Objectif:** Vérifier que les utilisateurs non connectés sont redirigés vers la page de connexion lorsqu'ils tentent de souscrire à un plan Premium ou Enterprise.

**Étapes:**
1. Déconnectez-vous de l'application
2. Naviguez vers l'onglet **Pricing / Tarification**
3. Cliquez sur un plan **Premium** ou **Enterprise**

**Comportement attendu:**
- Une alerte s'affiche avec le message: "Connexion requise - Veuillez vous connecter pour souscrire à un plan."
- Deux options sont proposées:
  - **Annuler**: Ferme l'alerte
  - **Se connecter**: Redirige vers la page de connexion avec les paramètres `returnTo=subscription-confirm` et `plan=premium_tracking` ou `plan=enterprise_logistics`

**Vérification dans le code:**
- Fichier: `app/(tabs)/pricing.tsx`
- Fonction: `handleSelectPlan()`
- Lignes: 88-110

```typescript
// Check if user is authenticated for other plans
if (!user || !session) {
  appConfig.logger.info('User not authenticated, showing login prompt');
  Alert.alert(
    'Connexion requise',
    'Veuillez vous connecter pour souscrire à un plan.',
    [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Se connecter', 
        onPress: () => {
          router.push({
            pathname: '/(tabs)/login',
            params: { 
              returnTo: planType === 'basic' ? 'pricing' : 'subscription-confirm',
              plan: planType 
            }
          });
        }
      }
    ]
  );
  return;
}
```

---

### B. Cas 2 — Utilisateur connecté, plan Basic

**Objectif:** Vérifier qu'un utilisateur connecté peut souscrire directement au plan Basic et être redirigé vers son dashboard.

**Étapes:**
1. Connectez-vous avec un compte de test
2. Assurez-vous d'avoir un enregistrement dans la table `clients`
3. Naviguez vers **Pricing**
4. Cliquez sur le plan **Basic**

**Comportement attendu:**
- Un abonnement Basic est créé directement dans la table `subscriptions`
- Une alerte de bienvenue s'affiche: "Bienvenue ! Votre abonnement Basic a été activé avec succès."
- Vous êtes redirigé vers le **client dashboard**

**Vérification dans Supabase:**
Ouvrez la table `subscriptions` et vérifiez:
- `client_id` = votre ID client
- `plan_type` = `basic`
- `is_active` = `true`
- `status` = `active`
- `start_date` = date actuelle
- `end_date` = date actuelle + 365 jours
- `payment_provider` = `free`

**Vérification dans le code:**
- Fichier: `app/(tabs)/pricing.tsx`
- Fonction: `handleSelectPlan()`
- Lignes: 130-175

```typescript
// Handle Basic plan - create subscription directly and redirect to dashboard
if (planType === 'basic') {
  appConfig.logger.info('Creating basic subscription directly for client:', client.id);
  
  // Create basic subscription
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 365); // 1 year for basic

  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      client: client.id,
      user_id: user.id,
      plan_type: 'basic',
      plan_code: plan.code,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      is_active: true,
      status: 'active',
      payment_provider: 'free',
      notes: `Basic plan activated on ${new Date().toISOString()}`,
    });

  // ... error handling ...

  // Redirect to client dashboard with success message
  Alert.alert(
    'Bienvenue !',
    'Votre abonnement Basic a été activé avec succès.',
    [
      {
        text: 'OK',
        onPress: () => router.replace('/(tabs)/client-dashboard'),
      },
    ]
  );
}
```

---

### C. Cas 3 — Utilisateur connecté, plan Premium / Enterprise

**Objectif:** Vérifier que les utilisateurs connectés sont redirigés vers la page de confirmation pour les plans Premium et Enterprise.

**Étapes:**
1. Restez connecté
2. Naviguez vers **Pricing**
3. Cliquez sur **Premium** puis sur **Enterprise** (testez les deux)

**Comportement attendu:**
- Vous êtes redirigé vers la page `subscription_confirm`
- Le plan affiché correspond bien (`premium_tracking` ou `enterprise_logistics`)
- Votre email et nom d'entreprise sont visibles dans le récapitulatif
- Lorsque vous cliquez sur **"Confirmer mon abonnement"**:
  - Un enregistrement `subscriptions` est créé
  - Vous êtes redirigé vers la page **"Abonnement en attente / Subscription pending"**

**Vérification dans Supabase:**
Ouvrez la table `subscriptions` et vérifiez:
- `client_id` = votre ID client
- `plan_type` = `premium_tracking` ou `enterprise_logistics`
- `is_active` = `false`
- `status` = `pending`
- `start_date` = date actuelle
- `end_date` = date actuelle + 30 jours
- `payment_provider` = `manual`

**Vérification dans le code:**

**Pricing page:**
- Fichier: `app/(tabs)/pricing.tsx`
- Lignes: 177-184

```typescript
// Handle Premium, Enterprise, and Digital Portal plans - redirect to subscription_confirm
if (planType === 'premium_tracking' || planType === 'enterprise_logistics' || planType === 'digital_portal') {
  appConfig.logger.info('Redirecting to subscription_confirm for plan:', planType);
  router.push({
    pathname: '/(tabs)/subscription-confirm',
    params: { plan: planType }
  });
  setProcessingPlan(null);
  return;
}
```

**Subscription Confirm page:**
- Fichier: `app/(tabs)/subscription-confirm.tsx`
- Fonction: `handleConfirmSubscription()`
- Lignes: 144-195

```typescript
const handleConfirmSubscription = async () => {
  // ... validation ...

  const subscriptionData = {
    client: client.id,
    user_id: user?.id || null,
    plan_type: planDetails.id,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    is_active: false, // Always false for Premium/Enterprise/Digital Portal
    status: 'pending',
    payment_provider: 'manual',
    notes: `Subscription created via app on ${new Date().toISOString()}`,
  };

  // Create subscription
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  // ... error handling ...

  // Redirect to subscription_pending
  router.replace('/(tabs)/subscription-pending');
};
```

---

### D. Cas 4 — Plan Agent Listing

**Objectif:** Vérifier que le plan Agent Listing redirige vers la page "Devenir agent".

**Étapes:**
1. Sur la page **Pricing**, cliquez sur le plan dédié aux agents (Agent Listing)

**Comportement attendu:**
- Vous êtes redirigé vers la page **"Devenir agent" / become_agent**
- Aucune authentification n'est requise pour accéder à cette page

**Vérification dans le code:**
- Fichier: `app/(tabs)/pricing.tsx`
- Fonction: `handleSelectPlan()`
- Lignes: 78-83

```typescript
// Handle Agent Listing plan - redirect to become_agent (no authentication required)
if (planType === 'agent_listing') {
  appConfig.logger.info('Redirecting to become_agent');
  router.push('/(tabs)/become-agent');
  return;
}
```

---

## Flux de redirection après connexion

### Login avec paramètres de retour

Lorsqu'un utilisateur non connecté tente de souscrire à un plan, il est redirigé vers la page de connexion avec des paramètres:
- `returnTo`: Destination après connexion (`pricing` ou `subscription-confirm`)
- `plan`: Type de plan sélectionné

**Vérification dans le code:**
- Fichier: `app/(tabs)/login.tsx`
- Lignes: 27-47

```typescript
// Redirect to client dashboard if already logged in
useEffect(() => {
  if (user) {
    console.log('User already logged in, checking for return destination');
    
    // Check if there's a return destination
    const returnTo = params.returnTo as string;
    const plan = params.plan as string;
    
    if (returnTo === 'subscription-confirm' && plan) {
      console.log('Redirecting to subscription-confirm with plan:', plan);
      router.replace({
        pathname: '/(tabs)/subscription-confirm',
        params: { plan }
      });
    } else if (returnTo === 'pricing') {
      console.log('Redirecting to pricing');
      router.replace('/(tabs)/pricing');
    } else {
      console.log('Redirecting to client dashboard');
      router.replace('/(tabs)/client-dashboard');
    }
  }
}, [user, router, params]);
```

---

## Protection des champs sensibles

Les champs suivants ne sont **jamais modifiables** par un utilisateur standard depuis l'UI:
- `subscriptions.is_active`
- `subscriptions.end_date`
- `subscriptions.status`

Ces champs sont uniquement modifiés:
- Par l'admin via les pages protégées
- Par des workflows internes côté serveur (Edge Functions)

**Vérification:**
- Les formulaires de souscription ne permettent pas de modifier ces champs
- Les valeurs sont définies automatiquement lors de la création

---

## Logs de débogage

Pour faciliter le débogage, des logs sont ajoutés à chaque étape importante:

```typescript
appConfig.logger.info('Plan selected:', plan.code, 'User:', user?.id);
appConfig.logger.info('Determined plan type:', planType);
appConfig.logger.info('User not authenticated, showing login prompt');
appConfig.logger.info('Creating basic subscription directly for client:', client.id);
appConfig.logger.info('Redirecting to subscription_confirm for plan:', planType);
```

Consultez la console du navigateur ou les logs de l'application pour suivre le flux.

---

## Résumé des redirections

| Scénario | Utilisateur | Plan | Action | Redirection |
|----------|-------------|------|--------|-------------|
| 1 | Non connecté | Premium/Enterprise | Alerte → Login | `login?returnTo=subscription-confirm&plan=...` |
| 2 | Connecté | Basic | Création directe | `client-dashboard` |
| 3 | Connecté | Premium/Enterprise | Confirmation | `subscription-confirm?plan=...` → `subscription-pending` |
| 4 | Tous | Agent Listing | Redirection directe | `become-agent` |

---

## Vérification de la base de données

### Table `subscriptions`

Après chaque test, vérifiez la table `subscriptions` dans Supabase:

```sql
SELECT 
  id,
  client,
  plan_type,
  is_active,
  status,
  start_date,
  end_date,
  payment_provider,
  created_at
FROM subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

### Table `clients`

Assurez-vous que votre utilisateur a un enregistrement dans la table `clients`:

```sql
SELECT 
  id,
  user_id,
  company_name,
  email,
  is_verified
FROM clients
WHERE user_id = 'YOUR_USER_ID';
```

---

## Dépannage

### Problème: Pas de ligne créée dans `subscriptions`
**Solution:** Vérifiez les logs de la console pour identifier l'erreur. Assurez-vous que:
- L'utilisateur est connecté
- Un enregistrement `clients` existe pour cet utilisateur
- Les permissions RLS sont correctement configurées

### Problème: `service_id` vide dans `freight_quotes`
**Solution:** Vérifiez que le paramètre est bien transmis depuis la page Services:
```typescript
router.push({
  pathname: '/(tabs)/freight-quote',
  params: { service_id: service.id }
});
```

### Problème: Pas de redirection vers le dashboard
**Solution:** Vérifiez que l'action "après succès" du formulaire est correctement configurée dans `handleSelectPlan()`.

---

## Conclusion

Ce guide couvre tous les scénarios de test pour le flux d'abonnement. Suivez chaque cas de test et vérifiez les résultats dans Supabase pour vous assurer que tout fonctionne correctement.

Pour toute question ou problème, consultez les logs de débogage et référez-vous aux sections de code mentionnées dans ce document.
