
# Authentication System Implementation

## Overview

The Universal Shipping Services app now has a complete authentication system with:

- **Email + Password authentication** via Supabase Auth
- **Email verification** required before full access
- **Automatic client profile creation** upon email verification
- **Secure login/signup screens** with proper validation

## Database Schema

### Clients Table

The `clients` table stores user profile information and is automatically populated when a user signs up and verifies their email.

**Schema:**
```sql
clients (
  id: uuid (primary key)
  user_id: uuid (unique, foreign key to auth.users)
  full_name: text (nullable)
  company: text (nullable)
  phone: text (nullable)
  email: text (nullable)
  country: text (nullable)
  preferred_language: text (default 'fr')
  is_verified: boolean (default false)
  created_at: timestamp (default now())
  updated_at: timestamp (default now())
  
  -- Legacy fields for backward compatibility
  company_name: text
  contact_name: text
)
```

## Database Migration Required

**IMPORTANT:** You need to apply the following SQL migration in your Supabase dashboard:

```sql
-- Update clients table to match new requirements
-- Rename contact_name to full_name
ALTER TABLE clients RENAME COLUMN contact_name TO full_name;

-- Ensure preferred_language has default 'fr'
ALTER TABLE clients ALTER COLUMN preferred_language SET DEFAULT 'fr';

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Create a function to automatically create client record on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_metadata JSONB;
  user_full_name TEXT;
  user_company TEXT;
BEGIN
  -- Get user email and metadata
  user_email := NEW.email;
  user_metadata := NEW.raw_user_meta_data;
  
  -- Extract full_name from metadata
  user_full_name := COALESCE(
    user_metadata->>'full_name',
    user_metadata->>'contact_name',
    user_metadata->>'name',
    ''
  );
  
  -- Extract company from metadata
  user_company := COALESCE(
    user_metadata->>'company',
    user_metadata->>'company_name',
    'À renseigner'
  );
  
  -- Create client record
  INSERT INTO public.clients (
    user_id,
    full_name,
    company_name,
    email,
    preferred_language,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_full_name,
    user_company,
    user_email,
    COALESCE(user_metadata->>'preferred_language', 'fr'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create client record when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create a function to update client verification status when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.clients
    SET 
      is_verified = true,
      updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update verification status when email is confirmed
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_user_email_confirmed();

-- Update RLS policies for clients table
DROP POLICY IF EXISTS "Users can view their own client profile" ON clients;
DROP POLICY IF EXISTS "Users can update their own client profile" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON clients;
DROP POLICY IF EXISTS "Service role can insert clients" ON clients;

-- Ensure RLS is enabled
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own client profile"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own client profile"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all clients
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE user_id = auth.uid()
      AND (is_super_admin = true OR admin_option = true)
    )
  );

-- Admins can update all clients
CREATE POLICY "Admins can update all clients"
  ON clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE user_id = auth.uid()
      AND (is_super_admin = true OR admin_option = true)
    )
  );

-- Service role can insert clients (for the trigger)
CREATE POLICY "Service role can insert clients"
  ON clients FOR INSERT
  WITH CHECK (true);
```

## How It Works

### 1. User Registration Flow

1. User fills out the signup form with:
   - Email (required)
   - Password (required, min 6 characters)
   - Full name (optional)
   - Company (optional)
   - Phone (optional)

2. The app calls `signUp()` with user metadata

3. Supabase sends a verification email to the user

4. Database trigger creates a client record with `is_verified = false`

5. User receives success message and is redirected to login

### 2. Email Verification Flow

1. User clicks the verification link in their email

2. Supabase confirms the email

3. Database trigger updates `is_verified = true` in the clients table

4. User can now log in

### 3. Login Flow

1. User enters email and password

2. App validates credentials with Supabase

3. If email is not verified, user sees an error message

4. If successful, user is redirected to client dashboard

5. AuthContext fetches the client profile and loads preferred language

## Authentication Screens

### Login Screen (`app/(tabs)/login.tsx`)

- Email and password inputs with validation
- Show/hide password toggle
- Forgot password link (contacts support)
- Link to signup screen
- Proper error handling with user-friendly messages

### Signup Screen (`app/(tabs)/signup.tsx`)

- Full name, company, phone (optional)
- Email and password (required)
- Password confirmation
- Show/hide password toggles
- Form validation
- Success message with email verification reminder
- Link to login screen

## AuthContext Updates

The `AuthContext` has been updated to:

- Accept metadata during signup (full_name, company, phone, preferred_language)
- Properly handle email verification errors
- Fetch client profile after successful login
- Load user's preferred language from their profile
- Log authentication events

## Security Features

### Row Level Security (RLS)

- Users can only view and update their own profile
- Admins can view and update all profiles
- Service role can insert new client records (for triggers)

### Email Verification

- Users must verify their email before logging in
- Verification status is tracked in the `is_verified` field
- Clear error messages guide users through the process

### Password Requirements

- Minimum 6 characters
- Validated on both client and server side

## Testing

### Test the Signup Flow

1. Navigate to the signup screen
2. Fill out the form with test data
3. Submit the form
4. Check your email for the verification link
5. Click the verification link
6. Try to log in with your credentials

### Test the Login Flow

1. Navigate to the login screen
2. Try to log in without verifying email (should fail)
3. Verify your email
4. Log in successfully
5. Verify that your profile data is loaded correctly

## Configuration

### Supabase Email Settings

Make sure your Supabase project has email authentication enabled:

1. Go to Authentication > Providers in Supabase dashboard
2. Enable Email provider
3. Configure email templates if needed
4. Set the redirect URL to: `https://natively.dev/email-confirmed`

### Environment Variables

The app uses the following Supabase configuration:

```typescript
SUPABASE_URL = "https://lnfsjpuffrcyenuuoxxk.supabase.co"
SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

These are already configured in `app/integrations/supabase/client.ts`.

## Troubleshooting

### "Email not confirmed" error

- User needs to check their email and click the verification link
- Check spam folder if email is not received
- Resend verification email from Supabase dashboard if needed

### Client profile not created

- Check that the database triggers are properly installed
- Verify RLS policies allow the service role to insert
- Check Supabase logs for any errors

### Login fails after email verification

- Clear app cache and try again
- Check that the user's email_confirmed_at field is set in auth.users
- Verify that is_verified is true in the clients table

## Next Steps

1. **Apply the database migration** in your Supabase dashboard
2. **Test the authentication flow** with a real email address
3. **Configure email templates** in Supabase for better branding
4. **Add password reset functionality** (currently shows contact support message)
5. **Add social login providers** if needed (Google, Apple, etc.)

## Related Files

- `app/(tabs)/login.tsx` - Login screen
- `app/(tabs)/signup.tsx` - Signup screen
- `contexts/AuthContext.tsx` - Authentication context and logic
- `app/integrations/supabase/client.ts` - Supabase client configuration
- `app/integrations/supabase/types.ts` - TypeScript types for database schema
