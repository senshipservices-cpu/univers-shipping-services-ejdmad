
# Admin Panel Implementation

## Overview

The Admin Panel is a restricted-access internal page that allows administrators to manage the entire application without needing to access the Natively back-office. This provides a streamlined interface for managing quotes, agents, subscriptions, and shipments.

## Access Control

### Admin Roles

The system uses two fields in the `clients` table to determine admin access:

- `is_super_admin` (boolean): Full administrative access
- `admin_option` (boolean): Standard administrative access

Users with either field set to `true` can access the admin dashboard.

### Access Check

```typescript
const isAdmin = authClient?.is_super_admin === true || authClient?.admin_option === true;
```

If a user is not authenticated or not an admin, they are automatically redirected to the home page.

## Features

### 1. Freight Quotes Management

**Route:** `/(tabs)/admin-dashboard` (Tab: "Devis")

**Features:**
- View all freight quotes with detailed information
- See quote status (received, in_progress, sent_to_client, accepted, refused)
- View payment status
- See origin and destination ports
- View quote amounts and currency
- Track creation dates

**Data Displayed:**
- Client name and email
- Quote status with color-coded badges
- Origin → Destination route
- Quote amount and currency
- Payment status
- Creation timestamp

### 2. Global Agents Management

**Route:** `/(tabs)/admin-dashboard` (Tab: "Agents")

**Features:**
- View all agent applications
- Validate or reject pending agents
- See agent details (company, port, activities)
- Quick action buttons for validation/rejection
- Edit agent status via modal

**Data Displayed:**
- Company name
- Agent status (pending, validated, rejected)
- Email address
- Port location (name and country)
- Activities/services offered
- Creation timestamp

**Actions:**
- **Validate:** Changes status to "validated" and triggers email notification
- **Reject:** Changes status to "rejected" and triggers email notification
- **Edit Status:** Opens modal to change status manually

### 3. Subscriptions Management

**Route:** `/(tabs)/admin-dashboard` (Tab: "Abonnements")

**Features:**
- View all subscriptions
- See subscription status and plan type
- Track start and end dates
- Monitor active/inactive status

**Data Displayed:**
- Client company name and email
- Subscription status (pending, active, cancelled, expired)
- Plan type (basic, premium_tracking, enterprise_logistics, agent_listing)
- Start date
- End date (if applicable)
- Active/Inactive indicator

### 4. Shipments Management

**Route:** `/(tabs)/admin-dashboard` (Tab: "Expéditions")

**Features:**
- View all shipments
- Edit shipment status
- Track shipment routes
- Monitor creation dates

**Data Displayed:**
- Tracking number
- Current status (draft, quote_pending, confirmed, in_transit, at_port, delivered, on_hold, cancelled)
- Client company name
- Origin → Destination route
- Creation timestamp

**Actions:**
- **Edit Status:** Opens modal to change shipment status
- Status changes trigger email notifications to clients

## UI Components

### Tab Navigation

Horizontal scrollable tabs for switching between different management sections:
- Devis (Quotes)
- Agents
- Abonnements (Subscriptions)
- Expéditions (Shipments)

### Card Layout

Each item is displayed in a card with:
- Header with title and status badge
- Content area with detailed information
- Action buttons (where applicable)

### Status Badges

