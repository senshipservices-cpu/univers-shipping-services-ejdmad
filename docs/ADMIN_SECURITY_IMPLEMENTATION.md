
# Admin Security & Role-Based Access Control

## Overview

This document describes the implementation of admin security and role-based access control in the Universal Shipping Services application. The system restricts sensitive operations and pages to admin users only, based on email addresses configured in environment variables.

## Architecture

### Two-Layer Security Model

The application implements security at two levels:

1. **Frontend (React Native App)**
   - UI-level restrictions
   - Route protection
   - Conditional rendering of admin features
   - User experience optimization

2. **Backend (Supabase RLS)**
   - Database-level restrictions
   - Row Level Security policies
   - Prevents unauthorized data modifications
   - Last line of defense

## Admin Role Configuration

### Environment Variable: ADMIN_EMAILS

Admin users are identified by their email addresses, which must be listed in the `ADMIN_EMAILS` environment variable.

**Format:** Comma-separated list of email addresses (case-insensitive)

**Example:**
```
ADMIN_EMAILS=cheikh@universalshipping.com,admin@uss.com,admin@3sglobal.com
```

**Configuration Locations:**

1. **Natively Environment Variables** (for frontend)
   - Variable name: `ADMIN_EMAILS`
   - Type: Secret
   - Used by: React Native app

2. **Supabase Database Configuration** (for RLS)
   - Setting name: `app.admin_emails`
   - Used by: PostgreSQL RLS policies
   - Set via SQL:
     ```sql
     ALTER DATABASE postgres SET app.admin_emails = 'cheikh@universalshipping.com,admin@uss.com';
     ```

## Frontend Implementation

### 1. Admin Check Function

**Location:** `config/appConfig.ts`

```typescript
export const isAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;
  const normalizedEmail = userEmail.trim().toLowerCase();
  return env.ADMIN_EMAILS.includes(normalizedEmail);
};
```

**Features:**
- Case-insensitive email comparison
- Null-safe (returns false for null/undefined emails)
- Reads from environment variable
- Exported for use throughout the app

### 2. Auth Context Integration

**Location:** `contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  // ... other fields
  currentUserIsAdmin: boolean;
}

// In AuthProviderInner:
const currentUserIsAdmin = appConfig.isAdmin(user?.email);
```

**Features:**
- Exposes `currentUserIsAdmin` boolean
- Automatically updates when user changes
- Available throughout the app via `useAuth()` hook

### 3. Protected Route Component

**Location:** `components/ProtectedRoute.tsx`

```typescript
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

**Features:**
- Wraps admin-only pages
- Shows access denied message for non-admins
- Provides "Return to Home" button
- Prevents unauthorized access at route level

**Usage Example:**
```typescript
export default function AdminDashboardScreen() {
  return (
    <ProtectedRoute requireAdmin={true}>
      {/* Admin content here */}
    </ProtectedRoute>
  );
}
```

### 4. Configuration Status Component

**Location:** `components/ConfigStatus.tsx`

**Features:**
- Shows environment badge (green for production, orange for dev)
- Displays security section with:
  - Current user's email
  - Admin or Client status
  - Access restrictions explanation
- Only visible in development mode
- Helps developers verify admin configuration

## Backend Implementation (Supabase RLS)

### 1. Admin Check Function

**Location:** Supabase Database

```sql
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
  admin_emails TEXT;
  admin_list TEXT[];
BEGIN
  -- Get the current user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get admin emails from database configuration
  admin_emails := COALESCE(
    current_setting('app.admin_emails', true),
    'cheikh@universalshipping.com'
  );
  
  -- Split and check
  admin_list := string_to_array(lower(admin_emails), ',');
  RETURN lower(trim(user_email)) = ANY(admin_list);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Features:**
- Reads from `app.admin_emails` database setting
- Case-insensitive comparison
- Null-safe
- Used by RLS policies
- Runs with elevated privileges (SECURITY DEFINER)

### 2. RLS Policies

