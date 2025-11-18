
# Analytics & KPI System Implementation

## Overview

This document describes the internal analytics and KPI (Key Performance Indicators) dashboard system implemented in the Univers Shipping Services (3S Global) application. The system provides comprehensive tracking and analysis of all important events and business metrics without relying on external analytics tools.

## Database Structure

### events_log Table

The `events_log` table stores all tracked events in the application.

**Schema:**
```sql
CREATE TABLE events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services_global(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES freight_quotes(id) ON DELETE SET NULL,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  port_id UUID REFERENCES ports(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_events_log_event_type` - For filtering by event type
- `idx_events_log_created_at` - For time-based queries
- `idx_events_log_user_id` - For user-specific queries
- `idx_events_log_client_id` - For client-specific queries

**Row Level Security (RLS):**
- Admins can view all events
- Admins can insert events
- System can insert events (for automated logging)

### Event Types

The following event types are tracked:

1. **Service Events:**
   - `service_view` - When a user views a service
   - `service_quote_click` - When a user clicks to request a quote for a service

2. **Quote Events:**
   - `quote_created` - When a new quote is created
   - `quote_accepted` - When a client accepts a quote
   - `quote_rejected` - When a client rejects a quote
   - `quote_paid` - When a quote is paid

3. **Shipment Events:**
   - `shipment_created` - When a new shipment is created
   - `shipment_status_changed` - When a shipment status changes

4. **Portal Events:**
   - `portal_access` - When a user successfully accesses the digital portal
   - `portal_denied` - When a user is denied access to the digital portal

5. **Agent Events:**
   - `agent_application_submitted` - When an agent application is submitted
   - `agent_validated` - When an agent is validated by admin

6. **Subscription Events:**
   - `subscription_created` - When a new subscription is created
   - `subscription_activated` - When a subscription is activated
   - `subscription_expired` - When a subscription expires

7. **Authentication Events:**
   - `login` - When a user logs in
   - `logout` - When a user logs out

8. **Communication Events:**
   - `contact_sent` - When a contact form is submitted

## Event Logging Utility

### Location
`utils/eventLogger.ts`

### Usage

The event logger provides a simple API for logging events throughout the application:

```typescript
import { logEvent, logServiceView, logQuoteCreated } from '@/utils/eventLogger';

// Generic event logging
await logEvent({
  eventType: 'service_view',
  serviceId: 'service-uuid',
  userId: 'user-uuid',
  clientId: 'client-uuid',
  details: 'Additional information',
});

// Specific event helpers
await logServiceView('service-uuid', 'user-uuid', 'client-uuid');
await logQuoteCreated('quote-uuid', 'user-uuid', 'client-uuid', 'Quote details');
await logShipmentCreated('shipment-uuid', 'client-uuid', 'user-uuid');
await logPortalAccess('user-uuid', 'client-uuid', 'Subscription: digital_portal');
await logLogin('user-uuid', 'client-uuid');
await logLogout('user-uuid', 'client-uuid');
```

### Helper Functions

The following helper functions are available:

- `logEvent(params)` - Generic event logging
- `logServiceView(serviceId, userId?, clientId?)` - Log service view
- `logQuoteCreated(quoteId, userId?, clientId?, details?)` - Log quote creation
- `logShipmentCreated(shipmentId, clientId?, userId?, details?)` - Log shipment creation
- `logShipmentStatusChanged(shipmentId, clientId?, userId?, details?)` - Log shipment status change
- `logPortalAccess(userId, clientId?, details?)` - Log portal access
- `logPortalDenied(userId, clientId?, details?)` - Log portal denied
- `logAgentApplicationSubmitted(userId?, details?)` - Log agent application
- `logSubscriptionCreated(clientId, userId?, details?)` - Log subscription creation
- `logLogin(userId, clientId?)` - Log user login
- `logLogout(userId, clientId?)` - Log user logout
- `logContactSent(userId?, clientId?, details?)` - Log contact form submission

## KPI Dashboard

### Location
`app/(tabs)/kpi-dashboard.tsx`

### Access Control

The KPI dashboard is restricted to admin users only. Access is controlled by checking:
- `client.is_super_admin === true` OR
- `client.admin_option === true`

Non-admin users are automatically redirected to the home page.

### Dashboard Tabs

The dashboard includes the following tabs:

1. **Vue d'ensemble (Overview)**
   - Total quotes, quotes this month
   - Total shipments, shipments in transit, shipments delivered
   - Total agents, pending agents, validated agents
   - Active subscriptions
   - Total revenue
   - Top services by views

2. **Services**
   - Service view analytics
   - Top services ranking

3. **Devis (Quotes)**
   - Total quotes, quotes this month
   - Accepted quotes, rejected quotes
   - Total revenue
   - Conversion rate

4. **Expéditions (Shipments)**
   - Total shipments
   - Shipments in transit
   - Shipments delivered
   - Delivery rate

5. **Agents**
   - Total agents
   - Pending agents
   - Validated agents
   - Validation rate

