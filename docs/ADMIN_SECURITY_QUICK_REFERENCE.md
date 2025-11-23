
# Admin Security - Quick Reference

## Quick Setup

### 1. Add Admin Emails

**Natively:**
```
ADMIN_EMAILS=cheikh@universalshipping.com,admin@uss.com
```

**Supabase:**
```sql
ALTER DATABASE postgres SET app.admin_emails = 'cheikh@universalshipping.com,admin@uss.com';
```

### 2. Check Admin Status

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { currentUserIsAdmin } = useAuth();

if (currentUserIsAdmin) {
  // Show admin features
}
```

### 3. Protect a Page

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      {/* Admin content */}
    </ProtectedRoute>
  );
}
```

### 4. Check Any Email

```typescript
import appConfig from '@/config/appConfig';

if (appConfig.isAdmin('someone@example.com')) {
  // Email is admin
}
```

## Protected Resources

### Pages
- ✅ `/admin-dashboard` - Admin Dashboard
- ✅ `/kpi-dashboard` - KPI Analytics
- ✅ `ConfigStatus` component (dev only)

### Database Fields
- ✅ `global_agents.status` - Agent validation
- ✅ `subscriptions.is_active` - Subscription activation
- ✅ `shipments.current_status` - Shipment status

## Common Patterns

### Conditional Rendering

```typescript
const { currentUserIsAdmin } = useAuth();

return (
  <View>
    {currentUserIsAdmin && (
      <TouchableOpacity onPress={handleAdminAction}>
        <Text>Admin Action</Text>
      </TouchableOpacity>
    )}
  </View>
);
```

### Protected Action

```typescript
const { currentUserIsAdmin } = useAuth();

const handleSensitiveAction = async () => {
  if (!currentUserIsAdmin) {
    Alert.alert('Accès refusé', 'Action réservée aux administrateurs');
    return;
  }
  
  // Perform admin action
  await supabase
    .from('global_agents')
    .update({ status: 'validated' })
    .eq('id', agentId);
};
```

### Navigation Guard

```typescript
const { currentUserIsAdmin } = useAuth();
const router = useRouter();

useEffect(() => {
  if (!currentUserIsAdmin) {
    router.push('/(tabs)/(home)/');
  }
}, [currentUserIsAdmin]);
```

## Testing

### Test Admin Access

```bash
# 1. Set admin email
ADMIN_EMAILS=test@admin.com

# 2. Log in with test@admin.com
# 3. Navigate to /admin-dashboard
# 4. Should see admin features
```

### Test Non-Admin

```bash
# 1. Log in with non-admin email
# 2. Navigate to /admin-dashboard
# 3. Should see "Access Denied"
```

### Test RLS

```sql
-- As admin
SET request.jwt.claims = '{"email": "admin@uss.com"}';
UPDATE global_agents SET status = 'validated' WHERE id = '<id>';
-- ✅ Should succeed

-- As client
SET request.jwt.claims = '{"email": "client@example.com"}';
UPDATE global_agents SET status = 'validated' WHERE id = '<id>';
-- ❌ Should fail
```

## Troubleshooting

### Admin can't access admin pages

```typescript
// Check admin status
console.log('User:', user?.email);
console.log('Is Admin:', currentUserIsAdmin);
console.log('Admin Emails:', appConfig.env.ADMIN_EMAILS);
```

### RLS not working

```sql
-- Check database setting
SHOW app.admin_emails;

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test function
SELECT is_admin_user();
```

### Emails not matching

```typescript
// Normalize and compare
const userEmail = user?.email?.trim().toLowerCase();
const adminEmails = appConfig.env.ADMIN_EMAILS.map(e => e.trim().toLowerCase());
console.log('Match:', adminEmails.includes(userEmail));
```

## API Reference

### `appConfig.isAdmin(email)`

Check if an email is an admin.

```typescript
appConfig.isAdmin('test@example.com') // boolean
```

### `currentUserIsAdmin`

Boolean indicating if current user is admin.

```typescript
const { currentUserIsAdmin } = useAuth();
```

### `<ProtectedRoute>`

Component to protect routes.

```typescript
<ProtectedRoute requireAdmin={true}>
  <AdminContent />
</ProtectedRoute>
```

### `is_admin_user()`

SQL function to check admin status.

```sql
SELECT is_admin_user(); -- boolean
```

## Environment Variables

### Required

```bash
# Natively
ADMIN_EMAILS=email1@example.com,email2@example.com

# Supabase
app.admin_emails = 'email1@example.com,email2@example.com'
```

### Format

- Comma-separated
- No spaces
- Case-insensitive
- Must match Supabase Auth emails exactly

## Security Checklist

- [ ] `ADMIN_EMAILS` set in Natively
- [ ] `app.admin_emails` set in Supabase
- [ ] Both lists are identical
- [ ] Admin pages protected with `ProtectedRoute`
- [ ] Sensitive actions check `currentUserIsAdmin`
- [ ] RLS policies in place
- [ ] Tested with admin and non-admin users

---

**For detailed documentation, see:**
- `docs/ADMIN_SECURITY_IMPLEMENTATION.md`
- `docs/NATIVELY_ENVIRONMENT_SETUP.md`