Color-coded status indicators:
- **Green (#10b981):** Success states (validated, accepted, delivered, active)
- **Blue (colors.primary):** In-progress states (in_progress, confirmed, in_transit)
- **Orange (#f59e0b):** Pending/warning states (sent_to_client, at_port, quote_pending)
- **Red (#ef4444):** Error/cancelled states (refused, rejected, cancelled, on_hold)
- **Gray (colors.textSecondary):** Draft/pending states (received, pending, draft, expired)

### Edit Modal

Bottom sheet modal for editing statuses:
- Displays all available status options
- Visual selection with checkmarks
- Color-coded status badges
- Save/Cancel actions

## Access Points

### 1. Client Dashboard Header

Admins see a shield icon in the header that links to the admin dashboard.

### 2. Admin Badge

Admins have a visible "Admin" badge next to their name in the welcome section.

### 3. Admin Section

A dedicated "Administration" section appears at the bottom of the client dashboard with a prominent card linking to the admin panel.

## Database Operations

### Read Operations

All data is fetched using Supabase queries with proper joins:

```typescript
// Example: Fetch freight quotes with port information
const { data, error } = await supabase
  .from('freight_quotes')
  .select(`
    *,
    origin_port:ports!freight_quotes_origin_port_fkey(name),
    destination_port:ports!freight_quotes_destination_port_fkey(name)
  `)
  .order('created_at', { ascending: false })
  .limit(50);
```

### Update Operations

Status updates are performed with proper timestamp tracking:

```typescript
// Example: Update agent status
const { error } = await supabase
  .from('global_agents')
  .update({ 
    status: newStatus, 
    updated_at: new Date().toISOString() 
  })
  .eq('id', agentId);
```

## Security Considerations

### Row Level Security (RLS)

The admin panel relies on client-side checks for access control. For production use, ensure that:

1. RLS policies are configured to allow admins to read/update all records
2. Admin status is verified server-side for sensitive operations
3. Audit logs are maintained for admin actions

### Recommended RLS Policies

```sql
-- Allow admins to view all freight quotes
CREATE POLICY "Admins can view all freight quotes"
ON freight_quotes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND (clients.is_super_admin = true OR clients.admin_option = true)
  )
);

-- Allow admins to update agent status
CREATE POLICY "Admins can update agent status"
ON global_agents FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
    AND (clients.is_super_admin = true OR clients.admin_option = true)
  )
);
```

## Email Notifications

Status changes trigger automated email notifications:

- **Agent Validation:** Email sent when status changes to "validated"
- **Agent Rejection:** Email sent when status changes to "rejected"
- **Shipment Status Change:** Email sent to client when shipment status is updated

These are handled by existing database triggers and Edge Functions.

## Performance Optimization

### Data Limits

- Each query is limited to 50 records to prevent performance issues
- Pagination can be added in future iterations

### Refresh Control

Pull-to-refresh functionality allows admins to reload data without leaving the page.

### Loading States

- Initial loading spinner while data is fetched
- Refresh indicator during pull-to-refresh
- Modal loading states during updates

## Future Enhancements

### Potential Improvements

1. **Search and Filtering:**
   - Search by client name, email, tracking number
   - Filter by status, date range, port
   - Sort by different fields

2. **Pagination:**
   - Load more records on scroll
   - Page navigation controls

3. **Bulk Actions:**
   - Select multiple items
   - Bulk status updates
   - Bulk export to CSV

4. **Analytics Dashboard:**
   - Statistics and charts
   - Revenue tracking
   - Agent performance metrics

5. **Audit Logs:**
   - Track all admin actions
   - View history of changes
   - Export audit reports

6. **Advanced Permissions:**
   - Role-based access control
   - Granular permissions per section
   - Team management

## Testing

### Manual Testing Checklist

- [ ] Verify admin access control (redirect non-admins)
- [ ] Test freight quotes list display
- [ ] Test agent validation/rejection
- [ ] Test shipment status editing
- [ ] Verify status badge colors
- [ ] Test pull-to-refresh functionality
- [ ] Test modal interactions
- [ ] Verify email notifications are sent
- [ ] Test on both iOS and Android
- [ ] Test in light and dark mode

### Setting Up Test Admin

To test the admin panel, you need to set admin flags for a user:

```sql
-- Set a user as admin
UPDATE clients
SET is_super_admin = true
WHERE user_id = 'your-user-id';

-- Or set admin option
UPDATE clients
SET admin_option = true
WHERE user_id = 'your-user-id';
```

## Troubleshooting

### Common Issues

**Issue:** Admin dashboard not accessible
- **Solution:** Verify `is_super_admin` or `admin_option` is set to `true` in the clients table

**Issue:** Data not loading
- **Solution:** Check RLS policies allow admin access to tables

**Issue:** Status updates not working
- **Solution:** Verify RLS policies allow UPDATE operations for admins

**Issue:** Email notifications not sent
- **Solution:** Check database triggers and Edge Functions are properly configured

## Related Documentation

- [Email Automation System](./EMAIL_AUTOMATION_SYSTEM.md)
- [Subscription Access Control](./SUBSCRIPTION_ACCESS_CONTROL.md)
- [Client Dashboard Implementation](./CLIENT_DASHBOARD_IMPLEMENTATION.md)