6. **Abonnements (Subscriptions)**
   - Total subscriptions
   - Active subscriptions
   - Activation rate

7. **Événements (Events)**
   - Total events
   - Events this week
   - Recent events breakdown

### KPI Metrics

The dashboard calculates and displays the following KPIs:

**Quotes:**
- Total number of quotes
- Quotes created this month
- Accepted quotes
- Rejected quotes
- Total revenue from accepted quotes
- Conversion rate (accepted / total)

**Shipments:**
- Total shipments
- Shipments in transit
- Shipments delivered
- Delivery rate (delivered / total)

**Agents:**
- Total agents
- Pending agents
- Validated agents
- Validation rate (validated / total)

**Subscriptions:**
- Total subscriptions
- Active subscriptions
- Activation rate (active / total)

**Events:**
- Total events logged
- Events logged this week
- Event breakdown by type

**Services:**
- Top 5 most viewed services
- Total service views

### Data Refresh

The dashboard supports pull-to-refresh functionality to update all KPI data in real-time.

## Integration Points

### Authentication (AuthContext)

Login and logout events are automatically logged in the `AuthContext`:

```typescript
// On successful login
await logLogin(data.user.id, clientData?.id || null);

// On logout
await logLogout(user.id, client?.id || null);
```

### Where to Add Event Logging

Add event logging at the following points in your application:

1. **Service Views:**
   - In `global-services.tsx` when a service is viewed
   - In service detail pages

2. **Quote Creation:**
   - In `freight-quote.tsx` after successful quote submission
   - In quote management pages

3. **Shipment Events:**
   - In shipment creation forms
   - In shipment status update functions
   - In admin dashboard when updating shipment status

4. **Portal Access:**
   - In `digital-portal.tsx` on successful access
   - In subscription check logic when access is denied

5. **Agent Applications:**
   - In `become-agent.tsx` after form submission

6. **Subscriptions:**
   - In `subscription-confirm.tsx` after subscription creation
   - In subscription activation workflows

7. **Contact Forms:**
   - In `contact.tsx` after form submission

## Admin Access Setup

To grant admin access to a user:

1. Update the `clients` table:
```sql
UPDATE clients 
SET is_super_admin = true 
WHERE user_id = 'user-uuid';

-- OR

UPDATE clients 
SET admin_option = true 
WHERE user_id = 'user-uuid';
```

2. The user will then have access to:
   - Admin Dashboard (`/admin-dashboard`)
   - KPI Dashboard (`/kpi-dashboard`)

## Performance Considerations

1. **Indexes:** The `events_log` table has indexes on frequently queried columns for optimal performance.

2. **Parallel Queries:** The KPI dashboard loads data using `Promise.all()` for parallel execution.

3. **Efficient Counting:** Uses Supabase's `count: 'exact', head: true` for efficient counting without fetching data.

4. **Limited Results:** Top services and recent events are limited to prevent excessive data transfer.

## Future Enhancements

Potential improvements to consider:

1. **Date Range Filters:** Add date range selection for custom time periods
2. **Export Functionality:** Export KPI data to CSV/PDF
3. **Real-time Updates:** Use Supabase Realtime for live KPI updates
4. **Custom Dashboards:** Allow admins to create custom dashboard views
5. **Alerts:** Set up alerts for specific KPI thresholds
6. **Comparative Analytics:** Compare metrics across different time periods
7. **User Segmentation:** Analyze metrics by user segments
8. **Funnel Analysis:** Track user journey through the application
9. **Retention Metrics:** Calculate user retention rates
10. **Revenue Forecasting:** Predict future revenue based on trends

## Troubleshooting

### Events Not Logging

1. Check that the `events_log` table exists
2. Verify RLS policies are correctly configured
3. Check console logs for error messages
4. Ensure the event logger is imported correctly

### KPI Dashboard Not Loading

1. Verify user has admin privileges
2. Check browser console for errors
3. Verify all required tables exist
4. Check network tab for failed API requests

### Incorrect KPI Values

1. Verify data integrity in source tables
2. Check date/time calculations
3. Review query logic in `loadKPIData` functions
4. Test queries directly in Supabase SQL editor

## Security Notes

1. **Admin-Only Access:** KPI dashboard is restricted to admin users only
2. **RLS Policies:** All queries respect Row Level Security policies
3. **No Sensitive Data:** Event details should not contain sensitive user information
4. **Audit Trail:** All events are timestamped and linked to users for audit purposes

## Maintenance

### Regular Tasks

1. **Monitor Table Size:** The `events_log` table will grow over time. Consider archiving old events.
2. **Review Indexes:** Periodically review and optimize indexes based on query patterns.
3. **Update Event Types:** Add new event types as the application evolves.
4. **Validate Data:** Regularly check for data integrity issues.

### Archiving Old Events

Consider implementing an archiving strategy for events older than a certain period:

```sql
-- Archive events older than 1 year
CREATE TABLE events_log_archive AS 
SELECT * FROM events_log 
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM events_log 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## Support

For questions or issues related to the analytics system, contact the development team or refer to the main application documentation.
