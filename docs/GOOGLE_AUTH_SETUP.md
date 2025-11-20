
# Google Authentication Setup Guide

This guide explains how to configure Google Sign-In for the Universal Shipping Services (3S Global) application.

## Prerequisites

1. A Google Cloud Platform account
2. Access to the Supabase project dashboard
3. The application's bundle ID (iOS) and package name (Android)

## Step 1: Configure Google Cloud Platform

### 1.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**

### 1.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - App name: **Universal Shipping Services**
   - User support email: Your support email
   - Developer contact information: Your contact email
4. Add the following scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Save and continue

### 1.3 Create OAuth Client IDs

#### For Web (Required for Expo/React Native)
1. Click **Create Credentials** > **OAuth client ID**
2. Application type: **Web application**
3. Name: **Universal Shipping Services - Web**
4. Authorized JavaScript origins:
   - `https://lnfsjpuffrcyenuuoxxk.supabase.co`
   - `http://localhost:8081` (for local development)
5. Authorized redirect URIs:
   - `https://lnfsjpuffrcyenuuoxxk.supabase.co/auth/v1/callback`
6. Click **Create** and save the **Client ID**

#### For Android (Optional - for native Google Sign-In)
1. Click **Create Credentials** > **OAuth client ID**
2. Application type: **Android**
3. Name: **Universal Shipping Services - Android**
4. Package name: Your Android package name (e.g., `com.universalshipping.app`)
5. SHA-1 certificate fingerprint:
   - For development: Get from `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - For production: Get from your release keystore
6. Click **Create**

#### For iOS (Optional - for native Google Sign-In)
1. Click **Create Credentials** > **OAuth client ID**
2. Application type: **iOS**
3. Name: **Universal Shipping Services - iOS**
4. Bundle ID: Your iOS bundle identifier (e.g., `com.universalshipping.app`)
5. Click **Create**

## Step 2: Configure Supabase

### 2.1 Enable Google Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **lnfsjpuffrcyenuuoxxk**
3. Navigate to **Authentication** > **Providers**
4. Find **Google** and click to configure
5. Enable the provider
6. Enter the **Web Client ID** from Step 1.3
7. Enter the **Web Client Secret** from Step 1.3
8. Save the configuration

### 2.2 Configure Redirect URLs

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add the following redirect URLs:
   - `https://natively.dev/email-confirmed` (for email verification)
   - `exp://localhost:8081` (for local development)
   - Your production app URL scheme

## Step 3: Configure Environment Variables

Add the following environment variable to your project:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
```

### For Local Development

Create or update `.env.local`:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
```

### For Production

Set the environment variable in your deployment platform (e.g., Vercel, Netlify, etc.)

## Step 4: Test the Integration

### 4.1 Test Email/Password Sign-Up

1. Open the app and navigate to the signup page
2. Create a new account with email and password
3. Check your email for the verification link
4. Click the verification link
5. Return to the app and log in

### 4.2 Test Google Sign-In

1. Open the app and navigate to the login page
2. Click "Continuer avec Google"
3. Select your Google account
4. Grant the requested permissions
5. You should be redirected back to the app and logged in
6. Verify that a client record was created automatically

### 4.3 Test Email Verification Enforcement

1. Create a new account (email/password or Google)
2. Without verifying the email, try to access:
   - Client Dashboard
   - Digital Portal
   - Shipment Details
   - Client Profile
3. You should be redirected to the verify-email page
4. Test the "Renvoyer l'email de vérification" button
5. Verify your email and confirm you can now access protected pages

## Troubleshooting

### Google Sign-In Not Working

1. **Check Client ID**: Ensure the `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` environment variable is set correctly
2. **Check Redirect URIs**: Verify that all redirect URIs are configured in Google Cloud Console
3. **Check Supabase Configuration**: Ensure the Google provider is enabled in Supabase with the correct credentials
4. **Check Console Logs**: Look for error messages in the browser console or React Native debugger

### Email Verification Not Working

1. **Check Email Settings**: Verify that email sending is configured in Supabase
2. **Check Spam Folder**: The verification email might be in the spam folder
3. **Check Redirect URL**: Ensure `https://natively.dev/email-confirmed` is configured as a redirect URL
4. **Check User Status**: In Supabase Dashboard, check if the user's `email_confirmed_at` field is set

### Client Record Not Created

1. **Check Database Trigger**: Verify that the `handle_new_user()` trigger is active
2. **Check Function Code**: Review the trigger function in Supabase SQL Editor
3. **Check Logs**: Look for errors in Supabase logs
4. **Manual Creation**: If needed, manually create a client record for testing

## Security Best Practices

1. **Never commit credentials**: Keep your Client ID and Client Secret secure
2. **Use environment variables**: Always use environment variables for sensitive data
3. **Restrict OAuth scopes**: Only request the minimum required scopes
4. **Verify email addresses**: Always enforce email verification for sensitive operations
5. **Monitor authentication logs**: Regularly check Supabase logs for suspicious activity

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Expo Authentication](https://docs.expo.dev/guides/authentication/)

## Support

If you encounter any issues, please contact the development team or refer to the project's issue tracker.
