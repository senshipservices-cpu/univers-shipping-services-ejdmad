
# Guide Admin - Paiement PayPal pour les devis

## 🎯 Pour les administrateurs USS

Ce guide explique comment gérer les paiements PayPal pour les devis côté administration.

---

## 📋 Processus de paiement d'un devis

### Étape 1 : Recevoir une demande de devis

Un client soumet une demande de devis via l'application. Le devis est créé avec :
- `status = 'received'` ou `'pending'`
- Pas de montant défini

### Étape 2 : Chiffrer le devis

En tant qu'admin, vous devez :

1. **Calculer le montant du devis**
2. **Mettre à jour le devis dans la base de données**

```sql
UPDATE freight_quotes
SET 
  status = 'priced',
  quote_amount = 1250.00,
  quote_currency = 'EUR',
  quoted_price = 1250.00,  -- Pour compatibilité
  currency = 'EUR'          -- Pour compatibilité
WHERE id = '[QUOTE_ID]';
```

**Champs obligatoires** :
- `status` = `'priced'` (le devis est prêt à être payé)
- `quote_amount` > 0 (montant en décimal)
- `quote_currency` non vide (ex: "EUR", "USD")

### Étape 3 : Notifier le client

Le client reçoit une notification que son devis est prêt. Il peut maintenant :
- Voir le montant du devis
- Cliquer sur "Payer ce devis"

### Étape 4 : Le client paye

Le client :
1. Clique sur "Payer"
2. Est redirigé vers PayPal
3. Paye avec sa carte ou son compte PayPal
4. Revient sur l'application

Le statut du devis passe automatiquement à :
- `status = 'payment_pending'` (pendant le paiement)
- `status = 'paid'` (après confirmation)

### Étape 5 : Confirmation de paiement

Vous recevez automatiquement un email avec :
- Les détails du devis
- Les informations du client
- Le montant payé
- L'ID de transaction PayPal

---

## 🔍 Vérifier les devis en attente de paiement

### Via SQL (Supabase Dashboard)

```sql
-- Devis prêts à être payés
SELECT 
  id,
  client_name,
  client_email,
  quote_amount,
  quote_currency,
  status,
  created_at
FROM freight_quotes
WHERE status = 'priced'
ORDER BY created_at DESC;
```

### Via l'interface admin (à venir dans PARTIE 2)

L'interface admin affichera :
- Liste des devis par statut
- Bouton pour définir le montant
- Historique des paiements

---

## 💰 Définir le montant d'un devis

### Méthode 1 : Via SQL

```sql
UPDATE freight_quotes
SET 
  status = 'priced',
  quote_amount = [MONTANT],
  quote_currency = '[DEVISE]'
WHERE id = '[QUOTE_ID]';
```

**Exemple** :
```sql
UPDATE freight_quotes
SET 
  status = 'priced',
  quote_amount = 1250.00,
  quote_currency = 'EUR'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

### Méthode 2 : Via l'interface admin (à venir)

1. Aller dans "Gestion des devis"
2. Sélectionner le devis
3. Cliquer sur "Définir le montant"
4. Entrer le montant et la devise
5. Cliquer sur "Enregistrer"

---

## 📊 Suivre les paiements

### Devis en attente de paiement

```sql
SELECT 
  id,
  client_name,
  quote_amount,
  quote_currency,
  paypal_order_id,
  created_at
FROM freight_quotes
WHERE status = 'payment_pending'
ORDER BY created_at DESC;
```

### Devis payés aujourd'hui

```sql
SELECT 
  id,
  client_name,
  quote_amount,
  quote_currency,
  paypal_order_id,
  paid_at
FROM freight_quotes
WHERE status = 'paid'
  AND paid_at::date = CURRENT_DATE
ORDER BY paid_at DESC;
```

### Statistiques de paiement

```sql
SELECT 
  status,
  COUNT(*) as nombre_devis,
  SUM(quote_amount) as montant_total,
  quote_currency
FROM freight_quotes
WHERE quote_amount IS NOT NULL
GROUP BY status, quote_currency
ORDER BY status;
```

### Revenus du mois

```sql
SELECT 
  SUM(quote_amount) as revenus_total,
  quote_currency,
  COUNT(*) as nombre_paiements
FROM freight_quotes
WHERE status = 'paid'
  AND paid_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY quote_currency;
```

---

## 📧 Emails automatiques

### Email au client (automatique)

Envoyé automatiquement après paiement confirmé :

**Sujet** : "Paiement confirmé - Universal Shipping Services"

**Contenu** :
- Confirmation de paiement
- Détails du devis
- Prochaines étapes

### Email à l'admin (automatique)

Envoyé automatiquement après paiement confirmé :

**Sujet** : "Nouveau paiement reçu - Devis #..."

**Contenu** :
- ID du devis
- Informations client
- Montant et devise
- PayPal Order ID
- Détails complets du devis

**Destinataire** : Adresse configurée dans `SMTP_FROM_EMAIL`

---

## 🔧 Gestion des problèmes

### Problème : Le client ne peut pas payer

**Causes possibles** :
1. Le statut n'est pas `'priced'`
2. Le montant n'est pas défini ou est <= 0
3. La devise n'est pas définie

**Solution** :
```sql
-- Vérifier le devis
SELECT 
  id,
  status,
  quote_amount,
  quote_currency
