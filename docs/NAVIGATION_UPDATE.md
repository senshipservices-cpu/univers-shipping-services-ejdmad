
# Navigation Update - Authentication-Based Navigation

## Overview
The main navigation has been updated to display different links based on the user's authentication status, as requested.

## Navigation Structure

### For Unauthenticated Users
The navigation bar displays the following links:
- **Accueil** - Home page (/(tabs)/(home)/)
- **Services** - Global services page (/(tabs)/global-services)
- **Ports** - Port coverage page (/(tabs)/port-coverage)
- **Pricing** - Pricing plans page (/(tabs)/pricing)
- **Devenir agent** - Become an agent page (/(tabs)/become-agent)
- **Connexion** - Login/Registration page (/(tabs)/client-space)

### For Authenticated Users
The navigation bar displays the following links:
- **Accueil** - Home page (/(tabs)/(home)/)
- **Services** - Global services page (/(tabs)/global-services)
- **Ports** - Port coverage page (/(tabs)/port-coverage)
- **Pricing** - Pricing plans page (/(tabs)/pricing)
- **Devenir agent** - Become an agent page (/(tabs)/become-agent)
- **Mon espace** - Client dashboard (/(tabs)/client-dashboard)

### Logout Functionality
When a user is authenticated, they can log out by:
1. Navigating to **Mon espace** (client dashboard)
2. Clicking the logout button in the top-right corner of the header
3. Confirming the logout action in the alert dialog

The logout button is represented by a logout icon and triggers a confirmation dialog before signing the user out.

## Protected Routes

The following pages are protected and require authentication:

### 1. Client Dashboard (/(tabs)/client-dashboard)
- **Access**: Requires authentication
- **Redirect**: Unauthenticated users are automatically redirected to the login page (/(tabs)/client-space)
- **Features**:
  - Personalized greeting with client information
  - Active subscriptions list
  - Shipments tracking list
  - Quick actions (request quote, contact support)
  - Logout button in header

### 2. Shipment Detail (/(tabs)/shipment-detail)
- **Access**: Requires authentication
- **Redirect**: Unauthenticated users are automatically redirected to the login page
- **Security**: Verifies that the shipment belongs to the logged-in user's client
- **Features**:
  - Detailed shipment information
  - Route visualization (origin → destination)
  - Status tracking
  - Client-visible notes
  - Placeholder for future shipment history

### 3. Client Profile (/(tabs)/client-profile)
- **Access**: Requires authentication
- **Redirect**: Unauthenticated users are automatically redirected to the login page
- **Features**:
  - Edit company information
  - Edit contact details
  - Edit location information
  - Account verification status badge
  - Save changes functionality

## Implementation Details

### Authentication Context
The `AuthContext` provides:
- `user` - Current authenticated user object (null if not authenticated)
- `client` - Current client profile data
- `signIn()` - Login function
- `signUp()` - Registration function
- `signOut()` - Logout function
- `loading` - Loading state during authentication checks

### Navigation Layout Files
- **app/(tabs)/_layout.tsx** - Android/Web navigation using FloatingTabBar
- **app/(tabs)/_layout.ios.tsx** - iOS navigation using NativeTabs

Both files use the `useAuth()` hook to conditionally render navigation items based on authentication status.

### Redirect Implementation
Protected pages use the `Redirect` component from `expo-router`:

```typescript
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedPage() {
  const { user } = useAuth();
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/client-space" />;
  }
  
  // ... rest of the component
}
```

## User Flow

### Login Flow
1. User clicks "Connexion" in navigation
2. User enters email and password
3. On successful login:
   - User is automatically redirected to client dashboard
   - Navigation updates to show "Mon espace" instead of "Connexion"
   - User can access all protected pages

### Registration Flow
1. User clicks "Connexion" in navigation
2. User switches to registration mode
3. User enters company name, email, and password
4. On successful registration:
   - User receives email verification link
   - Alert prompts user to verify email before logging in
   - User must verify email and then log in

### Logout Flow
1. User navigates to "Mon espace" (client dashboard)
2. User clicks logout button in header
3. Confirmation dialog appears
4. On confirmation:
   - User is signed out
   - Navigation updates to show "Connexion" instead of "Mon espace"
   - User is redirected to home page
   - All protected pages become inaccessible

## Security Features

### Row Level Security (RLS)
All database tables implement RLS policies to ensure:
- Users can only access their own client data
- Users can only view shipments belonging to their client
- Users can only modify their own profile information

### Client Verification
The `shipment-detail` page includes additional security:
- Verifies that the shipment's client ID matches the logged-in user's client ID
- Displays "Access Denied" message if verification fails
- Automatically redirects unauthorized users to the dashboard

### Email Verification
New users must verify their email address before they can log in:
- Email verification link is sent during registration
- Login attempts with unverified email will fail
- Clear error messages guide users to verify their email

## Testing

To test the navigation updates:

1. **Test Unauthenticated Navigation**:
   - Open the app without logging in
   - Verify navigation shows: Accueil, Services, Ports, Pricing, Devenir agent, Connexion
   - Try to access protected pages directly (should redirect to login)

2. **Test Authentication**:
   - Click "Connexion"
   - Register a new account or log in with existing credentials
   - Verify email if registering

3. **Test Authenticated Navigation**:
   - After login, verify navigation shows: Accueil, Services, Ports, Pricing, Devenir agent, Mon espace
   - Click "Mon espace" to access client dashboard
   - Verify all dashboard features work correctly

4. **Test Protected Pages**:
   - Navigate to client dashboard
   - Click on a shipment to view details
   - Click "Mettre à jour mon profil" to edit profile
   - Verify all pages load correctly

5. **Test Logout**:
   - Click logout button in dashboard header
   - Confirm logout in dialog
   - Verify navigation updates to show "Connexion"
   - Verify protected pages are no longer accessible

## Notes

- The logout button is intentionally placed in the client dashboard header rather than in the main navigation to keep the navigation clean and consistent
- All authentication state is managed globally through the `AuthContext`
- Navigation automatically updates when authentication state changes
- Protected pages use the `Redirect` component for immediate redirection
- The `client-space` page automatically redirects authenticated users to the dashboard
