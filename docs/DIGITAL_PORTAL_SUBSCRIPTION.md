
# Digital Portal Subscription Implementation

## Overview
This document describes the implementation of the new "Digital Maritime Portal" subscription plan and its access control logic.

## Database Changes

### New Plan Type: `digital_portal`

A new plan type has been added to the `plan_type` enum in the `subscriptions` table:

```sql
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'digital_portal';
```

**Plan Details:**
- **plan_type**: `digital_portal`
- **Label**: Digital Maritime Portal
- **Description**: Accès complet à la plateforme digitale : tracking avancé, docs, reporting, API…
- **Default is_active**: `false`
- **Price**: To be configured as needed

## Access Control Policy

### Portal Access Logic

The digital portal is accessible **only if** the following conditions are met:

```typescript
subscription.plan_type IN ("premium_tracking", "enterprise_logistics", "digital_portal")
AND subscription.is_active = true
AND subscription.status = 'active'
```

This logic is implemented in the `useSubscriptionAccess` hook.

## Implementation Details

### 1. Database Migration

**Migration**: `add_digital_portal_plan_type`

- Adds `digital_portal` to the `plan_type` enum
- Adds documentation comment to the enum type

### 2. TypeScript Types

**File**: `app/integrations/supabase/types.ts`

Updated the `plan_type` enum to include:
```typescript
plan_type: "basic" | "premium_tracking" | "enterprise_logistics" | "agent_listing" | "digital_portal"
```

### 3. Access Control Hook

**File**: `hooks/useSubscriptionAccess.ts`

The hook now provides:

```typescript
interface SubscriptionAccess {
  hasActiveSubscription: boolean;
  hasPremiumTracking: boolean;
  hasEnterpriseLogistics: boolean;
  hasAgentListing: boolean;
  hasDigitalPortal: boolean;           // NEW: Specific to digital_portal plan
  hasDigitalPortalAccess: boolean;     // NEW: Calculated field for portal access
  hasFullTrackingAccess: boolean;      // Updated to include digital_portal
  subscription: Subscription | null;
  loading: boolean;
  refresh: () => Promise<void>;
}
```

**Key Properties:**

- `hasDigitalPortal`: Returns `true` if the user has an active `digital_portal` subscription
- `hasDigitalPortalAccess`: Returns `true` if the user has access to the portal (premium_tracking, enterprise_logistics, OR digital_portal)
- `hasFullTrackingAccess`: Returns `true` if the user has full tracking capabilities (same as portal access)

## Usage Examples

### Checking Portal Access in Components

```typescript
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

function PortalFeature() {
  const { hasDigitalPortalAccess, loading } = useSubscriptionAccess();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!hasDigitalPortalAccess) {
    return (
      <View>
        <Text>Access Denied</Text>
        <Text>You need a Premium Tracking, Enterprise Logistics, or Digital Portal subscription.</Text>
      </View>
    );
  }

  return <PortalContent />;
}
```

### Checking Specific Plan Type

```typescript
function DigitalPortalExclusiveFeature() {
  const { hasDigitalPortal, loading } = useSubscriptionAccess();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!hasDigitalPortal) {
    return <Text>This feature requires a Digital Portal subscription.</Text>;
  }

  return <ExclusiveContent />;
}
```

## Creating a Digital Portal Subscription

To create a new digital portal subscription for a client (e.g., in the admin panel):

```typescript
const { data, error } = await supabase
  .from('subscriptions')
  .insert({
    client: clientId,
    plan_type: 'digital_portal',
    start_date: new Date().toISOString().split('T')[0],
    end_date: null, // or set an expiration date
    is_active: true,
    status: 'active',
    notes: 'Digital Maritime Portal - Full access'
  });
```

## Plan Comparison

| Plan Type | Portal Access | Full Tracking | Agent Listing | Price |
|-----------|---------------|---------------|---------------|-------|
| basic | ❌ | ❌ | ❌ | Low |
| premium_tracking | ✅ | ✅ | ❌ | Medium |
| enterprise_logistics | ✅ | ✅ | ❌ | High |
| agent_listing | ❌ | ❌ | ✅ | Variable |
| digital_portal | ✅ | ✅ | ❌ | Premium |

## Security Considerations

1. **Row Level Security (RLS)**: The `subscriptions` table has RLS enabled. Ensure policies allow:
   - Users to read their own subscriptions
   - Admins to manage all subscriptions

2. **Client-Side Validation**: The `useSubscriptionAccess` hook provides client-side access control, but always validate on the server side for sensitive operations.

3. **Status Checks**: Always check both `is_active` and `status` fields:
   - `is_active`: Boolean flag for quick enable/disable
   - `status`: More granular state (pending, active, cancelled, expired)

## Future Enhancements

Consider implementing:

1. **Subscription Tiers**: Different levels within digital_portal (Basic, Pro, Enterprise)
2. **Feature Flags**: Granular control over specific features within the portal
3. **Usage Limits**: API call limits, storage quotas, etc.
4. **Trial Periods**: Temporary access to digital_portal features
5. **Subscription Upgrades**: Smooth transition between plan types

## Testing

To test the implementation:

1. Create a test client
2. Create a subscription with `plan_type = 'digital_portal'`
3. Set `is_active = true` and `status = 'active'`
4. Use the `useSubscriptionAccess` hook in a component
5. Verify that `hasDigitalPortalAccess` returns `true`
6. Test with other plan types to ensure proper access control

## Related Files

- `app/integrations/supabase/types.ts` - TypeScript type definitions
- `hooks/useSubscriptionAccess.ts` - Access control hook
- `app/(tabs)/admin-dashboard.tsx` - Admin interface for managing subscriptions
- `app/(tabs)/client-dashboard.tsx` - Client portal (requires portal access)
- `docs/SUBSCRIPTION_ACCESS_CONTROL.md` - General subscription documentation
