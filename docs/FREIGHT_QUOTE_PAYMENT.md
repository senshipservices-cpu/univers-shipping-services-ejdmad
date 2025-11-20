
# Freight Quote Payment Implementation

## Overview

This document describes the implementation of the freight quote payment system using Stripe Checkout. Clients can pay for their freight quotes directly from the quote details page.

## Database Schema

### freight_quotes Table Updates

The `freight_quotes` table has been updated with the following fields:

- **quote_amount** (numeric): The final quoted amount for the service
- **quote_currency** (text): Currency for the quote (EUR, USD, etc.) - defaults to 'EUR'
- **payment_status** (text): Payment status with the following possible values:
  - `unpaid`: Quote has not been paid yet
  - `pending`: Legacy status (updated to 'unpaid' for quotes with amounts)
  - `processing`: Payment is being processed
  - `paid`: Quote has been successfully paid
  - `failed`: Payment failed
  - `refunded`: Payment was refunded
- **stripe_payment_intent_id** (text): Stripe Payment Intent ID or Checkout Session ID for tracking payments
- **can_pay_online** (boolean): Whether this quote can be paid online - defaults to false

### Indexes

The following indexes have been added for performance:

```sql
CREATE INDEX idx_freight_quotes_payment_status ON freight_quotes(payment_status);
CREATE INDEX idx_freight_quotes_stripe_payment_intent ON freight_quotes(stripe_payment_intent_id) 
  WHERE stripe_payment_intent_id IS NOT NULL;
```

## Payment Flow

### 1. Quote Details Page

**File**: `app/(tabs)/quote-details.tsx`

The quote details page displays:

- Quote reference number
- Quote status and payment status
- Quote amount (if available)
- Route information (origin and destination ports)
- Cargo details (type, volume, incoterm, desired ETA)
- Creation and update dates
- "Pay this Quote" button (if payment_status = 'unpaid' and quote_amount > 0)

### 2. Payment Authorization

When the user clicks "Pay this Quote":

1. **Ownership Verification**: The system verifies that the logged-in user is the owner of the quote by checking if `quote.client` matches the user's client ID.

2. **Payment Conditions Check**:
   - Quote must not already be paid (`payment_status !== 'paid'`)
   - Quote must have a valid amount (`quote_amount > 0`)

### 3. Stripe Checkout Session Creation

**Edge Function**: `create-checkout-session`

The Edge Function handles both pricing plan payments and freight quote payments:

```typescript
// Request body for freight quote payment
{
  quote_id: string,
  context: 'freight_quote'
}
```

**Process**:

1. Authenticate the user
2. Fetch the freight quote from the database
3. Verify ownership (client_id matches user's client)
4. Check quote amount and payment status
5. Update payment_status to 'processing'
6. Create Stripe Checkout session with:
   - Mode: 'payment' (one-time payment)
   - Amount: quote_amount
   - Currency: quote_currency
   - Description: "Devis #[quote_id] – Universal Shipping Services"
   - Metadata: quote_id, user_id, context='freight_quote'
7. Update quote with stripe_payment_intent_id
8. Return checkout session URL

### 4. Stripe Checkout Redirection

- **Web**: User is redirected to Stripe Checkout page via `window.location.href`
- **Mobile**: Alert is shown with option to open payment URL (can be enhanced with WebView or deep linking)

### 5. Post-Payment Handling

After successful payment (handled by Stripe webhook - to be implemented):

1. Update `payment_status` to 'paid'
2. Optionally create a shipment record from the quote (if shipment module is active)

**Success URL**: `/payment-success?session_id={CHECKOUT_SESSION_ID}&context=freight_quote`
**Cancel URL**: `/payment-cancel?context=freight_quote`

## Client Dashboard Integration

**File**: `app/(tabs)/client-dashboard.tsx`

The client dashboard has been updated to:

- Display payment status badges on quote cards
- Show a chevron icon for unpaid quotes (indicating they can be clicked)
- Navigate to quote details page when a quote card is clicked

## Security Considerations

### Row Level Security (RLS)

The `freight_quotes` table has RLS enabled. Ensure the following policies are in place:

```sql
-- Clients can view their own quotes
CREATE POLICY "Clients can view their own quotes" 
ON freight_quotes FOR SELECT 
USING (
  client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);

-- Admins can view all quotes
CREATE POLICY "Admins can view all quotes" 
ON freight_quotes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE user_id = auth.uid() 
    AND (is_super_admin = true OR admin_option = true)
  )
);
```

### Payment Authorization

- User authentication is required (JWT verification)
- Ownership verification ensures users can only pay for their own quotes
- Payment status checks prevent double payments

## Testing

### Test Scenarios

1. **Successful Payment Flow**:
   - Create a quote with a valid amount
   - Set payment_status to 'unpaid'
   - Navigate to quote details
   - Click "Pay this Quote"
   - Complete payment on Stripe Checkout
   - Verify payment_status updates to 'paid'

2. **Unauthorized Access**:
   - Try to pay for a quote owned by another user
   - Verify 403 Forbidden error is returned

3. **Invalid Quote**:
   - Try to pay for a quote without an amount
   - Verify appropriate error message is shown

4. **Already Paid Quote**:
   - Try to pay for a quote that's already paid
   - Verify error message is shown

5. **Payment Cancellation**:
   - Start payment process
   - Cancel on Stripe Checkout page
   - Verify user is redirected to cancel page
   - Verify payment_status remains 'processing' or reverts to 'unpaid'

### Test Data

Use Stripe test mode with test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Future Enhancements

### Webhook Implementation

Create a Stripe webhook handler to:

1. Listen for `checkout.session.completed` events
2. Update payment_status to 'paid'
3. Create shipment record from quote
4. Send confirmation email to client
5. Log payment event

### Mobile Payment Experience

Enhance mobile payment flow with:

- In-app WebView for Stripe Checkout
- Deep linking for return URLs
- Native payment sheet integration (Apple Pay, Google Pay)

### Payment History

Add a payment history section to:

- Display all payment transactions
- Show payment receipts
- Allow downloading invoices

### Partial Payments

Support partial payments for large quotes:

- Allow clients to pay in installments
- Track payment progress
- Send reminders for pending payments

## API Reference

### Edge Function: create-checkout-session

**Endpoint**: `POST /functions/v1/create-checkout-session`

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body** (Freight Quote Payment):
```json
{
  "quote_id": "uuid",
  "context": "freight_quote"
}
```

**Response** (Success):
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Response** (Error):
```json
{
  "error": "Error message"
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (missing parameters, invalid quote)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not quote owner)
- `404`: Quote not found
- `500`: Server error

## Environment Variables

Required environment variables for Stripe integration:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase (for Edge Functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

## Related Documentation

- [Stripe Payment Integration](./STRIPE_PAYMENT_INTEGRATION.md)
- [Stripe Setup Checklist](./STRIPE_SETUP_CHECKLIST.md)
- [Client Dashboard Implementation](./CLIENT_DASHBOARD_IMPLEMENTATION.md)
- [Freight Quote Creation Workflow](./FREIGHT_QUOTE_CREATION_WORKFLOW.md)