FROM freight_quotes
WHERE id = '[QUOTE_ID]';

-- Corriger si nécessaire
UPDATE freight_quotes
SET 
  status = 'priced',
  quote_amount = [MONTANT],
  quote_currency = 'EUR'
WHERE id = '[QUOTE_ID]';
```

### Problème : Le paiement est bloqué

**Causes possibles** :
1. Problème avec PayPal
2. Carte refusée
3. Compte PayPal insuffisant

**Solution** :
1. Vérifier les logs PayPal
2. Contacter le client
3. Proposer un autre moyen de paiement

### Problème : Le statut ne se met pas à jour

**Causes possibles** :
1. Erreur lors de la capture
2. Problème de connexion PayPal

**Solution** :
```sql
-- Vérifier le statut actuel
SELECT 
  id,
  status,
  payment_status,
  paypal_order_id,
  paid_at
FROM freight_quotes
WHERE id = '[QUOTE_ID]';

-- Si le paiement est confirmé sur PayPal mais pas dans la DB
UPDATE freight_quotes
SET 
  status = 'paid',
  payment_status = 'paid',
  paid_at = NOW()
WHERE id = '[QUOTE_ID]';
```

---

## 💡 Bonnes pratiques

### 1. Définir le montant rapidement

- Répondre aux demandes de devis dans les 24h
- Définir un montant précis et compétitif
- Inclure tous les frais dans le montant

### 2. Vérifier les paiements

- Vérifier quotidiennement les paiements reçus
- Confirmer les paiements dans PayPal Dashboard
- Archiver les confirmations de paiement

### 3. Communiquer avec les clients

- Envoyer un email personnalisé après paiement
- Confirmer les prochaines étapes
- Fournir un contact pour les questions

### 4. Suivre les statistiques

- Surveiller le taux de conversion (devis → paiement)
- Analyser les montants moyens
- Identifier les tendances

---

## 📊 Tableau de bord admin (à venir)

L'interface admin affichera :

### Vue d'ensemble
- Nombre de devis en attente
- Nombre de devis payés aujourd'hui
- Revenus du jour/mois
- Taux de conversion

### Liste des devis
- Filtres par statut
- Recherche par client
- Tri par date/montant
- Actions rapides (définir montant, voir détails)

### Détails d'un devis
- Informations client
- Détails du fret
- Historique des statuts
- Informations de paiement
- Actions (modifier, annuler, rembourser)

---

## 🔐 Sécurité

### Accès admin

Seuls les utilisateurs avec `role = 'admin'` peuvent :
- Voir tous les devis
- Modifier les montants
- Accéder aux informations de paiement

### Protection des données

- Les secrets PayPal ne sont jamais exposés
- Les informations de paiement sont sécurisées
- Les logs sont protégés

---

## 📞 Support

### En cas de problème technique

1. Vérifier les logs des Edge Functions
2. Vérifier la configuration PayPal
3. Contacter le support technique

### En cas de problème de paiement

1. Vérifier le statut sur PayPal Dashboard
2. Contacter le client
3. Proposer une solution alternative

---

## 🚀 Prochaines fonctionnalités

### PARTIE 2 (à venir)

- Interface admin complète
- Gestion visuelle des devis
- Statistiques en temps réel
- Export des données
- Notifications push

---

## 📝 Checklist quotidienne

- [ ] Vérifier les nouvelles demandes de devis
- [ ] Chiffrer les devis en attente
- [ ] Vérifier les paiements reçus
- [ ] Répondre aux questions clients
- [ ] Archiver les devis traités
- [ ] Vérifier les statistiques du jour

---

## 💼 Exemple de workflow complet

### Scénario : Nouveau devis de fret maritime

1. **9h00** - Réception d'une demande de devis
   - Client : ABC Logistics
   - Route : Le Havre → Dakar
   - Cargo : 1 x 40HC (conteneur)

2. **10h00** - Calcul du devis
   - Fret maritime : 1,200 EUR
   - Frais portuaires : 150 EUR
   - Documentation : 50 EUR
   - **Total : 1,400 EUR**

3. **10h15** - Mise à jour dans la base
   ```sql
   UPDATE freight_quotes
   SET 
     status = 'priced',
     quote_amount = 1400.00,
     quote_currency = 'EUR'
   WHERE id = '[QUOTE_ID]';
   ```

4. **11h00** - Le client reçoit la notification

5. **14h00** - Le client paye via PayPal

6. **14h05** - Confirmation de paiement reçue
   - Email automatique au client
   - Email automatique à l'admin

7. **14h30** - Traitement du dossier
   - Création du shipment
   - Planification du transport
   - Communication avec le client

---

## ✅ Résumé

En tant qu'admin, votre rôle est de :

1. ✅ Recevoir les demandes de devis
2. ✅ Calculer et définir les montants
3. ✅ Mettre le statut à `'priced'`
4. ✅ Suivre les paiements
5. ✅ Traiter les dossiers payés

Le système PayPal gère automatiquement :
- La création des ordres de paiement
- La redirection vers PayPal
- La capture des paiements
- L'envoi des emails de confirmation
- La mise à jour des statuts

**Tout est automatisé après que vous ayez défini le montant !**