#### Global Agents (Agent Validation)

**Restriction:** Only admins can update `global_agents.status`

```sql
CREATE POLICY "Only admins can update agent status"
ON global_agents
FOR UPDATE
WITH CHECK (
  is_admin_user() OR 
  status = (SELECT status FROM global_agents WHERE id = global_agents.id)
);
```

**Effect:**
- Admins can change status to: `pending`, `validated`, `rejected`
- Non-admins cannot change the status field
- Non-admins can update other fields (email, website, etc.)

#### Subscriptions (Activation Control)

**Restriction:** Only admins can update `subscriptions.is_active`

```sql
CREATE POLICY "Clients can update their own subscriptions"
ON subscriptions
FOR UPDATE
WITH CHECK (
  (is_admin_user() OR is_active = (SELECT is_active FROM subscriptions WHERE id = subscriptions.id))
  AND
  client IN (SELECT clients.id FROM clients WHERE clients.user_id = auth.uid())
);
```

**Effect:**
- Admins can activate/deactivate any subscription
- Clients can update their subscriptions but cannot change `is_active`
- Clients can only update their own subscriptions

#### Shipments (Status Control)

**Restriction:** Only admins can update `shipments.current_status`

```sql
CREATE POLICY "Clients can update their own shipments"
ON shipments
FOR UPDATE
WITH CHECK (
  (is_admin_user() OR current_status = (SELECT current_status FROM shipments WHERE id = shipments.id))
  AND
  client IN (SELECT clients.id FROM clients WHERE clients.user_id = auth.uid())
);
```

**Effect:**
- Admins can change shipment status to any value
- Clients can update their shipments but cannot change `current_status`
- Clients can only update their own shipments

#### Admin Full Access Policies

**Purpose:** Allow admins to bypass normal restrictions

```sql
-- Admin full access to global_agents
CREATE POLICY "Admins have full access to global_agents"
ON global_agents FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Admin full access to subscriptions
CREATE POLICY "Admins have full access to subscriptions"
ON subscriptions FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Admin full access to shipments
CREATE POLICY "Admins have full access to shipments"
ON shipments FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Admin full access to freight_quotes
CREATE POLICY "Admins have full access to freight_quotes"
ON freight_quotes FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());
```

**Effect:**
- Admins can perform all CRUD operations on these tables
- Admins can view all records (not just their own)
- Admins can modify any field without restrictions

## Protected Pages

### 1. Admin Dashboard

**Route:** `/(tabs)/admin-dashboard`

**Features:**
- Manage freight quotes
- Manage shipments
- Validate/reject global agents
- Manage subscriptions
- View global KPIs

**Protection:**
```typescript
if (!user || !currentUserIsAdmin) {
  return <Redirect href="/(tabs)/(home)/" />;
}
```

### 2. KPI Dashboard

**Route:** `/(tabs)/kpi-dashboard`

**Features:**
- Commercial performance metrics
- Conversion funnel analysis
- Service performance
- Port analysis
- Subscription analytics
- Client activity

**Protection:**
```typescript
if (!user || !currentUserIsAdmin) {
  return <Redirect href="/(tabs)/(home)/" />;
}
```

### 3. Configuration Status (Development Only)

**Component:** `ConfigStatus`

**Features:**
- Environment information
- Security status
- Service connectivity
- Configuration validation

**Protection:**
```typescript
if (!appConfig.isDevelopment) {
  return null;
}
```

## Protected Operations

### 1. Agent Validation

**Operation:** Update `global_agents.status`

**Admin Actions:**
- Validate agent application (set status to `validated`)
- Reject agent application (set status to `rejected`)
- Reset to pending (set status to `pending`)

**Client Restrictions:**
- Cannot change status field
- Can update other fields (email, website, certifications, etc.)

**Implementation:**
```typescript
// Frontend check
if (!currentUserIsAdmin) {
  Alert.alert('Accès refusé', 'Seuls les administrateurs peuvent valider les agents.');
  return;
}

// Backend RLS enforces this automatically
await supabase
  .from('global_agents')
  .update({ status: 'validated' })
  .eq('id', agentId);
```

