
# PayPal Quote Payment - Quick Reference Guide

## 🚀 Quick Start

### For Developers

1. **Environment Variables** (already configured):
   ```bash
   PAYPAL_ENV=sandbox
   PAYPAL_SANDBOX_CLIENT_ID=xxx
   PAYPAL_SANDBOX_SECRET=xxx
   ```

2. **Edge Functions Deployed**:
   - ✅ `create-paypal-order`
   - ✅ `capture-paypal-order`
   - ✅ `health-check` (updated)

3. **Client Screens Updated**:
   - ✅ `quote-details.tsx` - Payment button
   - ✅ `payment-success.tsx` - Capture integration
   - ✅ `admin-config.tsx` - Status display

## 💳 Payment Flow (User Perspective)

1. **View Quote**: User opens quote details screen
2. **See Amount**: Quote shows validated amount (set by admin)
3. **Click Pay**: "Payer ce devis (PayPal ou carte)" button
4. **PayPal Login**: Redirected to PayPal (can pay with card or account)
5. **Confirm Payment**: Reviews and confirms on PayPal
6. **Success**: Redirected back to app with confirmation
7. **Email**: Receives confirmation email

## 🔧 Admin Workflow

### Setting Up a Quote for Payment

1. **Admin receives quote request** (from client)
2. **Admin calculates price** (based on cargo, route, etc.)
3. **Admin updates quote in database**:
   ```sql
   UPDATE freight_quotes
   SET 
     quote_amount = 1500.00,
     quote_currency = 'EUR',
     status = 'priced',
     payment_status = 'unpaid'
   WHERE id = 'quote_id';
   ```
4. **Client sees payment button** (automatically)
5. **Client pays** (via PayPal)
6. **Admin receives email notification** (automatic)
7. **Admin processes shipment** (quote status = 'paid')

## 📊 Quote Status Flow

```
received → in_progress → sent_to_client → priced → payment_pending → paid
                                            ↓
                                      [Payment Button]
```

### Status Meanings:

- **received**: Quote request received
- **in_progress**: Admin is working on quote
- **sent_to_client**: Quote sent to client (no payment yet)
- **priced**: Quote has amount, ready for payment ✅ **PAYMENT BUTTON SHOWS**
- **payment_pending**: PayPal order created, awaiting payment ✅ **PAYMENT BUTTON SHOWS**
- **paid**: Payment confirmed ✅ **CONFIRMATION BANNER SHOWS**

## 🎨 UI Elements

### Payment Button (when status = 'priced' or 'payment_pending')

```
┌────────────────────────────────────────────────┐
│  [💳] Payer ce devis (PayPal ou carte)        │
└────────────────────────────────────────────────┘

Le paiement est sécurisé et traité via PayPal
(vous pouvez payer par carte ou avec votre compte PayPal).
```

### Confirmation Banner (when payment_status = 'paid')

```
┌────────────────────────────────────────────────┐
│  ✓ Paiement confirmé                           │
│                                                 │
│  Votre demande est maintenant en cours de      │
│  traitement par USS.                           │
│                                                 │
│  Payé le 15 janvier 2025 à 14:30              │
└────────────────────────────────────────────────┘
```

## 🔍 Testing

### Test Payment Flow (Sandbox)

1. **Create test quote**:
   ```sql
   INSERT INTO freight_quotes (
     client, origin_port, destination_port,
     cargo_type, quote_amount, quote_currency,
     status, payment_status
   ) VALUES (
     'client_id', 'port_id_1', 'port_id_2',
     'Container 20DC', 1500.00, 'EUR',
     'priced', 'unpaid'
   );
   ```

2. **Open quote in app** → Payment button should appear

3. **Click payment button** → Opens PayPal sandbox

4. **Use PayPal sandbox account**:
   - Email: sb-buyer@personal.example.com
   - Password: (from PayPal sandbox)

5. **Complete payment** → Redirected to success page

6. **Verify**:
   - Quote status = 'paid'
   - Payment status = 'paid'
   - `paid_at` timestamp set
   - Emails sent

### Check System Status

1. **Open admin config screen**
2. **Look for PayPal status**:
   - ✅ Green = "Online payment is enabled (sandbox mode)"
   - ⚠️ Yellow = "Online payment temporarily unavailable"
   - ❌ Red = "Online payment is optional and disabled"

