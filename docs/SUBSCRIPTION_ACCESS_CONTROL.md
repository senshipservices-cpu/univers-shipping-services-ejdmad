
# Subscription & Access Control Implementation

## Overview
This document describes the implementation of subscription plans and access control for the UNIVERSAL SHIPPING SERVICES (3S Global) application.

## Database Schema

### Subscriptions Table
The `subscriptions` table has been extended with a `status` field to support the subscription lifecycle:

- **status**: `pending`, `active`, `cancelled`, `expired`
  - `pending`: Subscription request created, awaiting payment confirmation
  - `active`: Subscription is active and user has full access
  - `cancelled`: Subscription was cancelled by user or admin
  - `expired`: Subscription period has ended

### Plan Types
The application supports four plan types (enum `plan_type`):

1. **basic**: Free plan with limited access
2. **premium_tracking**: €49/month - Full tracking access + digital portal
3. **enterprise_logistics**: €99/month - All premium features + advanced reporting
4. **agent_listing**: €99/year - Agent visibility on platform

## Access Control Logic

### Digital Portal Access
Users with `premium_tracking` OR `enterprise_logistics` active subscriptions have full access to:
- Complete shipment tracking
- Digital portal dashboard
- Real-time notifications
- Priority support

### Basic Mode (No Active Subscription)
Users without an active subscription have limited access:
- View basic service information
- Request quotes
- Contact support
- Limited shipment visibility (no detailed tracking)

## Implementation Components

### 1. Subscription Confirmation Page (`subscription-confirm.tsx`)
- Displays plan details and features
- Creates subscription in `pending` status
- Calculates start/end dates based on billing period
- Shows confirmation message to user
- Redirects to client dashboard after confirmation

### 2. Updated Pricing Page (`pricing.tsx`)
- **Basic Plan**: Redirects to client space or dashboard
- **Premium Tracking**: Redirects to `subscription-confirm` page
- **Enterprise Logistics**: Redirects to contact page
- **Agent Listing**: Redirects to become-agent page

### 3. Subscription Access Hook (`useSubscriptionAccess.ts`)
Custom React hook that provides:
- `hasActiveSubscription`: Boolean indicating if user has any active subscription
- `hasPremiumTracking`: Boolean for premium_tracking plan
- `hasEnterpriseLogistics`: Boolean for enterprise_logistics plan
- `hasAgentListing`: Boolean for agent_listing plan
- `hasDigitalPortalAccess`: Boolean (premium OR enterprise)
- `hasFullTrackingAccess`: Boolean (premium OR enterprise)
- `subscription`: Current active subscription object
- `loading`: Loading state
- `refresh()`: Function to reload subscription data

### 4. Updated Client Dashboard (`client-dashboard.tsx`)
- Shows subscription status prominently
- Displays access features based on subscription
- Shows upgrade prompt for basic users
- Implements access control for shipment details
- Displays lock badges on limited features

### 5. Updated Global Services Page (`global-services.tsx`)
- Checks digital portal access for "portal" CTA type
- Shows appropriate alerts for unauthenticated or non-subscribed users
- Redirects to pricing page if access is denied

## User Flows

### Subscription Purchase Flow
1. User browses pricing page
2. Clicks "Subscribe" on Premium or Enterprise plan
3. Redirected to subscription confirmation page
4. Reviews plan details and confirms
5. Subscription created in `pending` status
6. User receives confirmation message
7. Admin processes payment manually
8. Admin updates subscription status to `active`
9. User gains full access to features

### Access Control Flow
1. User attempts to access protected feature
2. App checks subscription status via `useSubscriptionAccess` hook
3. If no active subscription:
   - Show alert with upgrade prompt
   - Redirect to pricing page
4. If active subscription with required plan:
   - Grant access to feature

### Digital Portal Access Flow
1. User clicks "Access Portal" on Digital Maritime Solutions service
2. App checks if user is authenticated
3. If not authenticated: Prompt to login
4. If authenticated: Check subscription access
5. If no digital portal access: Show upgrade prompt
6. If has access: Redirect to client dashboard

## RLS Policies
The subscriptions table has Row Level Security (RLS) enabled with the following policies:
- Clients can view their own subscriptions
- Clients can insert their own subscriptions
- Clients can update their own subscriptions
- Clients can delete their own subscriptions

All policies verify that the subscription belongs to a client record linked to the authenticated user.

## Future Enhancements

### Payment Integration
- Integrate with Stripe or other payment provider
- Automatic subscription activation upon payment
- Recurring billing automation
- Invoice generation

### Subscription Management
- Self-service subscription cancellation
- Plan upgrades/downgrades
- Proration for plan changes
- Subscription renewal reminders

### Advanced Features
- Trial periods
- Promotional codes/discounts
- Multi-user accounts (for enterprise)
- Usage-based billing
- Custom enterprise plans

## Testing Checklist

- [ ] Create subscription in pending status
- [ ] Verify access control for non-subscribed users
- [ ] Verify full access for premium_tracking users
- [ ] Verify full access for enterprise_logistics users
- [ ] Test digital portal access restrictions
- [ ] Test shipment tracking access restrictions
- [ ] Verify upgrade prompts display correctly
- [ ] Test subscription status display on dashboard
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Test all plan button redirects on pricing page

## Notes

- Subscriptions are currently created in `pending` status and require manual activation by admin
- Payment processing is simulated and needs to be integrated with a real payment provider
- The `is_active` field should be set to `true` when status is `active`
- End dates are calculated automatically based on billing period (monthly or yearly)
- The system supports multiple subscriptions per client, but only the most recent active one is used
