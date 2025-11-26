
# SECURITY QUICK REFERENCE GUIDE
## Universal Shipping Services - Security Implementation

**Last Updated:** 2024
**Status:** ✅ Production Ready

---

## 🔒 AUTHENTICATION & AUTHORIZATION

### Public Screens (No Auth Required)
```typescript
// These screens are accessible without authentication
- /(tabs)/(home)/index.tsx          // Home
- /(tabs)/global-services.tsx       // Services
- /(tabs)/port-coverage.tsx         // Ports
- /(tabs)/pricing.tsx               // Pricing
- /(tabs)/become-agent.tsx          // Become Agent
- /(tabs)/freight-quote.tsx         // Quote Request
- /(tabs)/login.tsx                 // Login
- /(tabs)/signup.tsx                // Signup
```

### Protected Screens (Auth Required)
```typescript
// Wrap with ProtectedRoute component
import { ProtectedRoute } from '@/components/ProtectedRoute';

<ProtectedRoute requireEmailVerification={true}>
  <YourComponent />
</ProtectedRoute>

// Protected screens:
- /(tabs)/client-dashboard.tsx      // Client Dashboard
- /(tabs)/client-profile.tsx        // Client Profile
- /(tabs)/quote-details.tsx         // Quote Details
- /(tabs)/shipment-detail.tsx       // Shipment Details
```

### Admin Screens (Admin Role Required)
```typescript
// Wrap with AdminGuard component
import { AdminGuard } from '@/components/AdminGuard';

<AdminGuard>
  <YourAdminComponent />
</AdminGuard>

// Admin screens:
- /(tabs)/admin-dashboard.tsx       // Admin Dashboard
- /(tabs)/admin-clients.tsx         // Client Management
- /(tabs)/admin-quotes.tsx          // Quote Management
- /(tabs)/admin-shipments.tsx       // Shipment Management
- /(tabs)/admin-agents-ports.tsx    // Agent/Port Management
- /(tabs)/admin-subscriptions.tsx   // Subscription Management
```

---

## 👤 ADMIN ROLE MANAGEMENT

### Check if User is Admin
```typescript
import appConfig from '@/config/appConfig';

// Client-side check
const isAdmin = appConfig.isAdmin(user?.email);

// In component
import { useAuth } from '@/contexts/AuthContext';
const { currentUserIsAdmin } = useAuth();

// In admin context
import { useAdmin } from '@/contexts/AdminContext';
const { isAdmin } = useAdmin();
```

### Configure Admin Emails
```bash
# In .env or Natively Environment Variables
ADMIN_EMAILS=cheikh@universalshipping.com,admin2@example.com,admin3@example.com
```

### Database Admin Function
```sql
-- Check if current user is admin
SELECT is_admin_user();

-- Use in RLS policies
CREATE POLICY "Admins have full access"
ON your_table FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());
```

---

## 🛡️ ROW LEVEL SECURITY (RLS) PATTERNS

### Pattern 1: User Can Only Access Own Data
```sql
-- SELECT policy
CREATE POLICY "Users can view their own records"
ON your_table FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT policy
CREATE POLICY "Users can insert their own records"
ON your_table FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE policy
CREATE POLICY "Users can update their own records"
ON your_table FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- DELETE policy
CREATE POLICY "Users can delete their own records"
ON your_table FOR DELETE
TO authenticated
USING (user_id = auth.uid());
```

### Pattern 2: Public Read, Authenticated Write
```sql
-- Anyone can read
CREATE POLICY "Public can view records"
ON your_table FOR SELECT
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert"
ON your_table FOR INSERT
TO authenticated
WITH CHECK (true);
```

### Pattern 3: Admin Full Access + User Limited Access
```sql
-- Admins have full access
CREATE POLICY "Admins have full access"
ON your_table FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Users can view their own records
CREATE POLICY "Users can view their own records"
ON your_table FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Pattern 4: Join-Based Access Control
```sql
-- Users can view records related to their client profile
CREATE POLICY "Users can view their related records"
ON your_table FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
);
```

### Pattern 5: Status-Based Protection
```sql
-- Users can update their records but not change status
CREATE POLICY "Users can update their records"
ON your_table FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  is_admin_user() OR 
  status = (SELECT status FROM your_table WHERE id = id)
);
```

---

## 🔐 SECRETS MANAGEMENT

### Public Variables (Frontend-Safe)
```typescript
// Use EXPO_PUBLIC_ prefix for frontend-accessible variables
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

