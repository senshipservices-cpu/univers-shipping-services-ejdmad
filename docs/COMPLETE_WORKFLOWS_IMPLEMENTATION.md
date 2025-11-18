
# Complete Workflows Implementation

This document describes all the automated workflows implemented in the 3S Global application for event tracking and automation.

## Overview

All workflows automatically log events to the `events_log` table for analytics and monitoring purposes. The workflows are implemented using:

1. **Database Triggers** - For automatic event logging on database changes
2. **Application Code** - For user interaction events
3. **Edge Functions** - For scheduled tasks and external integrations

---

## Implemented Workflows

### 2.1 Service Quote Click

**Trigger:** User clicks "Demander un devis" button

**Implementation:** Application code in service pages

**Event Logged:**
- `event_type`: `service_quote_click`
- `user_id`: Current user (if authenticated)
- `service_id`: Service being quoted
- `client_id`: Client ID (if authenticated)
- `details`: Additional context

**Location:** Various service pages using `logServiceQuoteClick()` from `utils/eventLogger.ts`

---

### 2.2 Freight Quote Creation

**Trigger:** New freight quote is created in the database

**Implementation:** Database trigger `trigger_freight_quote_created`

**Event Logged:**
- `event_type`: `quote_created`
- `quote_id`: ID of the created quote
- `client_id`: Client who created the quote
- `service_id`: Service being quoted
- `details`: Quote details (origin, destination, cargo type)

**Database Function:** `handle_freight_quote_created()`

---

### 2.3 Quote Accepted

**Trigger:** `freight_quotes.client_decision` changes to `accepted`

**Implementation:** Database trigger `trigger_quote_accepted`

**Event Logged:**
- `event_type`: `quote_accepted`
- `quote_id`: ID of the accepted quote
- `client_id`: Client who accepted
- `service_id`: Service being quoted
- `details`: Quote amount and currency

**Database Function:** `handle_quote_accepted()`

---

### 2.4 Quote Paid → Shipment Creation

**Trigger:** `freight_quotes.payment_status` changes to `paid`

**Implementation:** Database trigger `trigger_quote_paid`

**Actions:**
1. Log `quote_paid` event
2. Create new shipment from quote data
3. Generate unique tracking number
4. Link shipment to quote
5. Log `shipment_created` event

**Events Logged:**

**Quote Paid Event:**
- `event_type`: `quote_paid`
- `quote_id`: ID of the paid quote
- `client_id`: Client who paid
- `service_id`: Service being quoted
- `details`: Payment amount and currency

**Shipment Created Event:**
- `event_type`: `shipment_created`
- `shipment_id`: ID of the new shipment
- `client_id`: Client who owns the shipment
- `service_id`: Service being provided
- `details`: Tracking number and quote reference

**Database Function:** `handle_quote_paid()`

**Shipment Details:**
- `tracking_number`: Auto-generated (format: SHP-YYYYMMDD-XXXX)
- `current_status`: `confirmed`
- `origin_port`: From quote
- `destination_port`: From quote
- `cargo_type`: From quote
- `incoterm`: From quote
- `eta`: From quote's desired_eta

---

### 2.5 Shipment Status Change

**Trigger:** `shipments.current_status` field is modified

**Implementation:** Database trigger `trigger_shipment_status_change`

**Event Logged:**
- `event_type`: `shipment_status_changed`
- `shipment_id`: ID of the shipment
- `client_id`: Client who owns the shipment
- `details`: "Status changed from X to Y"

**Additional Actions:**
- Updates `shipments.last_update` timestamp automatically

**Database Function:** `handle_shipment_status_change()`

**Possible Status Values:**
- `draft`
- `quote_pending`
- `confirmed`
- `in_transit`
- `at_port`
- `delivered`
- `on_hold`
- `cancelled`

---

### 2.6 Digital Portal Access

**Trigger:** User loads the digital portal page

**Implementation:** Application code in `app/(tabs)/digital-portal.tsx`

**Events Logged:**

**Portal Access (Authorized):**
- `event_type`: `portal_access`
- `user_id`: Current user
- `client_id`: Client ID
- `details`: Subscription plan type

**Portal Denied (Unauthorized):**
- `event_type`: `portal_denied`
- `user_id`: Current user
- `client_id`: Client ID
- `details`: Reason for denial (e.g., "No active subscription")

**Location:** `useEffect` hook in `digital-portal.tsx` using `logPortalAccess()` and `logPortalDenied()`

