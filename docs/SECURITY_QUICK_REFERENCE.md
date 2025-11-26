
# 🔒 SECURITY QUICK REFERENCE

Quick reference for security features in Universal Shipping Services.

---

## 🔑 TOKEN MANAGEMENT

```typescript
import { 
  storeAccessToken, 
  getAccessToken, 
  clearAllTokens 
} from '@/utils/secureStorage';

// Store token
await storeAccessToken(token, 3600); // 1 hour expiry

// Get token (null if expired)
const token = await getAccessToken();

// Clear on logout
await clearAllTokens();
```

---

## 🌐 API CALLS

```typescript
import { 
  makeAuthenticatedRequest,
  calculateQuoteWithTimeout,
  processPaymentWithSecurity 
} from '@/utils/apiClient';

// Quote calculation (10s timeout)
const { data, error } = await calculateQuoteWithTimeout(payload);

// Payment (20s timeout + idempotency)
const { data, error } = await processPaymentWithSecurity(
  quoteId,
  paymentMethod,
  paymentToken,
  idempotencyKey
);
```

---

## 🔢 TRACKING NUMBERS

```typescript
import { 
  generateTrackingNumber,
  isValidTrackingNumber 
} from '@/utils/trackingGenerator';

// Generate: USS-7G94X2Q
const trackingNumber = generateTrackingNumber();

// Validate format
const isValid = isValidTrackingNumber('USS-7G94X2Q'); // true
```

---

## 💳 PAYMENT SECURITY

```typescript
import { generateIdempotencyKey } from '@/utils/trackingGenerator';

// Generate unique key
const idempotencyKey = generateIdempotencyKey();

// Use in payment request header
headers: {
  'Idempotency-Key': idempotencyKey
}
```

---

## 🛡️ RATE LIMITING

```typescript
import { loginWithRateLimit } from '@/utils/apiClient';

// Login: 5 attempts / 15 min
const { error } = await loginWithRateLimit(email, password);

// Tracking: 10 requests / 1 min
const { data, error } = await trackShipmentWithRateLimit(trackingNumber);

// Payment: 3 attempts / 5 min
// Automatic in processPaymentWithSecurity()
```

---

## 🎯 BUTTON STATES

```typescript
const [loading, setLoading] = useState(false);
const [buttonDisabled, setButtonDisabled] = useState(false);

const handleAction = async () => {
  setLoading(true);
  setButtonDisabled(true);
  
  try {
    await apiCall();
  } finally {
    setLoading(false);
    setButtonDisabled(false);
  }
};

<TouchableOpacity disabled={buttonDisabled}>
  {loading ? <ActivityIndicator /> : <Text>Submit</Text>}
</TouchableOpacity>
```

---

## ✅ VALIDATION

```typescript
import { 
  validateEmail,
  validatePhone,
  validateWeight,
  validateDeclaredValue 
} from '@/utils/validation';

// Email
const result = validateEmail(email);
if (!result.isValid) console.log(result.error);

// Phone (min 8 chars, digits + +)
const result = validatePhone(phone);

// Weight (> 0, <= 100 kg)
const result = validateWeight(weight);

// Declared value (>= 0)
const result = validateDeclaredValue(value);
```

---

## 🔒 INPUT SANITIZATION

```typescript
import { sanitizeInput } from '@/utils/security';

// Remove dangerous characters
const clean = sanitizeInput(userInput);
// Removes: <>, javascript:, data:
```

---

## 📊 PUBLIC TRACKING

**Public endpoint returns ONLY:**
- Tracking number
- Status
- Origin/destination cities
- Dates
- Timeline

**NOT exposed:**
- Names
- Phone/email
- Package value

**Authenticated users see all data.**

---

## ⏱️ TIMEOUTS

- Default: 15 seconds
- Quote: 10 seconds
- Payment: 20 seconds

```typescript
// Automatic in apiClient functions
const { data, error } = await calculateQuoteWithTimeout(payload);

// Handle timeout
if (error?.message?.includes('timeout')) {
  Alert.alert('Erreur', 'La requête a expiré.');
}
```

---

## 🚨 ERROR HANDLING

```typescript
try {
  setLoading(true);
  const { data, error } = await apiCall();
  
  if (error) {
    // Specific errors
    if (error.message?.includes('timeout')) {
      Alert.alert('Erreur', 'Requête expirée');
    } else if (error.message?.includes('tentatives')) {
      Alert.alert('Erreur', 'Trop de tentatives');
    } else {
      Alert.alert('Erreur', error.message);
    }
    return;
  }
  
  // Success
  router.push('/success');
} catch (error) {
  Alert.alert('Erreur', 'Erreur inattendue');
} finally {
  setLoading(false);
}
```

---

## 🗄️ DATABASE SECURITY

**RLS Policies:**
- Users see only their own data
- Admins see all data
- Public tracking has limited access

**Tables:**
- `payment_idempotency` - Prevents duplicates
- `shipment_status_history` - Tracking timeline
- `freight_quotes` - Has `created_by_user_id`
- `shipments` - Has `created_by_user_id`

---

## 🔐 EDGE FUNCTION SECURITY

**All authenticated endpoints:**
```typescript
// Verify auth header
const authHeader = req.headers.get('Authorization');
if (!authHeader) return 401;

// Verify user
const { data: { user }, error } = await supabaseClient.auth.getUser();
if (error || !user) return 401;

// Validate input
if (!request.field) return 400;

// Sanitize input
const clean = sanitizeInput(request.field);

// Server-side calculations
const price = calculatePrice(data); // Never trust client
```

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] Configure payment provider
- [ ] Set environment variables
- [ ] Test rate limiting
- [ ] Test idempotency keys
- [ ] Verify RLS policies
- [ ] Test public tracking
- [ ] Test token expiration
- [ ] Review error messages
- [ ] Enable logging
- [ ] Set up monitoring

---

## 🆘 COMMON ISSUES

**Token Expired:**
```typescript
// Automatic refresh by Supabase
// If persists, user needs to re-login
```

**Rate Limit:**
```typescript
// Wait for time window to expire
// Or reset: rateLimiter.reset(key)
```

**Duplicate Payment:**
```typescript
// Prevented by idempotency keys
// Check payment_idempotency table
```

**Timeout:**
```typescript
// Check network
// Increase timeout if needed
```

---

## 📚 FILES

**Security Utils:**
- `utils/secureStorage.ts`
- `utils/apiClient.ts`
- `utils/trackingGenerator.ts`
- `utils/security.ts`
- `utils/validation.ts`

**Edge Functions:**
- `supabase/functions/shipments-quote/index.ts`
- `supabase/functions/shipments-create-and-pay/index.ts`
- `supabase/functions/public-tracking/index.ts`

**Screens:**
- `app/(tabs)/new-shipment.tsx`
- `app/(tabs)/shipment-summary.tsx`
- `app/(tabs)/shipment-confirmation.tsx`

---

**Quick Access:** `docs/SECURITY_IMPLEMENTATION_COMPLETE.md` for full details.
