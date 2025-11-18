
# Client Dashboard Implementation

## Overview
The client dashboard (`client-dashboard.tsx`) is a protected page that displays personalized information for authenticated users with a client profile.

## Features Implemented

### 1. Authentication & Access Control
- **Authentication Check**: Automatically redirects unauthenticated users to the login page (`client-space`)
- **Client Profile Check**: Displays a message prompting users to complete their profile if no client record exists
- **Automatic Client Creation**: Database trigger automatically creates a client record when a new user signs up

### 2. Welcome Section
Displays personalized greeting with:
- Contact name (or email if contact name is not available)
- Company name
- Country (if defined)
- "Update Profile" button linking to `client-profile` page

### 3. My Subscriptions Section
- Lists all active subscriptions for the client
- Shows plan type (formatted as: Basic, Premium Tracking, Enterprise Logistics, Agent Listing)
- Displays start date and end date (if exists)
- Empty state: Shows message with link to pricing page if no active subscriptions

### 4. My Shipments Section
- Lists shipments filtered by client
- Sorted by creation date (most recent first)
- Displays for each shipment:
  - Tracking number
  - Origin port name
  - Destination port name
  - Current status (with color-coded badge)
  - ETA (if available)
- Clickable cards navigate to `shipment-detail` page with shipment ID
- Empty state: Shows message prompting user to contact support

### 5. Quick Actions Section
- "Request a Quote" button (placeholder for future `freight_quote` page)
- "Contact Support" button (shows email alert)

## Database Structure

### Tables Used
1. **clients**: Stores client profile information
   - Linked to `auth.users` via `user_id`
   - RLS policies ensure users can only view/edit their own profile

2. **subscriptions**: Stores subscription plans
   - Linked to `clients` via `client` field
   - RLS policies ensure users can only view their own subscriptions

3. **shipments**: Stores shipment tracking information
   - Linked to `clients` via `client` field
   - Linked to `ports` for origin and destination
   - RLS policies ensure users can only view their own shipments

### Automatic Client Creation
A database trigger (`handle_new_user`) automatically creates a client record when a user signs up:
- Triggered on INSERT to `auth.users`
- Creates client with:
  - `user_id`: User's ID
  - `company_name`: From metadata or "À renseigner"
  - `contact_name`: From metadata
  - `email`: User's email
  - `is_verified`: false (default)

## RLS Policies

### Clients Table
- Users can SELECT, INSERT, UPDATE, DELETE their own client profile
- Policy: `auth.uid() = user_id`

### Subscriptions Table
- Users can SELECT, INSERT, UPDATE, DELETE their own subscriptions
- Policy: `client IN (SELECT id FROM clients WHERE user_id = auth.uid())`

### Shipments Table
- Users can SELECT, INSERT, UPDATE, DELETE their own shipments
- Policy: `client IN (SELECT id FROM clients WHERE user_id = auth.uid())`

## Navigation Flow

```
User not authenticated → Redirect to client-space (login)
User authenticated but no client profile → Show "Complete Profile" message
User authenticated with client profile → Show full dashboard
```

## UI/UX Features

### Pull-to-Refresh
- Implemented on the main ScrollView
- Refreshes all dashboard data (client, subscriptions, shipments)

### Loading States
- Shows loading spinner while fetching data
- Displays loading text using translations

### Empty States
- Subscriptions: Encourages user to view pricing plans
- Shipments: Encourages user to contact support

### Status Colors
- Delivered: Green (#10b981)
- In Transit/Confirmed: Primary color
- At Port: Orange (#f59e0b)
- On Hold/Cancelled: Red (#ef4444)
- Draft/Quote Pending: Secondary text color

### Responsive Design
- Works on both iOS and Android
- Android: Extra padding at top to avoid notch
- Uses theme colors for light/dark mode support

## Translations
All text is internationalized using the `useLanguage` hook:
- French (fr)
- English (en)
- Spanish (es)
- Arabic (ar)

## Future Enhancements
1. Implement `freight_quote` page for quote requests
2. Add contact page or email integration
3. Add pagination for shipments list
4. Add filters and search for shipments
5. Add real-time notifications for shipment status changes
6. Add subscription management (upgrade/downgrade)
