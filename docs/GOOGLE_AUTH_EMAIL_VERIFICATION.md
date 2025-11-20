
# Google Authentication & Email Verification Implementation

## Overview
This document describes the implementation of Google Sign-In and mandatory email verification for the Universal Shipping Services application.

## Features Implemented

### 1. Google Sign-In Integration

#### Configuration Required
To enable Google Sign-In, you need to configure the following in your Supabase project:

1. **Enable Google Provider in Supabase**
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable the Google provider
   - Add your Google OAuth credentials:
     - Client ID
     - Client Secret

2. **Google Cloud Console Setup**
   - Create a project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://lnfsjpuffrcyenuuoxxk.supabase.co/auth/v1/callback`
     - Your app's custom scheme (e.g., `com.yourapp://auth/callback`)

3. **Environment Variables**
   The following environment variables should be configured in Supabase:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret

#### Implementation Details

**Login Page (`app/(tabs)/login.tsx`)**
- Added "Continuer avec Google" button
- Calls `signInWithGoogle()` from AuthContext
- Opens OAuth flow in WebBrowser
- Handles success/cancel/error states

**AuthContext (`contexts/AuthContext.tsx`)**
- New method: `signInWithGoogle()`
- Uses `expo-web-browser` for OAuth flow
- Automatically creates client record on first login via database trigger
- Stores user's preferred language from app settings

**Database Trigger (`handle_new_user`)**
- Already exists in the database
- Automatically creates a client record when a new user signs up
- Extracts metadata from `raw_user_meta_data`:
  - `full_name` from Google profile
  - `company` (defaults to "To be specified")
  - `preferred_language` (defaults to "en")
  - `email` from auth user

### 2. Email Verification Enforcement

#### Verify Email Page (`app/(tabs)/verify-email.tsx`)
A dedicated page for unverified users with:
- Clear message explaining email verification requirement
- Display of user's email address
- "Renvoyer l'email de vérification" button with 60-second cooldown
- "J'ai vérifié mon email" button to check verification status
- Logout option
- Help section with troubleshooting tips

#### Protected Routes
All sensitive pages now check for email verification:
- `client-dashboard`
- `tracking`
- `shipment-detail`
- `client-profile`
- `digital-portal`
- `freight-quote` (for authenticated users)
- `admin-dashboard`

#### Implementation Details

**AuthContext Updates**
- New method: `isEmailVerified()` - checks if `user.email_confirmed_at` exists
- Returns boolean indicating verification status

**Client Dashboard**
- Redirects to `/verify-email` if user is authenticated but email not verified
- Uses `<Redirect>` component for seamless navigation

**ProtectedRoute Component** (`components/ProtectedRoute.tsx`)
- Reusable wrapper for protected pages
- Checks authentication status
- Optionally checks email verification
- Redirects to appropriate page if checks fail

### 3. Email Verification Flow

1. **User Signs Up**
   - Email/password or Google Sign-In
   - Verification email sent automatically
   - User redirected to login page with success message

2. **User Attempts to Login**
   - If email not verified, login succeeds but...
   - User is redirected to `/verify-email` page
   - Cannot access protected pages until verified

3. **User Verifies Email**
   - Clicks link in verification email
   - Redirected to `https://natively.dev/email-confirmed`
   - Can now access all protected pages

4. **Resend Verification**
   - User can request new verification email
   - 60-second cooldown between requests
   - Uses Supabase `resend()` method

### 4. Google Sign-In Auto-Creation Flow

When a user signs in with Google for the first time:

1. **OAuth Flow Completes**
   - User authenticates with Google
   - Supabase creates auth user record
   - `handle_new_user` trigger fires

2. **Client Record Created**
   - Trigger extracts data from Google profile
   - Creates record in `clients` table:
     ```sql
     user_id: auth.users.id
     company_name: "To be specified"
     contact_name: Google display name
     email: Google email
     preferred_language: Current app language (default: "en")
     ```

3. **User Redirected**
   - If email verified by Google: → client-dashboard
   - If email not verified: → verify-email page

## Configuration Checklist

### Supabase Configuration
- [ ] Enable Google provider in Authentication settings
- [ ] Add Google Client ID and Secret
- [ ] Configure redirect URLs
- [ ] Verify `handle_new_user` trigger exists
- [ ] Test email verification emails are being sent

### App Configuration
- [ ] Update `app.json` with custom URL scheme
- [ ] Test OAuth redirect flow on iOS
- [ ] Test OAuth redirect flow on Android
- [ ] Test OAuth redirect flow on Web

### Testing Checklist
- [ ] Email/password signup with verification
- [ ] Google Sign-In with new account
- [ ] Google Sign-In with existing account
- [ ] Resend verification email
- [ ] Access protected pages without verification
- [ ] Access protected pages after verification
- [ ] Logout and re-login flow

## Security Considerations

1. **Email Verification Required**
   - All sensitive pages check for verified email
   - Prevents unauthorized access with unverified accounts

2. **OAuth Security**
   - Uses PKCE flow for mobile apps
   - Secure token storage with AsyncStorage
   - Auto-refresh tokens

3. **Client Record Creation**
   - Automatic via database trigger
   - Prevents duplicate records (user_id is unique)
   - Secure with RLS policies

## Troubleshooting

### Google Sign-In Not Working
1. Check Google Cloud Console credentials
2. Verify redirect URIs are correct
3. Check Supabase logs for errors
4. Ensure Google+ API is enabled

### Email Verification Not Sending
1. Check Supabase email settings
2. Verify SMTP configuration
3. Check spam folder
4. Test with different email providers

### Client Record Not Created
1. Check `handle_new_user` trigger exists
2. Verify trigger is enabled
3. Check Supabase logs for errors
4. Ensure `clients` table has correct schema

## API Reference

### AuthContext Methods

```typescript
// Sign in with Google
const { error } = await signInWithGoogle();

// Check if email is verified
const verified = isEmailVerified();

// Resend verification email
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: user.email,
  options: {
    emailRedirectTo: 'https://natively.dev/email-confirmed',
  },
});
```

### ProtectedRoute Component

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute requireEmailVerification={true}>
      {/* Your page content */}
    </ProtectedRoute>
  );
}
```

## Future Enhancements

1. **Social Login Providers**
   - Add Facebook, Apple, GitHub, etc.
   - Unified social login UI

2. **Email Verification Improvements**
   - Magic link login (passwordless)
   - SMS verification as alternative
   - Email verification reminder notifications

3. **Account Linking**
   - Link multiple OAuth providers to one account
   - Merge accounts with same email

4. **Enhanced Security**
   - Two-factor authentication (2FA)
   - Biometric authentication
   - Session management dashboard
