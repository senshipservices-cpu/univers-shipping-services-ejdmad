
# Automatic Client Creation Workflow

## Overview

This document describes the automatic client creation workflow that triggers when a new user signs up in the Univers Shipping Services application.

## How It Works

### 1. Triggering Event

When a new user creates an account (signs up), a database trigger is automatically fired.

### 2. Database Trigger

**Trigger Name:** `on_auth_user_created`

**Function:** `handle_new_user()`

**Location:** Supabase database (public schema)

The trigger executes **AFTER INSERT** on the `auth.users` table.

### 3. Workflow Logic

The `handle_new_user()` function performs the following steps:

1. **Check for Existing Client:**
   - Queries the `clients` table to see if a record already exists for the new user
   - Uses `user_id = NEW.id` to find existing records

2. **Create Client Record (if none exists):**
   - If no client record exists, creates a new one with:
     - `user_id` = the new user's ID
     - `company_name` = from signup metadata or "À renseigner" (default)
     - `contact_name` = from signup metadata (contact_name, full_name, or name)
     - `email` = the user's email address
     - `country` = NULL (empty)
     - `city` = NULL (empty)
     - `is_verified` = false
     - `created_at` = current timestamp

3. **Skip if Client Exists:**
   - If a client record already exists for the user, the function does nothing
   - This prevents duplicate client records

## Implementation Details

### Database Function

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_client_count INTEGER;
BEGIN
  -- Check if a client record already exists for this user
  SELECT COUNT(*) INTO existing_client_count
  FROM public.clients
  WHERE user_id = NEW.id;

  -- Only create a client record if one doesn't exist
  IF existing_client_count = 0 THEN
    INSERT INTO public.clients (
      user_id,
      company_name,
      contact_name,
      email,
      country,
      city,
      is_verified,
      created_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'À renseigner'),
      COALESCE(
        NEW.raw_user_meta_data->>'contact_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name'
      ),
      NEW.email,
      NULL,
      NULL,
      false,
      NOW()
    );
    
    RAISE NOTICE 'Created client record for user %', NEW.id;
  ELSE
    RAISE NOTICE 'Client record already exists for user %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;
```

### Application Code

#### AuthContext

The `AuthContext` has been updated to:

- Accept optional metadata during signup (companyName, contactName)
- Automatically fetch the client record after authentication
- Provide a `refreshClient()` function to reload client data

#### Usage Example

```typescript
import { useAuth } from '@/contexts/AuthContext';

function SignUpForm() {
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    const { error } = await signUp(
      'user@example.com',
      'password123',
      {
        companyName: 'My Company',
        contactName: 'John Doe'
      }
    );

    if (!error) {
      // Client record was automatically created!
      alert('Please verify your email to complete registration');
    }
  };
}
```

## Testing

A test page has been created at `app/(tabs)/test-signup.tsx` to demonstrate and test the workflow.

To test:

1. Navigate to the test signup page
2. Enter email, password, and optional company/contact name
3. Click "Sign Up"
4. Check your email for verification
5. After verification and login, the client record will be displayed

## Security

- **Row Level Security (RLS):** The `clients` table has RLS enabled
- **Policies:** Users can only view and update their own client records
- **Trigger Security:** The function runs with `SECURITY DEFINER` to ensure it has permission to insert into the clients table

## Maintenance

### Checking the Trigger

To verify the trigger is active:

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';
```

### Viewing the Function

To see the function definition:

```sql
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### Checking Client Records

To see all client records:

```sql
SELECT id, user_id, company_name, contact_name, email, is_verified, created_at 
FROM clients 
ORDER BY created_at DESC;
```

## Notes

- The trigger fires automatically - no manual intervention needed
- Client records are created even if the user hasn't verified their email yet
- The `is_verified` field can be updated later through the client profile page
- If signup metadata is not provided, sensible defaults are used
