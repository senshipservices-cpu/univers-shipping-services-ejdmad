
# PARTIE 3/4 — Logique API du bouton "Calculer le tarif"

## 📋 Vue d'ensemble

Cette documentation décrit l'implémentation complète de la logique du bouton "Calculer le tarif" dans le flux de création d'expédition.

## ✅ Fonctionnalités implémentées

### 1. Bouton "Calculer le tarif"
- **Localisation**: `app/(tabs)/new-shipment.tsx` (ligne ~500+)
- **État**: Désactivé pendant l'appel API (sécurité)
- **Indicateur de chargement**: ActivityIndicator pendant le traitement
- **Style**: Bouton principal avec icône calculatrice

```typescript
<TouchableOpacity
  style={[styles.calculateButton, { backgroundColor: buttonDisabled ? colors.textSecondary : colors.primary }]}
  onPress={handleCalculateQuote}
  disabled={buttonDisabled}
>
  {loading ? <ActivityIndicator color="#FFFFFF" /> : (
    <>
      <IconSymbol ios_icon_name="calculator" android_material_icon_name="calculate" size={20} color="#FFFFFF" />
      <Text style={styles.calculateButtonText}>Calculer le tarif</Text>
    </>
  )}
</TouchableOpacity>
```

### 2. Validation du formulaire

**Fonction**: `validateForm()` dans `new-shipment.tsx`

#### Champs validés:

**Expéditeur:**
- ✅ Nom complet (requis, non vide)
- ✅ Téléphone (requis, format international, min 8 caractères)
- ✅ Email (requis, format valide)

**Adresse de collecte:**
- ✅ Adresse (requise, non vide)
- ✅ Ville (requise, non vide)
- ✅ Pays (requis, non vide)

**Adresse de livraison:**
- ✅ Adresse (requise, non vide)
- ✅ Ville (requise, non vide)
- ✅ Pays (requis, non vide)

**Colis:**
- ✅ Poids (requis, > 0, ≤ 100 kg)
- ✅ Valeur déclarée (optionnelle, si fournie: ≥ 0)

#### Messages d'erreur:
```typescript
const newErrors: Record<string, string> = {};

if (!senderName.trim()) {
  newErrors.senderName = 'Merci de renseigner ce champ.';
}

if (!validatePhone(senderPhone)) {
  newErrors.senderPhone = 'Numéro de téléphone incorrect.';
}

if (!validateEmail(senderEmail)) {
  newErrors.senderEmail = 'Email invalide.';
}

// ... etc.
```

### 3. Appel API POST /shipments/quote

**Fonction**: `calculateQuoteWithTimeout()` dans `utils/apiClient.ts`

#### Payload envoyé:
```typescript
{
  sender: {
    type: 'individual' | 'company',
    name: string,
    phone: string,
    email: string
  },
  pickup: {
    address: string,
    city: string,
    country: string
  },
  delivery: {
    address: string,
    city: string,
    country: string
  },
  parcel: {
    type: 'document' | 'standard' | 'fragile' | 'express',
    weight_kg: number,
    declared_value: number,
    options: string[] // ['insurance', 'express', 'signature']
  }
}
```

#### Réponse API:
```typescript
{
  quote_id: string,        // UUID du devis
  price: string,           // Prix calculé (ex: "125.50")
  currency: string,        // Devise (ex: "EUR")
  estimated_delivery: string, // Date ISO (ex: "2024-01-15T00:00:00Z")
  breakdown: {
    base: number,
    weight: number,
    type_multiplier: number,
    options: string[]
  }
}
```

#### Sécurité:
- ✅ Authentification JWT requise
- ✅ Timeout de 10 secondes
- ✅ Validation côté serveur
- ✅ Sanitization des inputs
- ✅ Association avec `user_id`

### 4. Stockage global

**Context**: `ShipmentContext` dans `contexts/ShipmentContext.tsx`

#### État global:
```typescript
interface ShipmentContextType {
  formData: ShipmentFormData | null;
  quoteData: QuoteData | null;
  setFormData: (data: ShipmentFormData) => void;
  setQuoteData: (data: QuoteData) => void;
  clearShipmentData: () => void;
  getFullShipmentData: () => { formData, quoteData };
}
```

#### Utilisation:
```typescript
const { setFormData, setQuoteData } = useShipment();

// Après succès de l'API
setFormData(formPayload);
setQuoteData(data);
```

### 5. Navigation vers ShipmentSummary

**Méthode**: `router.push()` avec paramètres

```typescript
router.push({
  pathname: '/shipment-summary',
  params: {
    quoteData: JSON.stringify({
      ...formPayload,
      quote: data,
    }),
  },
});
```

**Fallback**: Si les paramètres de navigation sont perdus, le `ShipmentSummary` charge les données depuis le `ShipmentContext`.

### 6. Gestion des erreurs

#### Types d'erreurs gérées:

**Timeout:**
```typescript
if (error.message?.includes('timeout') || error.message?.includes('expiré')) {
  Alert.alert('Erreur', 'La requête a expiré. Veuillez réessayer.');
}
```

**Validation:**
```typescript
if (error.message?.includes('400') || error.message?.includes('incorrectes')) {
  Alert.alert('Erreur', 'Informations incorrectes.');
}
```

**Authentification:**
```typescript
if (error.message?.includes('Unauthorized') || error.message?.includes('authorization')) {
  Alert.alert('Erreur', 'Vous devez être connecté pour calculer un tarif.');
}
```

**Service indisponible:**
```typescript
else {
  Alert.alert('Erreur', 'Service indisponible. Veuillez réessayer plus tard.');
}
```

### 7. État de chargement (Loader)

