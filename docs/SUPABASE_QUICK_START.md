
# 🚀 Supabase Quick Start Guide

## ✅ Configuration Status

Your Supabase environment variables are **CONFIGURED** and ready to use!

```
✓ EXPO_PUBLIC_SUPABASE_URL: https://lnfsjpuffrcyenuuoxxk.supabase.co
✓ EXPO_PUBLIC_SUPABASE_ANON_KEY: Configured
```

---

## 📦 Using Supabase in Your App

### Import the Client

```typescript
import { supabase } from '@/integrations/supabase/client';
```

### Common Operations

#### 1. Authentication

```typescript
// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  options: {
    emailRedirectTo: 'https://natively.dev/email-confirmed'
  }
});

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123',
});

// Sign Out
await supabase.auth.signOut();

// Get Current User
const { data: { user } } = await supabase.auth.getUser();
```

#### 2. Database Operations

```typescript
// Select
const { data, error } = await supabase
  .from('your_table')
  .select('*')
  .eq('column', 'value');

// Insert
const { data, error } = await supabase
  .from('your_table')
  .insert({ column1: 'value1', column2: 'value2' });

// Update
const { data, error } = await supabase
  .from('your_table')
  .update({ column: 'new_value' })
  .eq('id', 'some_id');

// Delete
const { data, error } = await supabase
  .from('your_table')
  .delete()
  .eq('id', 'some_id');
```

#### 3. Storage

```typescript
// Upload File
const { data, error } = await supabase.storage
  .from('bucket_name')
  .upload('path/to/file.jpg', file);

// Download File
const { data, error } = await supabase.storage
  .from('bucket_name')
  .download('path/to/file.jpg');

// Get Public URL
const { data } = supabase.storage
  .from('bucket_name')
  .getPublicUrl('path/to/file.jpg');
```

#### 4. Real-time Subscriptions

```typescript
// Subscribe to changes
const subscription = supabase
  .channel('table_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'your_table' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

---

## 🛡️ Security: Row Level Security (RLS)

Always enable RLS on your tables to protect user data:

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own data
CREATE POLICY "Users can insert own data"
  ON your_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON your_table FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own data
CREATE POLICY "Users can delete own data"
  ON your_table FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔍 Debugging

### Check Configuration

```typescript
import appConfig from '@/config/appConfig';

// Validate configuration
const validation = appConfig.validateConfig();
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);
console.log('Warnings:', validation.warnings);

// Check Supabase URL
console.log('Supabase URL:', appConfig.env.SUPABASE_URL);
```

### View ConfigStatus Component

In development mode, the `ConfigStatus` component automatically appears at the top of your home screen. Tap it to expand and see all configuration details.

### Console Logs

Look for these logs on app startup:

```
✓ Supabase configuration validated
✓ Initializing Supabase client...
✓ Supabase client initialized successfully
```

---

## 📚 Next Steps

1. **Create your database tables** in Supabase Dashboard
2. **Enable RLS policies** for security
3. **Implement authentication** in your app
4. **Build features** using Supabase queries

---

## 🆘 Need Help?

- **Supabase Dashboard**: https://supabase.com/dashboard/project/lnfsjpuffrcyenuuoxxk
- **Supabase Docs**: https://supabase.com/docs
- **Full Setup Guide**: `docs/SUPABASE_ENVIRONMENT_SETUP_COMPLETE.md`
- **Environment Variables**: `docs/ENVIRONMENT_VARIABLES_REFERENCE.md`

---

**Project ID**: `lnfsjpuffrcyenuuoxxk`  
**Status**: ✅ Ready to Use
