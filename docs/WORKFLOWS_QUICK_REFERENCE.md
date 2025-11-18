
# Workflows Quick Reference Guide

Quick reference for all automated workflows in the 3S Global application.

---

## 🔄 Database Triggers (Automatic)

These workflows run automatically when database records change. No manual code required.

### Quote Paid → Shipment Creation

```sql
-- Trigger: freight_quotes.payment_status = 'paid'
-- Function: handle_quote_paid()
-- Events: quote_paid, shipment_created
```

**What it does:**
- Logs quote payment
- Creates shipment with auto-generated tracking number
- Links shipment to quote
- Logs shipment creation

**Test:**
```sql
UPDATE freight_quotes SET payment_status = 'paid' WHERE id = 'quote-id';
```

---

### Shipment Status Change

```sql
-- Trigger: shipments.current_status changes
-- Function: handle_shipment_status_change()
-- Event: shipment_status_changed
```

**What it does:**
- Logs status change with old and new values
- Updates last_update timestamp

**Test:**
```sql
UPDATE shipments SET current_status = 'in_transit' WHERE id = 'shipment-id';
```

---

### Agent Application Submitted

```sql
-- Trigger: INSERT on global_agents
-- Function: handle_agent_application_submitted()
-- Event: agent_application_submitted
```

**What it does:**
- Logs new agent application
- Includes company name and port in details

**Test:**
```typescript
// Submit form in app/(tabs)/become-agent.tsx
```

---

### Subscription Activated

```sql
-- Trigger: subscriptions.is_active = true (from false)
-- Function: handle_subscription_activated()
-- Event: subscription_activated
```

**What it does:**
- Logs subscription activation
- Includes plan type and start date

**Test:**
```sql
UPDATE subscriptions SET is_active = true WHERE id = 'subscription-id';
```

---

### Subscription Expired

```sql
-- Trigger: subscriptions.is_active = false (from true)
-- Function: handle_subscription_expired()
-- Event: subscription_expired
```

**What it does:**
- Logs subscription expiration
- Includes plan type and end date

**Test:**
```sql
UPDATE subscriptions SET is_active = false WHERE id = 'subscription-id';
```

---

## 📱 Application Code (Manual)

These workflows require manual logging in application code.

### Portal Access/Denied

```typescript
// Location: app/(tabs)/digital-portal.tsx

import { logPortalAccess, logPortalDenied } from '@/utils/eventLogger';

// On successful access
await logPortalAccess(user.id, client.id, `Subscription: ${subscription.plan_type}`);

// On denied access
await logPortalDenied(user.id, client.id, 'No active subscription');
```

---

### Service Quote Click

```typescript
// Location: Service pages

import { logServiceQuoteClick } from '@/utils/eventLogger';

await logServiceQuoteClick(
  serviceId,
  user?.id,
  client?.id,
  'User clicked from services page'
);
```

---

### Quote Created

```typescript
// Automatic via database trigger
// No manual code needed
```

---

### Quote Accepted

```typescript
// Automatic via database trigger
// No manual code needed
```

---

## 📊 Event Types Cheat Sheet

| Event Type | Trigger | Implementation |
|------------|---------|----------------|
| `quote_paid` | payment_status = 'paid' | DB Trigger |
| `shipment_created` | After quote paid | DB Trigger |
| `shipment_status_changed` | status changes | DB Trigger |
| `portal_access` | Portal page load (authorized) | App Code |
| `portal_denied` | Portal page load (denied) | App Code |
| `agent_application_submitted` | New agent record | DB Trigger |
| `subscription_activated` | is_active = true | DB Trigger |
| `subscription_expired` | is_active = false | DB Trigger |
| `quote_created` | New quote record | DB Trigger |
| `quote_accepted` | client_decision = 'accepted' | DB Trigger |
| `service_quote_click` | Button click | App Code |

---

## 🔍 Query Examples

### Get all events for a client

```typescript
const { data } = await supabase
  .from('events_log')
  .select('*')
  .eq('client_id', clientId)
  .order('created_at', { ascending: false });
```

### Get events by type

```typescript
const { data } = await supabase
  .from('events_log')
  .select('*')
  .eq('event_type', 'quote_paid')
  .order('created_at', { ascending: false });
```

### Get recent events

```typescript
const { data } = await supabase
  .from('events_log')
  .select('*')
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: false });
```

### Count events by type

```typescript
const { data } = await supabase
  .from('events_log')
  .select('event_type, count(*)')
  .group('event_type');
```

---

## 🛠️ Utility Functions

All available in `utils/eventLogger.ts`:

```typescript
// Quote events
logQuotePaid(quoteId, clientId, serviceId, details)
logQuoteCreated(quoteId, userId, clientId, details)
logQuoteRejected(quoteId, clientId, serviceId, details)

// Shipment events
logShipmentCreated(shipmentId, clientId, userId, details)
logShipmentStatusChanged(shipmentId, clientId, userId, details)

// Portal events
logPortalAccess(userId, clientId, details)
logPortalDenied(userId, clientId, details)

// Agent events
logAgentApplicationSubmitted(userId, details)
logAgentValidated(userId, details)

// Subscription events
logSubscriptionCreated(clientId, userId, details)
logSubscriptionActivated(clientId, userId, details)
logSubscriptionExpired(clientId, userId, details)

// Service events
logServiceView(serviceId, userId, clientId)
logServiceQuoteClick(serviceId, userId, clientId, details)

// Auth events
logLogin(userId, clientId)
logLogout(userId, clientId)

// Contact events
logContactSent(userId, clientId, details)
```

---

## 🧪 Testing Checklist

- [ ] Quote paid creates shipment
- [ ] Shipment status change logs event
- [ ] Portal access logs correctly
- [ ] Portal denied redirects to pricing
- [ ] Agent application logs event
- [ ] Subscription activation logs event
- [ ] Subscription expiration logs event
- [ ] All events appear in KPI dashboard
- [ ] Event details are accurate
- [ ] Timestamps are correct

---

## 🚨 Troubleshooting

### Events not logging?

1. Check trigger is enabled:
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE 'trigger_%';
```

2. Check function exists:
```sql
SELECT * FROM pg_proc WHERE proname LIKE 'handle_%';
```

3. Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'events_log';
```

### Shipment not created from paid quote?

1. Verify quote has required fields (client, origin_port, destination_port)
2. Check database logs for errors
3. Verify trigger is enabled

### Portal access not logging?

1. Check user is authenticated
2. Check client exists
3. Check subscription is active
4. Check console logs in browser

---

## 📞 Support

For issues:
1. Check this guide
2. Review `docs/COMPLETE_WORKFLOWS_IMPLEMENTATION.md`
3. Check `utils/eventLogger.ts`
4. Review database trigger functions
5. Contact development team

---

**Quick Tip:** All database triggers use `SECURITY DEFINER` and run automatically. Application code events require manual logging using the utility functions.

**Last Updated:** 2024-01-18