**Variables d'état:**
```typescript
const [loading, setLoading] = useState(false);
const [buttonDisabled, setButtonDisabled] = useState(false);
```

**Cycle de vie:**
```typescript
const handleCalculateQuote = async () => {
  // 1. Validation
  if (!validateForm()) {
    Alert.alert('Erreur de validation', '...');
    return;
  }

  // 2. Désactiver le bouton
  setLoading(true);
  setButtonDisabled(true);

  try {
    // 3. Appel API
    const { data, error } = await calculateQuoteWithTimeout(payload);
    
    // 4. Gestion du résultat
    if (error) {
      // Afficher erreur
    } else {
      // Stocker et naviguer
    }
  } finally {
    // 5. Réactiver le bouton
    setLoading(false);
    setButtonDisabled(false);
  }
};
```

## 🔒 Sécurité

### Côté client:
- ✅ Désactivation du bouton pendant l'appel API (prévient les doubles soumissions)
- ✅ Validation complète avant l'envoi
- ✅ Timeout de 10 secondes
- ✅ Gestion des erreurs avec messages utilisateur

### Côté serveur (Edge Function):
- ✅ Vérification de l'authentification JWT
- ✅ Validation de tous les champs requis
- ✅ Validation du format email
- ✅ Validation du format téléphone
- ✅ Validation du poids (> 0, ≤ 100 kg)
- ✅ Validation de la valeur déclarée (≥ 0)
- ✅ Sanitization de tous les inputs (suppression de `<>`, `javascript:`, `data:`)
- ✅ Calcul du prix côté serveur uniquement (prévient la manipulation)
- ✅ Association avec `user_id` pour traçabilité

## 📊 Calcul du tarif (Serveur)

### Formule:
```typescript
let basePrice = 50; // Prix de base en EUR

// 1. Ajouter le poids
basePrice += weight_kg * 5;

// 2. Multiplier par le type de colis
const typeMultipliers = {
  document: 1.0,
  standard: 1.2,
  fragile: 1.5,
  express: 2.0,
};
basePrice *= typeMultipliers[parcel_type];

// 3. Ajouter les options
if (options.includes('insurance')) {
  basePrice += declared_value * 0.02; // 2% de la valeur déclarée
}
if (options.includes('express')) {
  basePrice *= 1.5;
}
if (options.includes('signature')) {
  basePrice += 10;
}
```

### Exemple:
- Poids: 5 kg
- Type: Standard
- Options: Assurance (valeur: 200€), Signature

**Calcul:**
1. Base: 50€
2. Poids: 50 + (5 × 5) = 75€
3. Type standard: 75 × 1.2 = 90€
4. Assurance: 90 + (200 × 0.02) = 94€
5. Signature: 94 + 10 = **104€**

## 🧪 Tests

### Test manuel:
1. Remplir tous les champs du formulaire
2. Cliquer sur "Calculer le tarif"
3. Vérifier que le bouton se désactive
4. Vérifier l'affichage du loader
5. Vérifier la navigation vers ShipmentSummary
6. Vérifier l'affichage correct des données

### Test d'erreur:
1. Laisser des champs vides → Vérifier les messages d'erreur
2. Entrer un email invalide → Vérifier le message d'erreur
3. Entrer un poids > 100 kg → Vérifier le message d'erreur
4. Se déconnecter et essayer → Vérifier le message d'authentification

## 📝 Logs

### Console logs:
```typescript
console.log('[NEW_SHIPMENT] Calculate quote button pressed');
console.log('[NEW_SHIPMENT] Calculating quote with payload:', payload);
console.log('[NEW_SHIPMENT] Quote calculated successfully:', data);
console.error('[NEW_SHIPMENT] Quote calculation error:', error);
```

## 🔄 Flux complet

```
1. Utilisateur remplit le formulaire
   ↓
2. Utilisateur clique sur "Calculer le tarif"
   ↓
3. Validation du formulaire (client)
   ↓
4. Désactivation du bouton + Affichage du loader
   ↓
5. Appel API POST /shipments/quote (avec timeout 10s)
   ↓
6. Validation côté serveur
   ↓
7. Calcul du prix côté serveur
   ↓
8. Stockage du devis dans la base de données
   ↓
9. Retour de la réponse (quote_id, price, estimated_delivery)
   ↓
10. Stockage dans ShipmentContext
   ↓
11. Navigation vers ShipmentSummary
   ↓
12. Affichage du résumé avec le prix calculé
```

## 📚 Fichiers concernés

- `app/(tabs)/new-shipment.tsx` - Formulaire et logique du bouton
- `app/(tabs)/shipment-summary.tsx` - Affichage du résumé
- `contexts/ShipmentContext.tsx` - Stockage global
- `utils/apiClient.ts` - Appel API avec timeout
- `supabase/functions/shipments-quote/index.ts` - Edge Function
- `app/_layout.tsx` - Provider du ShipmentContext

## ✨ Améliorations futures

- [ ] Ajouter un cache local pour les devis récents
- [ ] Implémenter la sauvegarde automatique du formulaire
- [ ] Ajouter des suggestions d'adresses (autocomplete)
- [ ] Implémenter un système de devis favoris
- [ ] Ajouter des notifications push pour les devis expirés

## 🎯 Conclusion

La logique du bouton "Calculer le tarif" est **100% implémentée** avec:
- ✅ Validation complète du formulaire
- ✅ Appel API sécurisé avec timeout
- ✅ Stockage global des données
- ✅ Navigation fluide vers le résumé
- ✅ Gestion complète des erreurs
- ✅ État de chargement approprié
- ✅ Sécurité côté client et serveur

Le système est prêt pour la production et respecte toutes les bonnes pratiques de sécurité et d'UX.
