
# Subscription Field Protection - BLOC 5-C PARTIE 2

## Overview

This document describes the implementation of field protection for sensitive subscription and shipment data in the Universal Shipping Services application.

## Protected Fields

The following fields are protected from modification by standard users in the UI:

### Subscriptions Table
- `is_active` - Only admins can activate/deactivate subscriptions
- `end_date` - Only admins can modify subscription end dates
- `status` - Only admins can change subscription status

### Freight Quotes Table
- `status` - Only admins can change quote status (received, in_progress, sent_to_client, accepted, refused)
- `quote_amount` - Only admins can set the quoted amount
- `payment_status` - Only admins can update payment status

### Shipments Table
- `current_status` - Only admins can update shipment status (draft, quote_pending, confirmed, in_transit, at_port, delivered, on_hold, cancelled)

## Implementation Strategy

### 1. Client-Side Protection

All forms and UI components that display these fields should:

- **Display fields as read-only** for non-admin users
- **Hide edit buttons** for protected fields from non-admin users
- **Show informational messages** explaining that only admins can modify these fields

Example implementation:

```typescript
import { useAdmin } from '@/contexts/AdminContext';

function SubscriptionForm() {
  const { currentUserIsAdmin } = useAdmin();
  
  return (
    <View>
      {/* is_active field - read-only for non-admins */}
      <View>
        <Text>Status: {subscription.is_active ? 'Active' : 'Inactive'}</Text>
        {currentUserIsAdmin && (
          <Switch
            value={subscription.is_active}
            onValueChange={handleToggleActive}
          />
        )}
        {!currentUserIsAdmin && (
          <Text style={styles.infoText}>
            Seuls les administrateurs peuvent modifier ce champ
          </Text>
        )}
      </View>
    </View>
  );
}
```

### 2. Server-Side Protection (Supabase RLS)

Row Level Security (RLS) policies must be configured in Supabase to enforce field-level protection:

#### Subscriptions Table RLS

```sql
-- Allow users to read their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid() OR client IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  ));

-- Allow users to insert subscriptions (but not set is_active or status)
CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    is_active = false AND
    status = 'pending'
  );

-- Only admins can update sensitive fields
CREATE POLICY "Only admins can update subscription status"
  ON subscriptions FOR UPDATE
  USING (
    -- Check if user is admin
    EXISTS (
      SELECT 1 FROM clients
      WHERE user_id = auth.uid()
      AND (is_super_admin = true OR admin_option = true)
    )
  );
```

#### Freight Quotes Table RLS

```sql
-- Allow users to read their own quotes
CREATE POLICY "Users can view their own quotes"
  ON freight_quotes FOR SELECT
  USING (
    client IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    ) OR
    client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow users to create quotes (but not set status or quote_amount)
CREATE POLICY "Users can create quotes"
  ON freight_quotes FOR INSERT
  WITH CHECK (
    status = 'received' AND
    quote_amount IS NULL
  );

-- Only admins can update quote status and amounts
CREATE POLICY "Only admins can update quote details"
  ON freight_quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE user_id = auth.uid()
      AND (is_super_admin = true OR admin_option = true)
    )
  );
```

#### Shipments Table RLS

```sql
-- Allow users to read their own shipments
CREATE POLICY "Users can view their own shipments"
  ON shipments FOR SELECT
  USING (
    client IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Users cannot create shipments directly (only through quote acceptance)
CREATE POLICY "Users cannot create shipments"
  ON shipments FOR INSERT
  WITH CHECK (false);

-- Only admins can update shipment status
CREATE POLICY "Only admins can update shipment status"
  ON shipments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE user_id = auth.uid()
      AND (is_super_admin = true OR admin_option = true)
    )
  );
```

### 3. Admin-Only Pages

The following pages should be protected and only accessible to admins:

- `admin-dashboard.tsx` - Admin dashboard
- `admin-agent-details.tsx` - Agent management
- `admin-quote-details.tsx` - Quote management
- `admin-shipment-details.tsx` - Shipment management
- `admin-subscription-details.tsx` - Subscription management

Protection is implemented using the `ProtectedRoute` component:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin>
      {/* Admin dashboard content */}
    </ProtectedRoute>
  );
}
```

### 4. Edge Functions for Sensitive Operations

Sensitive operations should be performed via Supabase Edge Functions with proper authentication:

#### Activate Subscription Edge Function

```typescript
// supabase/functions/activate-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Get user from auth header
  const authHeader = req.headers.get('Authorization');
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '') ?? ''
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if user is admin
  const { data: client } = await supabase
    .from('clients')
    .select('is_super_admin, admin_option')
    .eq('user_id', user.id)
    .single();

  if (!client?.is_super_admin && !client?.admin_option) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get subscription ID from request
  const { subscriptionId } = await req.json();

  // Update subscription (using service role key)
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      is_active: true,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## Testing Checklist

### Client-Side Protection
- [ ] Non-admin users cannot see edit buttons for protected fields
- [ ] Protected fields are displayed as read-only for non-admin users
- [ ] Informational messages are shown explaining admin-only access

### Server-Side Protection
- [ ] Non-admin users cannot update `subscriptions.is_active` via API
- [ ] Non-admin users cannot update `subscriptions.end_date` via API
- [ ] Non-admin users cannot update `freight_quotes.status` via API
- [ ] Non-admin users cannot update `shipments.current_status` via API
- [ ] Admin users can update all protected fields

### Admin Pages
- [ ] Non-admin users are redirected when accessing admin pages
- [ ] Admin users can access all admin pages
- [ ] Admin pages display proper error messages for unauthorized access

### Edge Functions
- [ ] Edge functions verify user authentication
- [ ] Edge functions verify admin status before sensitive operations
- [ ] Edge functions return proper error codes (401, 403, 500)

## Security Best Practices

1. **Never trust client-side validation** - Always enforce security on the server
2. **Use RLS policies** - Supabase RLS provides database-level security
3. **Implement admin checks** - Verify admin status in both UI and backend
4. **Audit sensitive operations** - Log all changes to protected fields
5. **Use service role key carefully** - Only use in Edge Functions, never expose to client

## Related Documentation

- [ADMIN_SECURITY_IMPLEMENTATION.md](./ADMIN_SECURITY_IMPLEMENTATION.md)
- [SECURITY_ADMIN_ROLES_IMPLEMENTATION.md](./SECURITY_ADMIN_ROLES_IMPLEMENTATION.md)
- [SUBSCRIPTION_MANAGEMENT_MODULE.md](./SUBSCRIPTION_MANAGEMENT_MODULE.md)
