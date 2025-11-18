
# Digital Portal Implementation

## Overview
This document describes the implementation of the `digital_portal` page with subscription-based access control for the Univers Shipping Services application.

## Features Implemented

### 1. Digital Portal Page (`app/(tabs)/digital-portal.tsx`)
A private page accessible only to authenticated users with valid subscriptions.

**Access Requirements:**
- User must be logged in
- User must have an active subscription with one of these plan types:
  - `premium_tracking`
  - `enterprise_logistics`
  - `digital_portal`

**Key Features:**
- Welcome section with subscription badge
- Portal features grid (Advanced Tracking, Documents & Reports, Analytics, API Access)
- Quick actions (New Quote, Contact Support)
- Resources section (User Guide, API Docs, Technical Support)
- Info banner for upcoming features

### 2. Access Control Logic

**Authentication Check:**
```typescript
if (!user) {
  // Redirect to client-space (login page)
  return <Redirect href="/(tabs)/client-space" />;
}
```

**Subscription Check:**
```typescript
useEffect(() => {
  if (!subscriptionLoading) {
    setIsCheckingAccess(false);
    
    // Redirect to pricing if no access
    if (user && client && !hasDigitalPortalAccess) {
      router.replace('/(tabs)/pricing?highlight=digital_portal');
    }
  }
}, [user, client, hasDigitalPortalAccess, subscriptionLoading]);
```

### 3. Pricing Page Enhancement

**Highlight Parameter:**
When users are redirected from the digital portal, the pricing page receives a `highlight=digital_portal` parameter.

**Visual Indicators:**
- Access banner at the top explaining the requirement
- Highlighted border on Premium and Enterprise plans
- Enhanced visual emphasis on eligible plans

**Implementation:**
```typescript
const params = useLocalSearchParams();
const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);

useEffect(() => {
  if (params.highlight) {
    setHighlightedPlan(params.highlight as string);
  }
}, [params.highlight]);
```

### 4. Translations

Added complete translations for the digital portal in all supported languages (FR, EN, ES, AR):

**French Example:**
```typescript
digitalPortal: {
  title: 'Portail Digital Maritime',
  welcomeTitle: 'Bienvenue sur votre Portail Digital',
  welcomeSubtitle: 'Accédez à tous vos outils de gestion maritime et logistique en un seul endroit.',
  // ... more translations
}
```

### 5. Navigation Integration

Updated `app/(tabs)/_layout.tsx` to include the digital portal route:
```typescript
<Stack.Screen key="digital-portal" name="digital-portal" />
```

## User Flow

### Scenario 1: User with Valid Subscription
1. User navigates to `/digital-portal`
2. System checks authentication → ✅ Logged in
3. System checks subscription → ✅ Has valid plan
4. User sees the digital portal with all features

### Scenario 2: User without Subscription
1. User navigates to `/digital-portal`
2. System checks authentication → ✅ Logged in
3. System checks subscription → ❌ No valid plan
4. User is redirected to `/pricing?highlight=digital_portal`
5. Pricing page shows access banner and highlights eligible plans

### Scenario 3: User Not Logged In
1. User navigates to `/digital-portal`
2. System checks authentication → ❌ Not logged in
3. User is redirected to `/client-space` (login page)

## Subscription Access Hook

The `useSubscriptionAccess` hook provides the access control logic:

```typescript
const {
  hasDigitalPortalAccess,  // Boolean: true if user has access
  loading,                  // Boolean: true while checking
  subscription,             // Object: subscription details
} = useSubscriptionAccess();
```

**Access Policy:**
```typescript
const hasDigitalPortalAccess = hasActiveSubscription && (
  subscription.plan_type === 'premium_tracking' ||
  subscription.plan_type === 'enterprise_logistics' ||
  subscription.plan_type === 'digital_portal'
);
```

## Database Schema

The subscription access is based on the `subscriptions` table:

```sql
subscriptions {
  id: uuid
  client: uuid (FK to clients)
  plan_type: enum ('premium_tracking', 'enterprise_logistics', 'digital_portal', ...)
  is_active: boolean
  status: string ('active', 'pending', 'cancelled', 'expired')
  start_date: timestamp
  end_date: timestamp (nullable)
}
```

## Security Considerations

1. **Client-Side Validation:** The page checks access on mount and redirects if necessary
2. **Server-Side Validation:** All API calls should also validate subscription access
3. **Real-Time Updates:** The subscription status is checked on every page load
4. **Graceful Degradation:** Loading states prevent flickering during access checks

## Future Enhancements

Potential improvements for the digital portal:

1. **Feature Modules:**
   - Document management system
   - Advanced analytics dashboard
   - API key management
   - Multi-site management

2. **Access Control:**
   - Role-based permissions within the portal
   - Feature-level access control
   - Usage limits based on plan type

3. **User Experience:**
   - Onboarding tour for new users
   - Contextual help and tooltips
   - Customizable dashboard layouts

## Testing Checklist

- [ ] User without subscription is redirected to pricing
- [ ] User with premium_tracking can access portal
- [ ] User with enterprise_logistics can access portal
- [ ] User with digital_portal plan can access portal
- [ ] Unauthenticated user is redirected to login
- [ ] Pricing page shows highlight banner when redirected
- [ ] Premium and Enterprise plans are visually highlighted
- [ ] All translations are displayed correctly
- [ ] Loading states work properly
- [ ] Navigation between pages works smoothly

## Related Files

- `app/(tabs)/digital-portal.tsx` - Main portal page
- `app/(tabs)/pricing.tsx` - Pricing page with highlight support
- `hooks/useSubscriptionAccess.ts` - Subscription access logic
- `i18n/translations.ts` - Translations for all languages
- `app/(tabs)/_layout.tsx` - Navigation configuration
- `contexts/AuthContext.tsx` - Authentication context
- `app/integrations/supabase/types.ts` - Database types

## Conclusion

The digital portal implementation provides a secure, subscription-based access control system that:
- Protects premium features behind subscription plans
- Provides clear user feedback and guidance
- Integrates seamlessly with the existing authentication system
- Supports multiple subscription tiers
- Offers a smooth user experience with proper loading states and redirects