**Access Requirements:**
- User must be authenticated
- Client must have an active subscription with `plan_type` in:
  - `premium_tracking`
  - `enterprise_logistics`
  - `digital_portal`

---

### 2.7 Agent Application Submitted

**Trigger:** New record inserted into `global_agents` table

**Implementation:** Database trigger `trigger_agent_application_submitted`

**Event Logged:**
- `event_type`: `agent_application_submitted`
- `user_id`: `null` (public applications)
- `client_id`: `null` (not a client)
- `details`: "Candidate: [company_name] - Port: [port_name]"

**Database Function:** `handle_agent_application_submitted()`

**Application Form:** `app/(tabs)/become-agent.tsx`

---

### 2.8 Subscription Activated

**Trigger:** `subscriptions.is_active` changes from `false` to `true`

**Implementation:** Database trigger `trigger_subscription_activated`

**Event Logged:**
- `event_type`: `subscription_activated`
- `client_id`: Client who owns the subscription
- `user_id`: User associated with the client
- `details`: Plan type and start date

**Database Function:** `handle_subscription_activated()`

**Additional Actions:**
- Email notification sent to client (via existing email automation)
- Access granted to subscription features

---

### 2.9 Subscription Expired

**Trigger:** `subscriptions.is_active` changes from `true` to `false`

**Implementation:** Database trigger `trigger_subscription_expired`

**Event Logged:**
- `event_type`: `subscription_expired`
- `client_id`: Client who owns the subscription
- `user_id`: User associated with the client
- `details`: Plan type and end date

**Database Function:** `handle_subscription_expired()`

**Additional Actions:**
- Email notification sent to client (via existing email automation)
- Access revoked from subscription features

---

## Event Types Reference

All possible event types in the system:

| Event Type | Description | Trigger |
|------------|-------------|---------|
| `service_view` | User views a service page | Manual logging |
| `service_quote_click` | User clicks quote button | Manual logging |
| `quote_created` | New freight quote created | Database trigger |
| `quote_accepted` | Client accepts a quote | Database trigger |
| `quote_rejected` | Client rejects a quote | Manual logging |
| `quote_paid` | Quote payment completed | Database trigger |
| `shipment_created` | New shipment created | Database trigger |
| `shipment_status_changed` | Shipment status updated | Database trigger |
| `portal_access` | User accesses digital portal | Manual logging |
| `portal_denied` | Portal access denied | Manual logging |
| `agent_application_submitted` | Agent application submitted | Database trigger |
| `agent_validated` | Agent application approved | Manual logging |
| `subscription_created` | New subscription created | Manual logging |
| `subscription_activated` | Subscription activated | Database trigger |
| `subscription_expired` | Subscription expired | Database trigger |
| `login` | User logs in | Manual logging |
| `logout` | User logs out | Manual logging |
| `contact_sent` | Contact form submitted | Manual logging |

---

## Database Schema

### events_log Table

```sql
CREATE TABLE events_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id),
  service_id uuid REFERENCES services_global(id),
  quote_id uuid REFERENCES freight_quotes(id),
  shipment_id uuid REFERENCES shipments(id),
  port_id uuid REFERENCES ports(id),
  details text,
  created_at timestamptz DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_events_log_event_type ON events_log(event_type);
CREATE INDEX idx_events_log_created_at ON events_log(created_at);
CREATE INDEX idx_events_log_client_id ON events_log(client_id);
CREATE INDEX idx_events_log_user_id ON events_log(user_id);
```

---

## Usage Examples

### Manual Event Logging (Application Code)

```typescript
import { logServiceQuoteClick, logPortalAccess } from '@/utils/eventLogger';

// Log service quote click
await logServiceQuoteClick(
  serviceId,
  user?.id,
  client?.id,
  'User clicked from services page'
);

// Log portal access
await logPortalAccess(
  user.id,
  client.id,
  `Subscription: ${subscription.plan_type}`
);
```

### Automatic Event Logging (Database Triggers)

Database triggers automatically log events when:
- A freight quote is created
- A quote is accepted
- A quote is paid (and creates a shipment)
- A shipment status changes
- An agent application is submitted
- A subscription is activated or expired

No manual code is required for these events.

---

## Analytics & Reporting

All events are available for analytics in the KPI Dashboard:

**Location:** `app/(tabs)/kpi-dashboard.tsx`