## 🐛 Troubleshooting

### Payment Button Not Showing

**Checklist:**
- [ ] Quote has `quote_amount` > 0
- [ ] Quote status is 'priced' or 'payment_pending'
- [ ] Payment status is not 'paid'
- [ ] User owns the quote

**Fix:**
```sql
-- Set quote as ready for payment
UPDATE freight_quotes
SET 
  quote_amount = 1500.00,
  status = 'priced',
  payment_status = 'unpaid'
WHERE id = 'quote_id';
```

### PayPal Order Creation Fails

**Check:**
1. Edge Function logs: `supabase functions logs create-paypal-order`
2. PayPal credentials configured
3. Network connectivity

**Common Errors:**
- "PayPal credentials not configured" → Set environment variables
- "Failed to get PayPal access token" → Check credentials
- "Quote not found" → Verify quote ID

### Capture Fails

**Check:**
1. Edge Function logs: `supabase functions logs capture-paypal-order`
2. PayPal order was approved
3. Order not already captured

**Fix:**
```sql
-- Check quote status
SELECT id, status, payment_status, paypal_order_id, paid_at
FROM freight_quotes
WHERE id = 'quote_id';

-- Reset if needed (only in development!)
UPDATE freight_quotes
SET payment_status = 'unpaid', status = 'priced'
WHERE id = 'quote_id';
```

### Emails Not Sent

**Check:**
1. SMTP credentials configured
2. Edge Function logs: `supabase functions logs send-email`
3. Email addresses valid

**Test SMTP:**
```bash
# Check health-check for SMTP status
curl https://your-project.supabase.co/functions/v1/health-check
```

## 📱 Mobile vs Web Differences

### Web
- Redirects to PayPal in same window
- Returns to success URL after payment

### Mobile (iOS/Android)
- Opens PayPal in in-app browser
- User closes browser to return to app
- App refreshes quote data automatically

## 🔐 Security Notes

### ✅ Safe to Expose:
- PayPal Client ID (public)
- Quote amounts
- Quote IDs (with ownership verification)

### ❌ Never Expose:
- PayPal Secret
- SMTP credentials
- Admin tokens

### 🛡️ Security Measures:
- All sensitive operations in Edge Functions
- User authentication verified
- Quote ownership verified
- No secrets in client code

## 📧 Email Templates

### Client Confirmation Email

**Subject:** Paiement confirmé - Devis #XXXXXXXX

**Content:**
- Payment confirmation
- Quote details (origin, destination, cargo, amount)
- Next steps
- Contact information

### Admin Notification Email

**Subject:** Nouveau paiement PayPal - Devis #XXXXXXXX

**Content:**
- Payment notification
- Full quote details
- Client information
- PayPal order ID
- Action required reminder

## 🚦 Status Indicators

### Quote Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| received | 🟡 Orange | New quote request |
| in_progress | 🔵 Blue | Admin working on it |
| priced | 🔵 Blue | Ready for payment |
| payment_pending | 🔵 Blue | Payment in progress |
| paid | 🟢 Green | Payment confirmed |
| cancelled | 🔴 Red | Cancelled |

### Payment Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| pending | 🟡 Orange | Awaiting action |
| unpaid | 🟡 Orange | Not paid yet |
| processing | 🔵 Blue | Payment in progress |
| paid | 🟢 Green | Payment confirmed |
| failed | 🔴 Red | Payment failed |

## 🎯 Key Files

### Client-Side
- `app/(tabs)/quote-details.tsx` - Payment button & flow
- `app/(tabs)/payment-success.tsx` - Capture & confirmation
- `app/(tabs)/payment-cancel.tsx` - Cancellation handling
- `app/(tabs)/admin-config.tsx` - System status

### Server-Side
- `supabase/functions/create-paypal-order/index.ts` - Create order
- `supabase/functions/capture-paypal-order/index.ts` - Capture payment
- `supabase/functions/health-check/index.ts` - System status
- `supabase/functions/send-email/index.ts` - Email notifications

### Database
- `freight_quotes` table - Quote & payment data

## 📞 Support

### For Users
- Contact: contact@universal-shippingservices.com
- Support screen in app

### For Developers
- Check Edge Function logs
- Review PayPal dashboard
- Check Supabase logs

---

**Last Updated:** January 2025  
**Quick Reference Version:** 1.0