### Secret Variables (Backend-Only)
```typescript
// NO EXPO_PUBLIC_ prefix - never exposed to frontend
SERVICE_ROLE_KEY=your_service_role_key
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
SMTP_PASSWORD=your_smtp_password
ADMIN_EMAILS=admin@example.com
```

### Access Secrets in Code
```typescript
// Client-side (public variables only)
import appConfig from '@/config/appConfig';
const supabaseUrl = appConfig.env.SUPABASE_URL;
const anonKey = appConfig.env.SUPABASE_ANON_KEY;

// Edge Functions (can access secrets)
const serviceKey = Deno.env.get('SERVICE_ROLE_KEY');
const paypalSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
```

---

## 🚨 SECURITY CHECKLIST

### Before Deploying to Production

- [ ] All sensitive tables have RLS enabled
- [ ] No `USING (true)` policies on sensitive tables
- [ ] Admin emails configured in environment variables
- [ ] All secrets use proper naming (no EXPO_PUBLIC_ for secrets)
- [ ] AdminGuard protects all admin routes
- [ ] ProtectedRoute protects all private routes
- [ ] Email verification required for sensitive operations
- [ ] Rate limiting implemented on public forms
- [ ] Audit logging enabled for admin actions
- [ ] HTTPS enforced (Supabase default)
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive information

### Regular Security Audits

- [ ] Review RLS policies quarterly
- [ ] Review admin access logs monthly
- [ ] Update dependencies regularly
- [ ] Scan for vulnerabilities (npm audit)
- [ ] Review failed authentication attempts
- [ ] Check for unusual data access patterns
- [ ] Verify admin email list is current

---

## 🔍 TESTING SECURITY

### Test Authentication
```typescript
// Test 1: Unauthenticated user cannot access protected route
// Expected: Redirect to login

// Test 2: Authenticated user can access protected route
// Expected: Route accessible

// Test 3: Non-admin user cannot access admin route
// Expected: Access denied message

// Test 4: Admin user can access admin route
// Expected: Route accessible
```

### Test RLS Policies
```sql
-- Test 1: User can only view own data
-- Login as user1, try to access user2's data
-- Expected: No results

-- Test 2: Admin can view all data
-- Login as admin, try to access any user's data
-- Expected: All results visible

-- Test 3: Anonymous user can only access public data
-- Not logged in, try to access protected data
-- Expected: No results or error
```

### Test Secrets
```typescript
// Test 1: Public variables accessible in frontend
console.log(appConfig.env.SUPABASE_URL); // Should work

// Test 2: Secret variables NOT accessible in frontend
console.log(appConfig.env.SUPABASE_SERVICE_KEY); // Should be empty or undefined

// Test 3: Secrets accessible in Edge Functions
// In Edge Function:
const serviceKey = Deno.env.get('SERVICE_ROLE_KEY'); // Should work
```

---

## 🚀 COMMON SECURITY TASKS

### Add a New Admin
```bash
# 1. Update environment variable
ADMIN_EMAILS=existing@example.com,newadmin@example.com

# 2. Restart application (or update in Natively dashboard)

# 3. Verify admin access
# Login as new admin and check admin dashboard access
```

### Protect a New Table
```sql
-- 1. Enable RLS
ALTER TABLE your_new_table ENABLE ROW LEVEL SECURITY;

-- 2. Add policies
CREATE POLICY "Users can view their own records"
ON your_new_table FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins have full access"
ON your_new_table FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- 3. Test policies
-- Login as regular user and admin, verify access
```

### Add a New Protected Route
```typescript
// 1. Wrap component with ProtectedRoute
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function YourScreen() {
  return (
    <ProtectedRoute requireEmailVerification={true}>
      <YourComponent />
    </ProtectedRoute>
  );
}

// 2. Test authentication
// Try accessing without login - should redirect
// Try accessing with login - should work
```

### Add a New Admin Route
```typescript
// 1. Wrap component with AdminGuard
import { AdminGuard } from '@/components/AdminGuard';

export default function YourAdminScreen() {
  return (
    <AdminGuard>
      <YourAdminComponent />
    </AdminGuard>
  );
}

// 2. Test admin access
// Try accessing as regular user - should show access denied
// Try accessing as admin - should work
```

---

## 📚 ADDITIONAL RESOURCES

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES_REFERENCE.md)
- [Admin Security Implementation](./ADMIN_SECURITY_IMPLEMENTATION.md)

---

**Questions or Issues?**
Contact: cheikh@universalshipping.com