### 2. Subscription Activation

**Operation:** Update `subscriptions.is_active`

**Admin Actions:**
- Activate subscription (set `is_active` to `true`)
- Deactivate subscription (set `is_active` to `false`)

**Client Restrictions:**
- Cannot change `is_active` field
- Can update other fields (notes, etc.)

**Implementation:**
```typescript
// Frontend check
if (!currentUserIsAdmin) {
  Alert.alert('Accès refusé', 'Seuls les administrateurs peuvent activer les abonnements.');
  return;
}

// Backend RLS enforces this automatically
await supabase
  .from('subscriptions')
  .update({ is_active: true })
  .eq('id', subscriptionId);
```

### 3. Shipment Status Updates

**Operation:** Update `shipments.current_status`

**Admin Actions:**
- Change status to any value:
  - `draft`
  - `quote_pending`
  - `confirmed`
  - `in_transit`
  - `at_port`
  - `delivered`
  - `on_hold`
  - `cancelled`

**Client Restrictions:**
- Cannot change `current_status` field
- Can update other fields (notes, etc.)

**Implementation:**
```typescript
// Frontend check
if (!currentUserIsAdmin) {
  Alert.alert('Accès refusé', 'Seuls les administrateurs peuvent modifier le statut des expéditions.');
  return;
}

// Backend RLS enforces this automatically
await supabase
  .from('shipments')
  .update({ current_status: 'in_transit' })
  .eq('id', shipmentId);
```

## User Experience

### Admin Users

**What they see:**
- Admin Dashboard link in navigation
- KPI Dashboard link
- Configuration Status (in dev mode)
- "Admin" badge in Configuration Status
- All admin features and buttons

**What they can do:**
- Access all admin pages
- Validate/reject agents
- Activate/deactivate subscriptions
- Update shipment status
- View all data across all clients
- Perform all CRUD operations

### Regular Users (Clients)

**What they see:**
- Client Dashboard
- Their own shipments, quotes, subscriptions
- "Client" badge in Configuration Status (dev mode)
- Message: "Certaines actions sont réservées à l'équipe USS"

**What they cannot see:**
- Admin Dashboard
- KPI Dashboard
- Admin-only buttons and features

**What they cannot do:**
- Access admin pages (redirected with access denied message)
- Validate/reject agents
- Activate/deactivate subscriptions
- Update shipment status
- View other clients' data
- Modify sensitive fields

## Testing

### Test Admin Access

1. **Create admin user:**
   ```sql
   -- In Supabase Auth
   INSERT INTO auth.users (email, ...) VALUES ('admin@uss.com', ...);
   ```

2. **Add to ADMIN_EMAILS:**
   ```
   ADMIN_EMAILS=admin@uss.com
   ```

3. **Test access:**
   - Log in with admin email
   - Navigate to `/admin-dashboard` → Should succeed
   - Navigate to `/kpi-dashboard` → Should succeed
   - Try updating agent status → Should succeed
   - Try activating subscription → Should succeed

### Test Non-Admin Restrictions

1. **Create regular user:**
   ```sql
   -- In Supabase Auth
   INSERT INTO auth.users (email, ...) VALUES ('client@example.com', ...);
   ```

2. **Ensure NOT in ADMIN_EMAILS:**
   ```
   ADMIN_EMAILS=admin@uss.com (client@example.com not included)
   ```

3. **Test restrictions:**
   - Log in with client email
   - Navigate to `/admin-dashboard` → Should show access denied
   - Navigate to `/kpi-dashboard` → Should show access denied
   - Try updating agent status → Should fail at database level
   - Try activating subscription → Should fail at database level

### Test RLS Policies