**Available Metrics:**
- Total events by type
- Events over time
- User activity tracking
- Service popularity
- Quote conversion rates
- Shipment status distribution
- Portal access patterns
- Subscription lifecycle tracking

**Query Example:**

```typescript
// Get all quote-related events for a client
const { data, error } = await supabase
  .from('events_log')
  .select('*')
  .eq('client_id', clientId)
  .in('event_type', ['quote_created', 'quote_accepted', 'quote_paid'])
  .order('created_at', { ascending: false });
```

---

## Testing Workflows

### Test Quote Paid → Shipment Creation

1. Create a freight quote
2. Update the quote's `payment_status` to `paid`:
   ```sql
   UPDATE freight_quotes
   SET payment_status = 'paid'
   WHERE id = 'your-quote-id';
   ```
3. Verify:
   - `quote_paid` event logged in `events_log`
   - New shipment created in `shipments` table
   - `shipment_created` event logged in `events_log`
   - Quote's `ordered_as_shipment` field updated

### Test Shipment Status Change

1. Update a shipment's status:
   ```sql
   UPDATE shipments
   SET current_status = 'in_transit'
   WHERE id = 'your-shipment-id';
   ```
2. Verify:
   - `shipment_status_changed` event logged in `events_log`
   - `last_update` timestamp updated

### Test Subscription Activation

1. Update a subscription's `is_active` field:
   ```sql
   UPDATE subscriptions
   SET is_active = true
   WHERE id = 'your-subscription-id';
   ```
2. Verify:
   - `subscription_activated` event logged in `events_log`
   - Email notification sent (check `email_notifications` table)

---

## Troubleshooting

### Events Not Being Logged

1. **Check trigger status:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE 'trigger_%';
   ```

2. **Check function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname LIKE 'handle_%';
   ```

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'events_log';
   ```

4. **Check logs:**
   ```typescript
   // In application code
   console.log('Event logged:', eventType);
   ```

### Shipment Not Created from Paid Quote

1. Verify quote has all required fields:
   - `client` (not null)
   - `origin_port` (not null)
   - `destination_port` (not null)

2. Check database logs for errors:
   ```sql
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   ```

3. Verify trigger is enabled:
   ```sql
   SELECT tgenabled FROM pg_trigger WHERE tgname = 'trigger_quote_paid';
   ```

---

## Security Considerations

### RLS Policies

All tables have Row Level Security (RLS) enabled:

- **events_log**: Users can only view their own events or events related to their client
- **shipments**: Clients can only view their own shipments
- **freight_quotes**: Clients can only view their own quotes
- **subscriptions**: Clients can only view their own subscriptions

### Trigger Security

All trigger functions use `SECURITY DEFINER` to ensure they run with the necessary permissions, but they:
- Validate data before inserting
- Only log events for valid records
- Do not expose sensitive information in event details

---

## Future Enhancements

Potential workflow additions:

1. **Quote Rejected Workflow**
   - Log when client rejects a quote
   - Send notification to admin

2. **Agent Validated Workflow**
   - Log when admin validates an agent application
   - Send welcome email to agent

3. **Shipment Delivered Workflow**
   - Log when shipment is delivered
   - Send delivery confirmation to client
   - Request feedback/rating

4. **Subscription Renewal Reminder**
   - Scheduled job to check expiring subscriptions
   - Send reminder emails 7 days before expiration

5. **Port Activity Tracking**
   - Log when users view port details
   - Track popular ports for analytics

---

## Maintenance

### Regular Tasks

1. **Archive old events** (monthly):
   ```sql
   -- Archive events older than 1 year
   DELETE FROM events_log
   WHERE created_at < NOW() - INTERVAL '1 year';
   ```

2. **Monitor event volume** (weekly):
   ```sql
   SELECT event_type, COUNT(*) as count
   FROM events_log
   WHERE created_at > NOW() - INTERVAL '7 days'
   GROUP BY event_type
   ORDER BY count DESC;
   ```

3. **Check trigger performance** (monthly):
   ```sql
   SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   WHERE tablename = 'events_log'
   ORDER BY idx_scan DESC;
   ```

---

## Support

For issues or questions about workflows:

1. Check this documentation
2. Review the code in `utils/eventLogger.ts`
3. Check database trigger functions
4. Review the KPI dashboard for event data
5. Contact the development team

---

**Last Updated:** 2024-01-18
**Version:** 1.0
**Author:** 3S Global Development Team
