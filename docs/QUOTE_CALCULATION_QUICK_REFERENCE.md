
# 🚀 Guide rapide — Calcul de tarif

## 📍 Localisation

**Écran principal**: `app/(tabs)/new-shipment.tsx`
**Fonction clé**: `handleCalculateQuote()`
**API**: `POST /shipments/quote` via `calculateQuoteWithTimeout()`

## ⚡ Utilisation rapide

### 1. Validation du formulaire
```typescript
if (!validateForm()) {
  Alert.alert('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire.');
  return;
}
```

### 2. Appel API
```typescript
const { data, error } = await calculateQuoteWithTimeout({
  sender: { type, name, phone, email },
  pickup: { address, city, country },
  delivery: { address, city, country },
  parcel: { type, weight_kg, declared_value, options }
});
```

### 3. Stockage global
```typescript
const { setFormData, setQuoteData } = useShipment();
setFormData(formPayload);
setQuoteData(data);
```

### 4. Navigation
```typescript
router.push({
  pathname: '/shipment-summary',
  params: { quoteData: JSON.stringify({ ...formPayload, quote: data }) }
});
```

## 🔍 Validation des champs

| Champ | Règle | Message d'erreur |
|-------|-------|------------------|
| Nom | Non vide | "Merci de renseigner ce champ." |
| Téléphone | ≥ 8 caractères, format international | "Numéro de téléphone incorrect." |
| Email | Format valide | "Email invalide." |
| Adresse | Non vide | "Merci de renseigner ce champ." |
| Ville | Non vide | "Merci de renseigner ce champ." |
| Pays | Non vide | "Merci de renseigner ce champ." |
| Poids | > 0 et ≤ 100 kg | "Poids non valide (doit être > 0 et ≤ 100 kg)." |
| Valeur déclarée | ≥ 0 (optionnel) | "Valeur déclarée invalide." |

## 💰 Calcul du prix

```
Prix de base: 50€
+ Poids: weight_kg × 5€
× Type: document (1.0) | standard (1.2) | fragile (1.5) | express (2.0)
+ Assurance: declared_value × 2%
× Express: ×1.5
+ Signature: +10€
```

## 🛡️ Sécurité

- ✅ Bouton désactivé pendant l'appel API
- ✅ Timeout de 10 secondes
- ✅ Authentification JWT requise
- ✅ Validation côté serveur
- ✅ Sanitization des inputs
- ✅ Calcul du prix côté serveur uniquement

## ⚠️ Gestion des erreurs

```typescript
if (error.message?.includes('timeout')) {
  Alert.alert('Erreur', 'La requête a expiré. Veuillez réessayer.');
} else if (error.message?.includes('400')) {
  Alert.alert('Erreur', 'Informations incorrectes.');
} else if (error.message?.includes('Unauthorized')) {
  Alert.alert('Erreur', 'Vous devez être connecté pour calculer un tarif.');
} else {
  Alert.alert('Erreur', 'Service indisponible. Veuillez réessayer plus tard.');
}
```

## 🔄 État de chargement

```typescript
const [loading, setLoading] = useState(false);
const [buttonDisabled, setButtonDisabled] = useState(false);

// Avant l'appel API
setLoading(true);
setButtonDisabled(true);

// Après l'appel API (dans finally)
setLoading(false);
setButtonDisabled(false);
```

## 📊 Réponse API

```typescript
{
  quote_id: "uuid",
  price: "125.50",
  currency: "EUR",
  estimated_delivery: "2024-01-15T00:00:00Z",
  breakdown: {
    base: 50,
    weight: 25,
    type_multiplier: 1.2,
    options: ["insurance", "signature"]
  }
}
```

## 🧪 Test rapide

1. Remplir le formulaire avec des données valides
2. Cliquer sur "Calculer le tarif"
3. Vérifier le loader
4. Vérifier la navigation vers ShipmentSummary
5. Vérifier l'affichage du prix

## 📝 Logs utiles

```typescript
console.log('[NEW_SHIPMENT] Calculate quote button pressed');
console.log('[NEW_SHIPMENT] Calculating quote with payload:', payload);
console.log('[NEW_SHIPMENT] Quote calculated successfully:', data);
console.error('[NEW_SHIPMENT] Quote calculation error:', error);
```

## 🎯 Points clés

1. **Toujours valider** avant d'appeler l'API
2. **Désactiver le bouton** pendant le traitement
3. **Gérer tous les cas d'erreur** avec des messages clairs
4. **Stocker les données** dans le contexte global
5. **Logger les actions** pour faciliter le débogage

## 📚 Documentation complète

Voir `docs/NEW_SHIPMENT_QUOTE_CALCULATION.md` pour plus de détails.