```sql
-- Test as admin
SET request.jwt.claims = '{"email": "admin@uss.com"}';
UPDATE global_agents SET status = 'validated' WHERE id = '<id>';
-- Should succeed

-- Test as client
SET request.jwt.claims = '{"email": "client@example.com"}';
UPDATE global_agents SET status = 'validated' WHERE id = '<id>';
-- Should fail with RLS policy violation

-- Reset
RESET request.jwt.claims;
```

## Security Best Practices

### Do's ✓

1. **Use work email addresses** for admin accounts
2. **Keep admin list minimal** - only add necessary users
3. **Remove admin access** when team members leave
4. **Use strong passwords** and enable 2FA for admin accounts
5. **Regularly audit** admin actions via logs
6. **Test restrictions** in development before deploying
7. **Document admin changes** in a changelog
8. **Use separate admin accounts** for production and development

### Don'ts ✗

1. **Don't use personal emails** for admin accounts
2. **Don't share admin credentials** between team members
3. **Don't hardcode admin emails** in application code
4. **Don't grant admin access** to client accounts
5. **Don't bypass RLS policies** in production
6. **Don't log sensitive admin operations** in production
7. **Don't use the same admin password** across environments

## Troubleshooting

### Issue: Admin cannot access admin pages

**Symptoms:**
- User with admin email sees "Access Denied"
- `currentUserIsAdmin` is `false`

**Solutions:**
1. Verify email is in `ADMIN_EMAILS` (check for typos, spaces)
2. Ensure email matches exactly with Supabase Auth user email
3. Check that `ADMIN_EMAILS` is set in Natively environment variables
4. Restart the app after changing environment variables
5. Check browser console: `console.log(appConfig.env.ADMIN_EMAILS)`

### Issue: RLS policies not working

**Symptoms:**
- Non-admin users can modify sensitive fields
- Database updates succeed when they shouldn't

**Solutions:**
1. Verify `app.admin_emails` is set in Supabase:
   ```sql
   SHOW app.admin_emails;
   ```
2. Check RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
3. Test the `is_admin_user()` function:
   ```sql
   SELECT is_admin_user();
   ```
4. Check Supabase logs for RLS policy errors
5. Verify policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'global_agents';
   ```

### Issue: Admin emails not syncing

**Symptoms:**
- Admin works in app but not in database (or vice versa)

**Solutions:**
1. Set `ADMIN_EMAILS` in Natively (for app)
2. Set `app.admin_emails` in Supabase (for RLS):
   ```sql
   ALTER DATABASE postgres SET app.admin_emails = 'admin@uss.com';
   ```
3. Ensure both lists are identical
4. Restart app and database connections

## Migration Guide

### Adding a New Admin

1. **Add email to ADMIN_EMAILS:**
   ```
   ADMIN_EMAILS=existing@uss.com,new@uss.com
   ```

2. **Update Supabase configuration:**
   ```sql
   ALTER DATABASE postgres SET app.admin_emails = 'existing@uss.com,new@uss.com';
   ```

3. **Restart the app** (if necessary)

4. **Test access** with the new admin account

### Removing an Admin

1. **Remove email from ADMIN_EMAILS:**
   ```
   ADMIN_EMAILS=remaining@uss.com
   ```

2. **Update Supabase configuration:**
   ```sql
   ALTER DATABASE postgres SET app.admin_emails = 'remaining@uss.com';
   ```

3. **Verify removal:**
   - Log in with removed account
   - Confirm cannot access admin pages
   - Confirm cannot modify sensitive fields

## Summary

The admin security system provides:

✅ **Two-layer security** (frontend + backend)  
✅ **Email-based admin identification**  
✅ **Protected pages** (Admin Dashboard, KPI Dashboard)  
✅ **Protected operations** (agent validation, subscription activation, shipment status)  
✅ **Row Level Security** enforcement  
✅ **User-friendly access denied messages**  
✅ **Development-mode configuration status**  
✅ **Easy admin management** via environment variables  

The system ensures that sensitive operations are restricted to authorized personnel while maintaining a good user experience for both admin and regular users.

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Project:** 3S Global / Universal Shipping Services
